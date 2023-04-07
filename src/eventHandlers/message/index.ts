import type { Server, WebSocket } from "ws";
import { array, number, object, string } from "yup";
import db from "../../db";
import type { Room, RoomMessage } from "../../routers/rooms/[id]";
import type { User } from "../../routers/users/[id]";

const schema = object({
  images: array(string().required()).min(1),
  videos: array(string().required()).min(1),
  text: string().max(500),
  roomId: number().required(),
  gif: string(),
});

const message = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { images, videos, text, roomId, gif } = await schema.validate(data);

  if (!images && !videos && !text && !gif) throw new Error("Message empty");

  const room = (
    await db.query<Pick<Room, "id" | "scope">>(
      `SELECT id, scope FROM rooms WHERE id=$1`,
      [roomId],
    )
  ).rows[0];
  if (!room) throw new Error("Chat room not found");

  const member = (
    await db.query(`SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`, [
      ws.userId,
      roomId,
    ])
  ).rows[0];

  if (!member) {
    if (room.scope === "private") throw new Error("Not a member");

    const lastMsg = (
      await db.query<Pick<RoomMessage, "id">>(
        `SELECT id FROM messages WHERE "roomId"=$1 ORDER BY "createdAt" DESC LIMIT 1`,
        [roomId],
      )
    ).rows[0];

    await db.query(
      `INSERT INTO members ("userId", "roomId", "lastMsgSeenId") VALUES ($1, $2, $3)`,
      [ws.userId, roomId, lastMsg ? lastMsg.id : null],
    );
  }

  const message = (
    await db.query<Pick<MessageData, "createdAt" | "id">>(
      `INSERT INTO messages ("roomId", "authorId", text, images, videos, gif)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING "createdAt", id`,
      [
        roomId,
        ws.userId,
        text || null,
        images || null,
        videos || null,
        gif || null,
      ],
    )
  ).rows[0];

  await db.query(`UPDATE rooms SET "updatedAt"=$1 WHERE id=$2`, [
    message.createdAt,
    roomId,
  ]);

  const author = (
    await db.query<User>(`SELECT name, image FROM users WHERE id=$1`, [
      ws.userId,
    ])
  ).rows[0];

  wss.clients.forEach((client) => {
    if (client.roomId !== roomId && client.userId !== ws.userId) return;

    const data: MessageData = { authorId: ws.userId, ...author, ...message };

    if (text) data.text = text;
    if (images) data.images = images;
    if (videos) data.videos = videos;
    if (gif) data.gif = gif;

    client.send(JSON.stringify({ event: "message", data }));

    if (!member) {
      client.send(JSON.stringify({ event: "member", data: { id: ws.userId } }));
    }
  });
};

export default message;

interface MessageData {
  id: number;
  authorId: number;
  name: User["name"];
  image: User["image"];
  text?: string;
  images?: string[];
  videos?: string[];
  gif?: string;
  createdAt: Date;
}
