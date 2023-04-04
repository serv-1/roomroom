import { WebSocketProvider, useWebSocket } from ".";
import { render, screen, waitFor } from "@testing-library/react";
import { Server } from "mock-socket";
import { act } from "react-dom/test-utils";

const url = "ws://localhost:3002";

interface TestProps {
  messageHandler?: (message: { event: string; data: unknown }) => void;
}

const Test = ({ messageHandler }: TestProps) => {
  const { send } = useWebSocket(messageHandler);

  return <div data-testid="isConnected">{send ? "true" : "false"}</div>;
};

describe("<WebSocketProvider />", () => {
  it("opens a websocket connection", async () => {
    const mockServer = new Server(url);

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    const isConnected = screen.getByTestId("isConnected");
    expect(isConnected).toHaveTextContent("false");

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    await waitFor(() => expect(isConnected).toHaveTextContent("true"));

    mockServer.stop();
  });

  it("closes the websocket connection", async () => {
    const mockServer = new Server(url);

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    const client = mockServer.clients()[0];
    await waitFor(() => expect(client.readyState).toBe(client.OPEN));

    client.close();
    await waitFor(() => expect(client.readyState).toBe(client.CLOSED));

    const isConnected = screen.getByTestId("isConnected");
    expect(isConnected).toHaveTextContent("false");

    mockServer.stop();
  });

  it("tries to reconnect to the server every 3 seconds if the connection has been closed abnormally", async () => {
    jest.useFakeTimers();
    const mockServer = new Server(url);

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    const client = mockServer.clients()[0];
    await waitFor(() => expect(client.readyState).toBe(client.OPEN));

    client.close({ code: 1006, reason: "", wasClean: true });
    await waitFor(() => expect(client.readyState).toBe(client.CLOSED));

    const isConnected = screen.getByTestId("isConnected");

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(isConnected).toHaveTextContent("false");

    await waitFor(
      () => expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN),
      { timeout: 3000 },
    );

    expect(isConnected).toHaveTextContent("true");

    mockServer.stop();
    jest.useRealTimers();
  });

  it("does not try to reconnect to the server if the connection has been closed normally", async () => {
    jest.useFakeTimers();

    const mockServer = new Server(url);

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    const client = mockServer.clients()[0];
    await waitFor(() => expect(client.readyState).toBe(client.OPEN));

    client.close({ code: 1000, reason: "", wasClean: true });
    await waitFor(() => expect(client.readyState).toBe(client.CLOSED));

    const isConnected = screen.getByTestId("isConnected");
    expect(isConnected).toHaveTextContent("false");

    jest.advanceTimersByTime(3000);
    expect(isConnected).toHaveTextContent("false");

    mockServer.stop();
    jest.useRealTimers();
  });

  it("closes the websocket connection if the component unmounts", async () => {
    const mockServer = new Server(url);

    const { unmount } = render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    unmount();

    await waitFor(() => {
      expect(mockServer.clients()[0]).toBeUndefined();
    });

    mockServer.stop();
  });

  it("sends a ping message every 30 seconds to the server", async () => {
    jest.useFakeTimers();
    const mockServer = new Server(url);

    let resolve: (value?: unknown) => void;
    let pingMessage = new Promise((r) => (resolve = r));

    mockServer.on("connection", (socket) => {
      socket.on("message", (message) => {
        expect(message).toBe("ping");
        resolve();
        socket.send("pong");
      });
    });

    const messageHandler = jest.fn();

    render(
      <WebSocketProvider url={url}>
        <Test messageHandler={messageHandler} />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    jest.advanceTimersByTime(30000);

    await pingMessage;
    pingMessage = new Promise((r) => (resolve = r));

    jest.advanceTimersByTime(30000);

    await pingMessage;

    expect(messageHandler).not.toHaveBeenCalled();

    mockServer.stop();
    jest.useRealTimers();
  });

  it("tries to reconnect to the server if it does not respond", async () => {
    jest.useFakeTimers();
    const mockServer = new Server(url);

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    const isConnected = screen.getByTestId("isConnected");
    expect(isConnected).toHaveTextContent("true");

    act(() => {
      jest.advanceTimersByTime(63000);
    });

    await waitFor(() => {
      expect(isConnected).toHaveTextContent("false");
    });

    mockServer.stop();
    jest.useRealTimers();
  });

  it("keeps the connection alive if it receives the server's pong message", async () => {
    jest.useFakeTimers();
    const mockServer = new Server(url);

    mockServer.on("connection", (socket) => {
      socket.on("message", (message) => {
        if (message === "ping") {
          socket.send("pong");
        }
      });
    });

    render(
      <WebSocketProvider url={url}>
        <Test />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    const isConnected = screen.getByTestId("isConnected");
    expect(isConnected).toHaveTextContent("true");

    jest.advanceTimersByTime(63000);

    expect(isConnected).not.toHaveTextContent("false");

    mockServer.stop();
    jest.useRealTimers();
  });

  it("sends a pong message in response to the server's ping message", async () => {
    const mockServer = new Server(url);

    let resolve: (value?: unknown) => void;
    const pongMessage = new Promise((r) => (resolve = r));

    const messageHandler = jest.fn();

    mockServer.on("connection", (socket) => {
      socket.on("message", (message) => {
        expect(messageHandler).not.toHaveBeenCalled();
        expect(message).toBe("pong");
        resolve();
      });
      setTimeout(() => socket.send("ping"), 100);
    });

    render(
      <WebSocketProvider url={url}>
        <Test messageHandler={messageHandler} />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    await pongMessage;

    mockServer.stop();
  });

  it("gets the last message sent by the server", async () => {
    const mockServer = new Server(url);

    mockServer.on("connection", (socket) => {
      socket.send(JSON.stringify({ event: "getPizza", data: "pizza" }));
    });

    render(
      <WebSocketProvider url={url}>
        <Test
          messageHandler={({ event, data }) => {
            expect(event).toBe("getPizza");
            expect(data).toBe("pizza");
          }}
        />
      </WebSocketProvider>,
    );

    await waitFor(() => {
      expect(mockServer.clients()[0].readyState).toBe(WebSocket.OPEN);
    });

    mockServer.stop();
  });
});
