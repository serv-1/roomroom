import express from "express";
import { object, string, ValidationError } from "yup";
import db from "../../db";
import forbidAnonymUser from "../../middlewares/forbidAnonymUser";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";

const createRoomSchema = object({
  subject: string()
    .trim()
    .typeError("The subject is invalid.")
    .required("A subject is required.")
    .max(150, "The subject cannot exceed ${max} characters."),
  scope: string()
    .trim()
    .typeError("The scope must be either public or private.")
    .required("A scope is required.")
    .matches(
      /^(public|private)$/,
      "The scope must be either public or private.",
    ),
});

const router = express.Router();

router.use(express.json());

router
  .route("/rooms")
  .post(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    try {
      await createRoomSchema.validate(req.body);
    } catch (e) {
      res.status(422).json({ error: (e as ValidationError).message });
      return;
    }

    const { subject, scope } = req.body as {
      subject: string;
      scope: "public" | "private";
    };

    const userId = (req.user as Express.User).id;

    try {
      const row = (
        await db.query(
          `WITH room AS (
						INSERT INTO rooms (subject, scope, creator_id) VALUES ($1, $2, $3)
							RETURNING id AS room_id, creator_id AS user_id
					)
					INSERT INTO members (user_id, room_id)
						SELECT user_id, room_id FROM room RETURNING room_id AS id`,
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
