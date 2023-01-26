import type { Server, WebSocket } from "ws";
import { number, object } from "yup";
import db from "../../db";

const schema = object({
  roomId: number().required(),
  userId: number().required(),
});

const onlineMember = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { roomId, userId } = await schema.validate(data);

  if (ws.roomId !== undefined) throw new Error("Already online");
  if (userId !== ws.userId) throw new Error("Forbidden");

  const room = (await db.query(`SELECT id FROM rooms WHERE id=$1`, [roomId]))
    .rows[0];
  if (!room) throw new Error("Room not found");

  const member = (
    await db.query(`SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`, [
      userId,
      roomId,
    ])
  ).rows[0];
  if (!member) throw new Error("Member not found");

  ws.roomId = roomId;

  wss.clients.forEach((client) => {
    if (client.roomId !== roomId) return;

    client.send(
      JSON.stringify({ event: "onlineMember", data: { id: userId } }),
    );
  });
};

export default onlineMember;
