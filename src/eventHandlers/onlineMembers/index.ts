import type { Server, WebSocket } from "ws";
import { number, object } from "yup";
import db from "../../db";

const schema = object({ roomId: number().required() });

const onlineMembers = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { roomId } = await schema.validate(data);

  const room = (await db.query(`SELECT id FROM rooms WHERE id=$1`, [roomId]))
    .rows[0];
  if (!room) throw new Error("Room not found");

  const ids: number[] = [];

  wss.clients.forEach((client) => {
    if (client.roomId !== roomId) return;
    ids.push(client.userId);
  });

  ws.send(JSON.stringify({ event: "onlineMembers", data: { ids, roomId } }));
};

export default onlineMembers;
