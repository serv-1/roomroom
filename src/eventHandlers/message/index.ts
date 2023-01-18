import type { Server, WebSocket } from "ws";
import { array, number, object, string } from "yup";
import db from "../../db";
import type { Room } from "../../routers/rooms/[id]";

const schema = object({
  images: array(string().required()).min(1),
  videos: array(string().required()).min(1),
  text: string().max(500),
  roomId: number().required(),
});

const message = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { images, videos, text, roomId } = await schema.validate(data);

  if (!images && !videos && !text) throw new Error("Message empty");

  const room = (
    await db.query<Pick<Room, "id" | "scope">, number[]>(
      "SELECT id, scope FROM rooms WHERE id=$1",
      [roomId],
    )
  ).rows[0];
  if (!room) throw new Error("Chat room not found");

  const member = (
    await db.query("SELECT id FROM members WHERE user_id=$1 AND room_id=$2", [
      ws.userId,
      roomId,
    ])
  ).rows[0];

  if (!member) {
    if (room.scope === "private") throw new Error("Not a member");

    await db.query("INSERT INTO members (user_id, room_id) VALUES ($1, $2)", [
      ws.userId,
      roomId,
    ]);
  }

  const message = (
    await db.query(
      "INSERT INTO messages (room_id, author_id, text, images, videos) VALUES ($1, $2, $3, $4, $5) RETURNING created_at",
      [roomId, ws.userId, text || null, images || null, videos || null],
    )
  ).rows[0] as { created_at: Date };

  wss.clients.forEach((client) => {
    if (client.roomId !== roomId && client.userId !== ws.userId) return;

    const data: MessageData = {
      authorId: ws.userId,
      createdAt: message.created_at,
    };

    if (text) data.text = text;
    if (images) data.images = images;
    if (videos) data.videos = videos;

    client.send(JSON.stringify({ event: "message", data }));

    if (!member) {
      client.send(JSON.stringify({ event: "member", data: { id: ws.userId } }));
    }
  });
};

export default message;

interface MessageData {
  authorId: number;
  text?: string;
  images?: string[];
  videos?: string[];
  createdAt: Date;
}
