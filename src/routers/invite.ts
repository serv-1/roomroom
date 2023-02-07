import express from "express";
import { array, number, object, string } from "yup";
import db from "../db";
import forbidAnonymUser from "../middlewares/forbidAnonymUser";
import methods from "../middlewares/methods";
import verifyCsrfToken from "../middlewares/verifyCsrfToken";
import type { Room } from "./rooms/[id]";
import type { User } from "./users/[id]";

const router = express.Router();

const postReqBodySchema = object({
  roomId: number().required(),
  userIds: array(number())
    .required()
    .min(1)
    .test("unique", "", (ids) => {
      return new Set(ids).size === ids?.length;
    }),
});

const getReqQuerySchema = object({
  roomId: string().required().matches(/^\d+$/),
  name: string().trim().required(),
});

router
  .route("/invite")
  .get(async (req, res, next) => {
    if (!(await getReqQuerySchema.isValid(req.query, { strict: true }))) {
      res.status(422).json({ error: "The given data are invalid." });
      return;
    }

    const { roomId, name } = req.query as { roomId: string; name: string };

    const users = (
      await db.query<User>(
        `SELECT id, name, image FROM users WHERE name LIKE $1 || '%'`,
        [name],
      )
    ).rows;

    if (!users.length) {
      res.status(200).json({ users });
      return;
    }

    const members = (
      await db.query<{ userId: number }>(
        `SELECT "userId" FROM members WHERE "roomId"=$1`,
        [roomId],
      )
    ).rows.map((r) => r.userId);

    res
      .status(200)
      .json({ users: users.filter((u) => !members.includes(u.id)) });
  })
  .post(verifyCsrfToken, forbidAnonymUser, async (req, res, next) => {
    if (!(await postReqBodySchema.isValid(req.body, { strict: true }))) {
      res.status(422).json({ error: "The given data are invalid." });
      return;
    }

    const { roomId, userIds } = req.body as {
      roomId: number;
      userIds: number[];
    };

    const room = (
      await db.query<Pick<Room, "scope" | "creatorId">>(
        `SELECT scope, "creatorId" FROM rooms WHERE id=$1`,
        [roomId],
      )
    ).rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat room not found." });
      return;
    }

    if (room.scope !== "private") {
      res.status(422).json({ error: "Anyone can join a public chat room." });
      return;
    }

    if (room.creatorId !== (req.user as Express.User).id) {
      res
        .status(403)
        .json({ error: "Only the creator of the chat room can invite users." });
      return;
    }

    if (userIds.includes((req.user as Express.User).id)) {
      res.status(422).json({ error: "You can't invite yourself." });
      return;
    }

    const userIdsStr = "(" + userIds.join(",") + ")";

    const users = (
      await db.query(`SELECT id FROM users WHERE id IN ${userIdsStr}`)
    ).rows;

    if (users.length !== userIds.length) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const members = (
      await db.query(
        `SELECT id FROM members WHERE "roomId"=$1 AND "userId" IN ${userIdsStr}`,
        [roomId],
      )
    ).rows;

    if (members.length) {
      res.status(422).json({ error: "One or many users are already members." });
      return;
    }

    const values: string[] = [];

    for (const id of userIds) {
      values.push("(" + id + "," + roomId + ")");
    }

    await db.query(
      `INSERT INTO members ("userId", "roomId") VALUES ${values.join(",")}`,
    );

    res.status(200).end();
  })
  .all(methods([]));

export default router;
