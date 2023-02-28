import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import banMember from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

describe("banMember()", () => {
  it("rejects if the given data are invalid", async () => {
    await expect(
      banMember({} as Server<WebSocket>, {} as WebSocket, "oh no"),
    ).rejects.toThrow();
  });

  it("rejects if the signed in user is not online", async () => {
    await expect(
      banMember({} as Server<WebSocket>, {} as WebSocket, { id: 0 }),
    ).rejects.toThrow("Forbidden");
  });

  it("rejects if the user to ban is the creator of the room", async () => {
    await expect(
      banMember(
        {} as Server<WebSocket>,
        { roomId: 0, userId: 0 } as WebSocket,
        { id: 0 },
      ),
    ).rejects.toThrow("You can't ban yourself.");
  });

  it("rejects if the signed in user is not the creator of the room or if the room is public", async () => {
    query.mockResolvedValue({ rows: [] } as unknown as QueryResult);

    const ws = { roomId: 0, userId: 0 } as WebSocket;

    await expect(
      banMember({} as Server<WebSocket>, ws, { id: 1 }),
    ).rejects.toThrow("Room not found");

    expect(query.mock.calls[0][1]).toStrictEqual([ws.roomId, ws.userId]);
  });

  it("rejects if the user to ban is not a member of the room", async () => {
    query
      .mockResolvedValue({ rows: [] } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: [{}] } as unknown as QueryResult);

    const ws = { roomId: 0, userId: 0 } as WebSocket;
    const data = { id: 1 };

    await expect(banMember({} as Server<WebSocket>, ws, data)).rejects.toThrow(
      "Member not found",
    );

    expect(query.mock.calls[1][1]).toStrictEqual([data.id, ws.roomId]);
  });

  it("sends the banned member's id to each client connected to the room", async () => {
    query
      .mockResolvedValue({ rows: [{}] } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: [{}] } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: [{ id: 3 }] } as unknown as QueryResult);

    const ws1 = {
      roomId: 0,
      userId: 1,
      send: jest.fn(),
    } as unknown as WebSocket;
    const ws2 = {
      roomId: 0,
      userId: 2,
      send: jest.fn(),
    } as unknown as WebSocket;
    const ws3 = {
      roomId: 1,
      userId: 0,
      send: jest.fn(),
    } as unknown as WebSocket;

    const ws = {
      roomId: 0,
      userId: 0,
      send: jest.fn(),
    } as unknown as WebSocket;
    const wss = { clients: new Set([ws, ws1, ws2, ws3]) } as Server<WebSocket>;
    const data = { id: 1 };

    await banMember(wss, ws, data);

    expect(query.mock.calls[2][1]).toStrictEqual([3]);

    const msg = JSON.stringify({ event: "bannedMember", data });
    expect(ws.send).toHaveBeenNthCalledWith(1, msg);
    expect(ws1.send).toHaveBeenNthCalledWith(1, msg);
    expect(ws2.send).toHaveBeenNthCalledWith(1, msg);

    expect(ws3.send).not.toHaveBeenCalled();

    expect(ws1.roomId).toBeUndefined();
  });
});
