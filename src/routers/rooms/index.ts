import express from "express";
import { number, object, string, ValidationError } from "yup";
import db from "../../db";
import forbidAnonymUser from "../../middlewares/forbidAnonymUser";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";
import type { Room } from "./[id]";

export const subjectSchema = string()
  .typeError("The subject is invalid.")
  .required("A subject is required.")
  .trim()
  .max(150, "The subject cannot exceed ${max} characters.");

const createRoomSchema = object({
  subject: subjectSchema,
  scope: string()
    .typeError("The scope must be either public or private.")
    .required("A scope is required.")
    .trim()
    .matches(
      /^(public|private)$/,
      "The scope must be either public or private.",
    ),
});

const router = express.Router();

router.use(express.json());

router
  .route("/rooms")
  .get(async (req, res, next) => {
    const { userId } = req.query;

    if (!(await number().isValid(userId))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    const user = (await db.query(`SELECT id FROM users WHERE id=$1`, [userId]))
      .rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    let scope = "";

    if (+(userId as string) !== req.user?.id) {
      scope = `WHERE r.scope='public'`;
    }

    const rooms = (
      await db.query(
        `SELECT r.id, r.subject, r.scope, r."updatedAt" FROM rooms AS r
				 JOIN members AS mem ON r.id=mem."roomId" AND mem."userId"=$1 ${scope}`,
        [userId],
      )
    ).rows;

    res.status(200).json({ rooms });
  })
  .post(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    try {
      await createRoomSchema.validate(req.body, { strict: true });
    } catch (e) {
      res.status(422).json({ error: (e as ValidationError).message });
      return;
    }

    const { subject, scope } = req.body as Pick<Room, "subject" | "scope">;

    const userId = (req.user as Express.User).id;

    try {
      const row = (
        await db.query(
          `WITH room AS (
						INSERT INTO rooms (subject, scope, "creatorId") VALUES ($1, $2, $3)
							RETURNING id AS "roomId", "creatorId" AS "userId"
					)
					INSERT INTO members ("userId", "roomId")
						SELECT "userId", "roomId" FROM room RETURNING "roomId" AS id`,
          [subject, scope, userId],
        )
      ).rows[0] as { id: number };

      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  })
  .all(methods([]));

export default router;
