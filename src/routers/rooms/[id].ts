import express from "express";
import { number } from "yup";
import db from "../../db";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";
import type { User } from "../users/[id]";

const router = express.Router();

router.use(express.json());

router
  .route("/rooms/:id")
  .get(verifyCsrfToken, async (req, res, next) => {
    const { id } = req.params;

    if (!(await number().isValid(id))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    const room = (await db.query<Room>(`SELECT * FROM rooms WHERE id=$1`, [id]))
      .rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat room not found." });
      return;
    }

    if (room.scope === "private") {
      const member = (
        await db.query(
          `SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`,
          [(req.user as Express.User).id, id],
        )
      ).rows[0];

      if (!member) {
        res.status(403).json({ error: "This chat room is private." });
        return;
      }
    }

    const members = (
      await db.query<{ userId: number }>(
        `SELECT "userId" FROM members WHERE "roomId"=$1 AND banned=false`,
        [id],
      )
    ).rows;

    const messages = (
      await db.query<
        Omit<RoomMessage, "roomId"> & Pick<User, "name" | "image">
      >(
        `SELECT msg.id, msg."authorId", u.name, u.image, mem.banned, msg."createdAt", msg.text, msg.images, msg.videos
        	FROM messages AS msg JOIN users AS u ON msg."authorId"=u.id
        	JOIN members AS mem ON mem."roomId"=$1 AND mem."userId"=u.id
        	WHERE msg."roomId"=$1 ORDER BY msg."createdAt" DESC LIMIT 15`,
        [id],
      )
    ).rows.reverse();

    res.status(200).json({
      ...room,
      memberIds: members.map(({ userId }) => userId),
      messages,
    });
  })
  .all(methods([]));

export default router;

export interface RoomMessage {
  id: number;
  roomId: number;
  authorId: number;
  createdAt: Date;
  text: string | null;
  images: string[] | null;
  videos: string[] | null;
}

export interface Room {
  id: number;
  subject: string;
  scope: "public" | "private";
  creatorId: number;
  messages: RoomMessage[];
}
