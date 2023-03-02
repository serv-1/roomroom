import type { Server, WebSocket } from "ws";
import { number, object } from "yup";
import db from "../../db";
import type { Room, RoomMessage } from "../../routers/rooms/[id]";

const schema = object({
  msgId: number().required(),
  roomId: number().required(),
});

const seeMessage = async (
  wss: Server<WebSocket>,
  ws: WebSocket,
  data: unknown,
) => {
  const { msgId, roomId } = await schema.validate(data);

  const room = (
    await db.query<Pick<Room, "creatorId">>(
      `SELECT "creatorId" FROM rooms WHERE id=$1`,
      [roomId],
    )
  ).rows[0];

  if (!room) throw new Error("Chat Room not found");
  if (room.creatorId !== ws.userId) throw new Error("Not allowed");

  const message = (
    await db.query<Pick<RoomMessage, "roomId">>(
      `SELECT "roomId" FROM messages WHERE id=$1`,
      [msgId],
    )
  ).rows[0];

  if (!message) throw new Error("Message not found");
  if (message.roomId !== roomId) throw new Error("Invalid Message");

  await db.query(
    `UPDATE members SET "lastMsgSeenId"=$1 WHERE "roomId"=$2 AND "userId"=$3`,
    [msgId, roomId, ws.userId],
  );
};

export default seeMessage;
