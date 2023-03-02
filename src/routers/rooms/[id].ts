import type { ObjectIdentifier } from "@aws-sdk/client-s3";
import express from "express";
import { number, object, ValidationError } from "yup";
import { subjectSchema } from ".";
import db from "../../db";
import deleteImage from "../../deleteImage";
import forbidAnonymUser from "../../middlewares/forbidAnonymUser";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";
import type { User } from "../users/[id]";

const router = express.Router();

router.use(express.json());

const updateRoomSchema = object({ subject: subjectSchema });

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

    const userId = req.user?.id;

    const member = (
      await db.query(
        `SELECT id FROM members WHERE "userId"=$1 AND "roomId"=$2`,
        [userId, id],
      )
    ).rows[0];

    if (room.scope === "private" && !member) {
      res.status(403).json({ error: "This chat room is private." });
      return;
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
        `SELECT
						msg.id,
						msg."authorId",
						u.name,
						u.image,
						COALESCE(mem.banned, false) AS banned,
						msg."createdAt",
						msg.text,
						msg.images,
						msg.videos,
						msg.gif
        	FROM messages AS msg
						LEFT JOIN users AS u ON msg."authorId"=u.id
        		LEFT JOIN members AS mem ON mem."roomId"=$1 AND mem."userId"=u.id
        	WHERE msg."roomId"=$1
						ORDER BY msg."createdAt" DESC LIMIT 15`,
        [id],
      )
    ).rows.reverse();

    const json = {
      ...room,
      memberIds: members.map(({ userId }) => userId),
      messages,
    };

    if (userId && (room.creatorId === userId || member)) {
      const nbOfUnseenMsg = (
        await db.query<{ count: number }>(
          `SELECT count(*)::INTEGER FROM messages WHERE "roomId"=$1 AND id > (
    				SELECT "lastMsgSeenId" FROM members
    				WHERE "roomId"=$1 AND "userId"=$2
    			)`,
          [id, userId],
        )
      ).rows[0].count;

      res.status(200).json({ ...json, nbOfUnseenMsg });
      return;
    }

    res.status(200).json(json);
  })
  .put(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    const { id } = req.params;

    if (!(await number().isValid(id))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    if (Object.entries(req.body).length === 0) {
      res.status(204).end();
      return;
    }

    try {
      await updateRoomSchema.validate(req.body);
    } catch (e) {
      res.status(422).json({ error: (e as ValidationError).message });
      return;
    }

    const room = (
      await db.query<Pick<Room, "creatorId">>(
        `SELECT "creatorId" FROM rooms WHERE id=$1`,
        [id],
      )
    ).rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat room not found." });
      return;
    }

    if (room.creatorId !== (req.user as Express.User).id) {
      res.status(403).json({ error: "You are not allowed." });
      return;
    }

    await db.query(`UPDATE rooms SET subject=$1 WHERE id=$2`, [
      req.body.subject,
      id,
    ]);

    res.status(204).end();
  })
  .delete(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    const { id } = req.params;

    if (!(await number().isValid(id))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    const room = (
      await db.query<Pick<Room, "creatorId">>(
        `SELECT "creatorId" FROM rooms WHERE id=$1`,
        [id],
      )
    ).rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat room not found." });
      return;
    }

    if (room.creatorId !== (req.user as Express.User).id) {
      res.status(403).json({ error: "You are not allowed." });
      return;
    }

    const messages = (
      await db.query<Pick<RoomMessage, "images" | "videos">>(
        `SELECT images, videos FROM messages WHERE "roomId"=$1
				 AND (images IS NOT NULL OR videos IS NOT NULL)`,
        [id],
      )
    ).rows;

    const objects: ObjectIdentifier[] = [];

    for (const message of messages) {
      message.images?.forEach((image) => objects.push({ Key: image }));
      message.videos?.forEach((video) => objects.push({ Key: video }));
    }

    await deleteImage(objects);

    await db.query(`DELETE FROM rooms WHERE id=$1`, [id]);

    res.status(204).end();
  })
  .all(methods([]));

export default router;

export interface RoomMessage {
  id: number;
  roomId: number;
  authorId: number | null;
  createdAt: Date;
  text: string | null;
  images: string[] | null;
  videos: string[] | null;
  gif: string | null;
}

export interface Room {
  id: number;
  subject: string;
  scope: "public" | "private";
  creatorId: number;
  messages: RoomMessage[];
  updatedAt: Date;
}
