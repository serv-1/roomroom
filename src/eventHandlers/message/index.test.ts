import type { QueryResult } from "pg";
import type { Server, WebSocket } from "ws";
import message from ".";
import db from "../../db";

const query = jest.spyOn(db, "query");

const queryResult: QueryResult = {
  rows: [],
  command: "",
  rowCount: 0,
  oid: 0,
  fields: [],
};

describe("message()", () => {
  it("rejects if the the given data are invalid", async () => {
    await expect(
      message({} as Server<WebSocket>, {} as WebSocket, {}),
    ).rejects.toThrow();
  });

  it("rejects if the message is empty", async () => {
    await expect(
      message({} as Server<WebSocket>, {} as WebSocket, { roomId: 0 }),
    ).rejects.toThrow("Message empty");
  });

  it("rejects if the chat room does no exist", async () => {
    query.mockResolvedValue(queryResult);

    const data = { text: "test", roomId: 0 };

    await expect(
      message({} as Server<WebSocket>, {} as WebSocket, data),
    ).rejects.toThrow("Chat room not found");

    expect(query.mock.calls[0][1]).toStrictEqual([0]);
  });

  it("rejects if the room is private and the author of the message is not one of its member", async () => {
    query.mockResolvedValue(queryResult).mockResolvedValueOnce({
      ...queryResult,
      rows: [{ id: 1, scope: "private" }],
    });

    const data = { text: "test", roomId: 1 };

    await expect(
      message({} as Server<WebSocket>, { userId: 0 } as WebSocket, data),
    ).rejects.toThrow("Not a member");

    expect(query.mock.calls[1][1]).toStrictEqual([0, 1]);
  });

  describe("sends the ... and the new member to the other clients of the chat room", () => {
    it("...text message", async () => {
      const createdAt = new Date();

      query
        .mockResolvedValue({
          ...queryResult,
          rows: [{ name: "bob", image: null }],
        })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 1 }] })
        .mockResolvedValueOnce(queryResult)
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 0 }] })
        .mockResolvedValueOnce(queryResult)
        .mockResolvedValueOnce({
          ...queryResult,
          rows: [{ createdAt, id: 0 }],
        })
        .mockResolvedValueOnce(queryResult);

      const wss = [
        { roomId: 0, userId: 0, send: jest.fn() },
        { roomId: 0, userId: 2, send: jest.fn() },
        { roomId: 1, userId: 1, send: jest.fn() },
        { roomId: 1, userId: 3, send: jest.fn() },
      ] as unknown as WebSocket[];

      const data = { text: "test", roomId: 1 };

      await message(
        { clients: new Set(wss) } as Server<WebSocket>,
        { userId: 2 } as WebSocket,
        data,
      );

      const { calls } = query.mock;
      expect(calls[2][1]).toStrictEqual([1]);
      expect(calls[3][1]).toStrictEqual([2, 1, 0]);
      expect(calls[4][1]).toStrictEqual([1, 2, "test", null, null, null]);
      expect(calls[5][1]).toStrictEqual([createdAt, 1]);
      expect(calls[6][1]).toStrictEqual([2]);

      const msgEvent = JSON.stringify({
        event: "message",
        data: {
          authorId: 2,
          name: "bob",
          image: null,
          createdAt,
          id: 0,
          text: "test",
        },
      });

      expect(wss[0].send).not.toHaveBeenCalled();
      expect(wss[1].send).toHaveBeenNthCalledWith(1, msgEvent);
      expect(wss[2].send).toHaveBeenNthCalledWith(1, msgEvent);
      expect(wss[3].send).toHaveBeenNthCalledWith(1, msgEvent);

      const memberEvent = JSON.stringify({ event: "member", data: { id: 2 } });

      expect(wss[1].send).toHaveBeenNthCalledWith(2, memberEvent);
      expect(wss[2].send).toHaveBeenNthCalledWith(2, memberEvent);
      expect(wss[3].send).toHaveBeenNthCalledWith(2, memberEvent);
    });

    it("...images message", async () => {
      const createdAt = new Date();

      query
        .mockResolvedValue({
          ...queryResult,
          rows: [{ name: "bob", image: null }],
        })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{}] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ createdAt, id: 0 }] })
        .mockResolvedValueOnce(queryResult);

      const wss = [
        { roomId: 0, userId: 0, send: jest.fn() },
      ] as unknown as WebSocket[];

      const data = { images: ["key1", "key2"], roomId: 1 };

      await message(
        { clients: new Set(wss) } as Server<WebSocket>,
        { userId: 0 } as WebSocket,
        data,
      );

      const { calls } = query.mock;
      expect(calls[2][1]).toStrictEqual([1, 0, null, data.images, null, null]);

      const msgEvent = JSON.stringify({
        event: "message",
        data: {
          authorId: 0,
          name: "bob",
          image: null,
          createdAt,
          id: 0,
          images: data.images,
        },
      });

      expect(wss[0].send).toHaveBeenNthCalledWith(1, msgEvent);
    });

    it("...videos message", async () => {
      const createdAt = new Date();

      query
        .mockResolvedValue({
          ...queryResult,
          rows: [{ name: "bob", image: null }],
        })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{}] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ createdAt, id: 0 }] })
        .mockResolvedValueOnce(queryResult);

      const wss = [
        { roomId: 0, userId: 0, send: jest.fn() },
      ] as unknown as WebSocket[];

      const data = { videos: ["key1", "key2"], roomId: 1 };

      await message(
        { clients: new Set(wss) } as Server<WebSocket>,
        { userId: 0 } as WebSocket,
        data,
      );

      const { calls } = query.mock;
      expect(calls[2][1]).toStrictEqual([1, 0, null, null, data.videos, null]);

      const msgEvent = JSON.stringify({
        event: "message",
        data: {
          authorId: 0,
          name: "bob",
          image: null,
          createdAt,
          id: 0,
          videos: data.videos,
        },
      });

      expect(wss[0].send).toHaveBeenNthCalledWith(1, msgEvent);
    });

    it("...gif message", async () => {
      const createdAt = new Date();

      query
        .mockResolvedValue({
          ...queryResult,
          rows: [{ name: "bob", image: null }],
        })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{}] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ createdAt, id: 0 }] })
        .mockResolvedValueOnce(queryResult);

      const wss = [
        { roomId: 0, userId: 0, send: jest.fn() },
      ] as unknown as WebSocket[];

      const data = { gif: "gif", roomId: 1 };

      await message(
        { clients: new Set(wss) } as Server<WebSocket>,
        { userId: 0 } as WebSocket,
        data,
      );

      const { calls } = query.mock;
      expect(calls[2][1]).toStrictEqual([1, 0, null, null, null, data.gif]);

      const msgEvent = JSON.stringify({
        event: "message",
        data: {
          authorId: 0,
          name: "bob",
          image: null,
          createdAt,
          id: 0,
          gif: data.gif,
        },
      });

      expect(wss[0].send).toHaveBeenNthCalledWith(1, msgEvent);
    });

    it("...full message", async () => {
      const createdAt = new Date();

      query
        .mockResolvedValue({
          ...queryResult,
          rows: [{ name: "bob", image: null }],
        })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{}] })
        .mockResolvedValueOnce({ ...queryResult, rows: [{ createdAt, id: 0 }] })
        .mockResolvedValueOnce(queryResult);

      const wss = [
        { roomId: 0, userId: 0, send: jest.fn() },
      ] as unknown as WebSocket[];

      const data = {
        text: "test",
        images: ["key1", "key2"],
        videos: ["key3", "key4"],
        gif: "gif",
        roomId: 1,
      };

      await message(
        { clients: new Set(wss) } as Server<WebSocket>,
        { userId: 0 } as WebSocket,
        data,
      );

      const { calls } = query.mock;
      expect(calls[2][1]).toStrictEqual([
        1,
        0,
        data.text,
        data.images,
        data.videos,
        data.gif,
      ]);

      const msgEvent = JSON.stringify({
        event: "message",
        data: {
          authorId: 0,
          name: "bob",
          image: null,
          createdAt,
          id: 0,
          text: data.text,
          images: data.images,
          videos: data.videos,
          gif: data.gif,
        },
      });

      expect(wss[0].send).toHaveBeenNthCalledWith(1, msgEvent);
    });
  });

  it("does not send the new member message if the user is already a member of the chat room", async () => {
    const createdAt = new Date();

    query
      .mockResolvedValue({
        ...queryResult,
        rows: [{ name: "bob", image: null }],
      })
      .mockResolvedValueOnce({
        ...queryResult,
        rows: [{ id: 1, scope: "private" }],
      })
      .mockResolvedValueOnce({ ...queryResult, rows: [{ id: 0 }] })
      .mockResolvedValueOnce({ ...queryResult, rows: [{ createdAt, id: 0 }] })
      .mockResolvedValueOnce(queryResult);

    const wss = [
      { roomId: 0, userId: 0, send: jest.fn() },
    ] as unknown as WebSocket[];

    const data = { text: "test", roomId: 1 };

    await message(
      { clients: new Set(wss) } as Server<WebSocket>,
      { userId: 0 } as WebSocket,
      data,
    );

    expect(wss[0].send).toHaveBeenCalledTimes(1);
  });
});
