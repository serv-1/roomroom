import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import onlineMembers from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

describe("onlineMembers()", () => {
  it("rejects if the room does not exist", async () => {
    query.mockResolvedValue({ rows: [] } as unknown as QueryResult);

    const data = { roomId: 0 };

    await expect(
      onlineMembers({} as Server<WebSocket>, {} as WebSocket, data),
    ).rejects.toThrow("Room not found");

    expect(query.mock.calls[0][1]).toStrictEqual([data.roomId]);
  });

  it("sends the online members' ids of the room to the client", async () => {
    query.mockResolvedValue({ rows: [{}] } as unknown as QueryResult);

    const wss = {
      clients: new Set([
        { roomId: 0, userId: 0 },
        { roomId: 0, userId: 1 },
        { roomId: 1, userId: 0 },
      ]),
    } as Server<WebSocket>;
    const ws = { send: jest.fn() } as unknown as WebSocket;

    await onlineMembers(wss, ws, { roomId: 0 });

    expect(ws.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({
        event: "onlineMembers",
        data: { ids: [0, 1], roomId: 0 },
      }),
    );
  });
});
