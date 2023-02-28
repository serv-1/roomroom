import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import onlineMember from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

describe("onlineMember()", () => {
  it("rejects if the given data are invalid", async () => {
    await expect(
      onlineMember({} as Server<WebSocket>, {} as WebSocket, "oh no"),
    ).rejects.toThrow();
  });

  it("rejects if the new online member is already online", async () => {
    const ws = { roomId: 0, userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      onlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Already online");
  });

  it("rejects if the new online member is not the signed in user", async () => {
    const ws = { userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 2 };

    await expect(
      onlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Forbidden");
  });

  it("rejects if the room does not exist", async () => {
    query.mockResolvedValue({ rows: [] } as unknown as QueryResult);

    const ws = { userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      onlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Room not found");

    expect(query.mock.calls[0][1]).toStrictEqual([data.roomId]);
  });

  it("rejects if the user is not a member of the room", async () => {
    query
      .mockResolvedValue({ rows: [] } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: [{}] } as unknown as QueryResult);

    const ws = { userId: 1 } as WebSocket;
    const data = { roomId: 0, userId: 1 };

    await expect(
      onlineMember({} as Server<WebSocket>, ws, data),
    ).rejects.toThrow("Member not found");

    expect(query).toHaveBeenNthCalledWith(
      2,
      `SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`,
      [data.userId, data.roomId],
    );

    expect(query.mock.calls[1][1]).toStrictEqual([data.userId, data.roomId]);
  });

  it("sends the new online member's id to each client connected to the room", async () => {
    query.mockResolvedValue({ rows: [{}] } as unknown as QueryResult);

    const ws1 = { roomId: 1, send: jest.fn() } as unknown as WebSocket;
    const ws2 = { roomId: 0, send: jest.fn() } as unknown as WebSocket;

    const ws = { userId: 1, send: jest.fn() } as unknown as WebSocket;
    const wss = { clients: new Set([ws1, ws2, ws]) } as Server<WebSocket>;
    const data = { roomId: 0, userId: 1 };

    await onlineMember(wss, ws, data);

    const msg = JSON.stringify({
      event: "onlineMember",
      data: { id: ws.userId },
    });

    expect(ws1.send).not.toHaveBeenCalled();
    expect(ws2.send).toHaveBeenNthCalledWith(1, msg);
    expect(ws.send).toHaveBeenNthCalledWith(1, msg);
  });
});
