import { messageHandler } from "./websocket";
import type { WebSocket } from "ws";

jest.mock("ws", () => ({
  __esModule: true,
  WebSocketServer: class WebSocketServer {
    clients = new Set();
    on = () => undefined;
  },
}));

jest.mock("./eventHandlers/onlineMember", () => ({
  __esModule: true,
  default: async () => {
    throw new Error("oh no");
  },
}));

describe("messageHandler()", () => {
  it("sends a 'pong' message to the client in response to its 'ping' message", async () => {
    const ws = { send: jest.fn() } as unknown as WebSocket;

    await messageHandler(ws, Buffer.from("ping"));

    expect(ws.send).toHaveBeenNthCalledWith(1, "pong");
  });

  it("keeps the connection alive if the client sends a 'pong' message in response to the server's 'ping' message", async () => {
    const ws = { isAlive: false } as unknown as WebSocket;

    await messageHandler(ws, Buffer.from("pong"));

    expect(ws.isAlive).toBe(true);
  });

  it("sends an error message if it does not receive JSON data", async () => {
    const ws = { send: jest.fn() };

    await messageHandler(ws as unknown as WebSocket, Buffer.from("oh no"));

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({
      event: "error",
      data: { error: "An error has occurred." },
    });
  });

  it("sends an error message if the message event is invalid", async () => {
    const ws = { send: jest.fn() };

    await messageHandler(
      ws as unknown as WebSocket,
      Buffer.from(JSON.stringify({ event: "oh no", data: {} })),
    );

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({
      event: "error",
      data: { error: "An error has occurred." },
    });
  });

  it("sends an error message if the message data is invalid", async () => {
    const ws = { send: jest.fn() };

    await messageHandler(
      ws as unknown as WebSocket,
      Buffer.from(JSON.stringify({ event: "banMember", data: "oh no" })),
    );

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({
      event: "error",
      data: { error: "An error has occurred." },
    });
  });

  it("sends an error message thrown by an event handler", async () => {
    const ws = { send: jest.fn() };

    await messageHandler(
      ws as unknown as WebSocket,
      Buffer.from(JSON.stringify({ event: "onlineMember", data: {} })),
    );

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({
      event: "error",
      data: { error: "oh no" },
    });
  });
});
