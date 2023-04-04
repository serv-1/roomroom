import { createContext, useContext, useEffect, useState } from "react";

type Send = <T>(event: string, data: T) => void;

interface WebSocketContext {
  send?: Send;
  webSocket?: WebSocket | null;
}

const webSocketContext = createContext<WebSocketContext | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
}

const WebSocketProvider = ({ children, url }: WebSocketProviderProps) => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>();

  useEffect(() => {
    if (webSocket) return;

    const ws = new WebSocket(url);
    let pingInterval: NodeJS.Timer;
    let closeTimeout: NodeJS.Timeout;

    ws.addEventListener("open", () => {
      let isAlive = true;

      pingInterval = setInterval(() => {
        if (isAlive) {
          isAlive = false;
          return ws.send("ping");
        }

        ws.close(3000);
      }, 30000);

      ws.addEventListener("message", (e) => {
        if (e.data === "pong") {
          isAlive = true;
        } else if (e.data === "ping") {
          ws.send("pong");
        }
      });

      setWebSocket(ws);
    });

    ws.addEventListener("close", function (e) {
      clearInterval(pingInterval);

      if (e.code === 1006 || e.code === 3000) {
        closeTimeout = setTimeout(
          () => setWebSocket(webSocket === null ? undefined : null),
          3000,
        );
      } else {
        setWebSocket(this);
      }
    });

    const closeWs = () => {
      document.removeEventListener("closeWebSocket", closeWs);
      ws.close();
      clearTimeout(closeTimeout);
    };

    document.addEventListener("closeWebSocket", closeWs);
  }, [webSocket]);

  useEffect(() => {
    return () => {
      document.dispatchEvent(new CustomEvent("closeWebSocket"));
    };
  }, []);

  const send: Send | undefined =
    webSocket && webSocket.readyState === 1
      ? (event, data) => webSocket?.send(JSON.stringify({ event, data }))
      : undefined;

  return (
    <webSocketContext.Provider value={{ send, webSocket }}>
      {children}
    </webSocketContext.Provider>
  );
};

interface useWebSocketReturn {
  send?: Send;
}

const useWebSocket = <T extends { event: string; data: unknown }>(
  messageHandler?: (message: T) => void,
): useWebSocketReturn => {
  const context = useContext(webSocketContext);

  if (!context) {
    throw new Error("`useWebSocket` must be used inside `WebSocketProvider`");
  }

  useEffect(() => {
    if (!context.webSocket || !messageHandler) return;

    const listener = (e: MessageEvent<string>) => {
      if (e.data === "ping" || e.data === "pong") return;
      messageHandler(JSON.parse(e.data) as T);
    };

    context.webSocket.addEventListener("message", listener);

    return () => {
      context.webSocket?.removeEventListener("message", listener);
    };
  }, [context.webSocket]);

  return { send: context.send };
};

export { WebSocketProvider, useWebSocket };
