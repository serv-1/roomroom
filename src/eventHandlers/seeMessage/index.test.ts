import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import seeMessage from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

const queryResult: QueryResult = {
  rows: [],
  command: "",
  rowCount: 0,
  oid: 0,
  fields: [],
};

describe("seeMessage()", () => {
  it("rejects if the chat room does not exist", async () => {
    query.mockResolvedValue(queryResult);

    const data = { msgId: 0, roomId: 0 };

    await expect(
      seeMessage({} as Server<WebSocket>, {} as WebSocket, data),
    ).rejects.toThrow("Chat Room not found");
  });

  it("rejects if the authenticated user is not the creator of the chat room", async () => {
    query.mockResolvedValue({ ...queryResult, rows: [{ creatorId: 1 }] });

    const data = { msgId: 0, roomId: 0 };

    await expect(
      seeMessage({} as Server<WebSocket>, { userId: 0 } as WebSocket, data),
    ).rejects.toThrow("Not allowed");
  });

  it("rejects if the message does not exist", async () => {
    query
      .mockResolvedValue(queryResult)
      .mockResolvedValueOnce({ ...queryResult, rows: [{ creatorId: 0 }] });

    const data = { msgId: 0, roomId: 0 };

    await expect(
      seeMessage({} as Server<WebSocket>, { userId: 0 } as WebSocket, data),
    ).rejects.toThrow("Message not found");
  });

  it("rejects if the message does not belong to the chat room", async () => {
    query
      .mockResolvedValue({ ...queryResult, rows: [{ roomId: 1 }] })
      .mockResolvedValueOnce({ ...queryResult, rows: [{ creatorId: 0 }] });

    const data = { msgId: 0, roomId: 0 };

    await expect(
      seeMessage({} as Server<WebSocket>, { userId: 0 } as WebSocket, data),
    ).rejects.toThrow("Invalid Message");
  });

  it("updates the id of the last message seen by the authenticated user", async () => {
    query
      .mockResolvedValue(queryResult)
      .mockResolvedValueOnce({ ...queryResult, rows: [{ creatorId: 2 }] })
      .mockResolvedValueOnce({ ...queryResult, rows: [{ roomId: 1 }] });

    const data = { msgId: 0, roomId: 1 };

    await seeMessage({} as Server<WebSocket>, { userId: 2 } as WebSocket, data);

    expect(query.mock.calls[2][1]).toStrictEqual([0, 1, 2]);
  });
});
