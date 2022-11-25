import express from "express";
import { object, string, ValidationError } from "yup";
import db from "../db";
import forbidAnonymUser from "../middlewares/forbidAnonymUser";
import verifyCsrfToken from "../middlewares/verifyCsrfToken";

const createRoomSchema = object({
  subject: string()
    .trim()
    .typeError("The subject is invalid.")
    .required("A subject is required.")
    .max(150, "The subject cannot exceed 150 characters."),
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

    try {
      const result = await db.query(
        "INSERT INTO rooms (subject, scope, creator_id) VALUES ($1, $2, $3) RETURNING id",
        [subject, scope, (req.user as Express.User).id],
      );

      res.status(201).json(result.rows[0]);
    } catch (e) {
      next(e);
    }
  })
  .all((req, res, next) => {
    res.status(405).json({ error: "This method is not allowed." });
  });

export default router;
