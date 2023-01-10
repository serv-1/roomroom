import type { Request } from "express";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { object, string } from "yup";
import banMember from "./eventHandlers/banMember";
import offlineMember from "./eventHandlers/offlineMember";
import onlineMember from "./eventHandlers/onlineMember";
import onlineMembers from "./eventHandlers/onlineMembers";

const wss = new WebSocketServer({ clientTracking: true, noServer: true });

wss.on("connection", async (ws: WebSocket, req: Request) => {
  ws.userId = (req.session.passport as { user: { id: number } }).user.id;
  ws.isAlive = true;

  const ping = setInterval(() => {
    if (ws.isAlive) {
      ws.isAlive = false;
      return ws.send("ping");
    }

    ws.terminate();
  }, 30000);

  ws.on("close", () => clearInterval(ping));
  ws.on("message", async (rawData) => await messageHandler(ws, rawData));
});

export default wss;

const messageSchema = object({
  event: string().required(),
  data: object().required(),
});

export async function messageHandler(ws: WebSocket, rawData: RawData) {
  const strData = rawData.toString();

  if (strData === "ping") {
    return ws.send("pong");
  } else if (strData === "pong") {
    return (ws.isAlive = true);
  }

  try {
    const jsonData = JSON.parse(strData) as unknown;

    const { event, data } = await messageSchema.validate(jsonData);

    switch (event) {
      case "onlineMember":
        await onlineMember(wss, ws, data);
        break;
      case "onlineMembers":
        await onlineMembers(wss, ws, data);
        break;
      case "offlineMember":
        await offlineMember(wss, ws, data);
        break;
      case "banMember":
        await banMember(wss, ws, data);
        break;
      default:
        throw new Error();
    }
  } catch (err) {
    const e = err as Error;

    const error =
      e.name === "Error" && e.message ? e.message : "An error has occurred.";

    ws.send(JSON.stringify({ event: "error", data: { error } }));
  }
}
