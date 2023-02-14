import express from "express";
import { number } from "yup";
import methods from "../../middlewares/methods";
import { subjectSchema } from ".";
import db from "../../db";
import type { Room } from "./[id]";

const router = express.Router();

const idSchema = number().required();

router
  .route("/rooms/search")
  .get(async (req, res, next) => {
    const { id, subject } = req.query;

    let condition = "";
    let values: string[] = [];

    const isSubjectValid = await subjectSchema.isValid(subject, {
      strict: true,
    });

    if (isSubjectValid && !id) {
      condition = `AND to_tsvector('english', subject) @@ plainto_tsquery('english', $1)`;
      values = [subject as string];
    }

    const isIdValid = await idSchema.isValid(id);

    if (isIdValid && !subject) {
      condition = `AND id < $1`;
      values = [id as string];
    }

    if (isSubjectValid && isIdValid) {
      condition = `AND id < $1 AND to_tsvector('english', subject) @@ plainto_tsquery('english', $2)`;
      values = [id as string, subject as string];
    }

    if ((subject && !isSubjectValid) || (id && !isIdValid)) {
      res.status(422).json({ error: "Your search is invalid." });
      return;
    }

    const rooms = (
      await db.query<SearchedRoom>(
        `SELECT id, subject, "updatedAt" FROM rooms
				 WHERE scope='public' ${condition} ORDER BY id DESC LIMIT 20`,
        values,
      )
    ).rows;

    res.status(200).json({ rooms });
  })
  .all(methods([]));

export default router;

type SearchedRoom = Pick<Room, "id" | "subject" | "updatedAt">;
