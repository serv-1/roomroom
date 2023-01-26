import type { Server, WebSocket } from "ws";
import { number, object } from "yup";
import db from "../../db";

const schema = object({ id: number().required() });

const banMember = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { id } = await schema.validate(data);

  if (ws.roomId === undefined) throw new Error("Forbidden");
  if (ws.userId === id) throw new Error("You can't ban yourself.");

  const room = (
    await db.query(
      `SELECT id FROM rooms WHERE id=$1 AND "creatorId"=$2 AND scope='private'`,
      [ws.roomId, ws.userId],
    )
  ).rows[0];
  if (!room) throw new Error("Room not found");

  const member = (
    await db.query<{ id: number }>(
      `SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`,
      [id, ws.roomId],
    )
  ).rows[0];
  if (!member) throw new Error("Member not found");

  await db.query(`UPDATE members SET banned=true WHERE id=$1`, [member.id]);

  wss.clients.forEach((client) => {
    if (client.roomId !== ws.roomId) return;

    client.send(JSON.stringify({ event: "bannedMember", data: { id } }));

    if (client.userId === id) client.roomId = undefined;
  });
};

export default banMember;
