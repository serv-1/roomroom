import express from "express";
import { number } from "yup";
import db from "../../db";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";
import type { Room } from "../rooms/[id]";

const idSchema = number().required();

const router = express.Router();

router.use(express.json());

router
  .route("/messages/:roomId")
  .get(verifyCsrfToken, async (req, res, next) => {
    const { roomId } = req.params;
    const { msgId } = req.query;

    if (!(await idSchema.isValid(roomId)) || !(await idSchema.isValid(msgId))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    const room = (
      await db.query<{ scope: Room["scope"] }>(
        `SELECT scope FROM rooms WHERE id=$1`,
        [roomId],
      )
    ).rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat Room not found." });
      return;
    }

    const message = (
      await db.query(`SELECT id FROM messages WHERE id=$1`, [msgId])
    ).rows[0];

    if (!message) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    if (room.scope === "private") {
      const member = (
        await db.query(
          `SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`,
          [(req.user as Express.User).id, roomId],
        )
      ).rows[0];

      if (!member) {
        res.status(403).json({
          error: "You can't see the messages of a private chat room.",
        });
        return;
      }
    }

    const messages = (
      await db.query(
        `SELECT msg.id, msg."authorId", u.name, u.image, mem.banned, msg."createdAt", msg.text, msg.images, msg.videos
					FROM messages AS msg JOIN users AS u ON msg."authorId"=u.id
					JOIN members AS mem ON mem."roomId"=$1 AND mem."userId"=u.id
					WHERE msg."roomId"=$1 AND msg.id < $2
					ORDER BY msg."createdAt" DESC LIMIT 15`,
        [roomId, msgId],
      )
    ).rows.reverse();

    res.status(200).json({ messages });
  })
  .all(methods([]));

export default router;
