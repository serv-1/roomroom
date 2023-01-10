import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import offlineMember from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

describe("offlineMember()", () => {
  it("rejects if the given data are invalid", async () => {
    await expect(
      offlineMember({} as Server<WebSocket>, {} as WebSocket, "oh no"),
    ).rejects.toThrow();
  });

  it("rejects if the new offline member is already offline", async () => {
    const ws = { userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      offlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Already offline");
  });

  it("rejects if the new offline member is not the signed in user", async () => {
    const ws = { roomId: 0, userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 2 };

    await expect(
      offlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Forbidden");
  });

  it("rejects if the room does not exist", async () => {
    query.mockResolvedValue({ rows: [] } as unknown as QueryResult);

    const ws = { roomId: 0, userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      offlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Room not found");

    expect(query).toHaveBeenNthCalledWith(
      1,
      "SELECT id FROM rooms WHERE id=$1",
      [data.roomId],
    );
  });

  it("rejects if the user is not a member of the room", async () => {
    query
      .mockResolvedValue({ rows: [] } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: [{}] } as unknown as QueryResult);

    const ws = { roomId: 0, userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      offlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Member not found");

    expect(query).toHaveBeenNthCalledWith(
      2,
      "SELECT id FROM members WHERE user_id=$1 AND room_id=$2",
      [data.userId, data.roomId],
    );
  });

  it("sends the new offline member's id to each client connected to the room", async () => {
    query.mockResolvedValue({ rows: [{}] } as unknown as QueryResult);

    const ws1 = { roomId: 1, send: jest.fn() } as unknown as WebSocket;
    const ws2 = { roomId: 0, send: jest.fn() } as unknown as WebSocket;

    const ws = {
      roomId: 0,
      userId: 1,
      send: jest.fn(),
    } as unknown as WebSocket;
    const wss = { clients: new Set([ws1, ws2, ws]) } as Server<WebSocket>;
    const data = { roomId: 0, userId: 1 };

    await offlineMember(wss, ws, data);

    const msg = JSON.stringify({
      event: "offlineMember",
      data: { id: ws.userId },
    });

    expect(ws1.send).not.toHaveBeenCalled();
    expect(ws2.send).toHaveBeenNthCalledWith(1, msg);
    expect(ws.send).toHaveBeenNthCalledWith(1, msg);
  });
});
