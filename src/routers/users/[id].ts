import express from "express";
import { number } from "yup";
import db from "../../db";
import methods from "../../middlewares/methods";

const router = express.Router();

router.use(express.json());

router
  .route("/users/:id")
  .get(async (req, res, next) => {
    const { id } = req.params;

    if (!(await number().isValid(id))) {
      res.status(422).json({ error: "Invalid id" });
      return;
    }

    const user = (
      await db.query<User>(`SELECT id, name, image FROM users WHERE id=$1`, [
        id,
      ])
    ).rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json(user);
  })
  .all(methods([]));

export default router;

export interface User {
  id: number;
  name: string;
  image: string | null;
}
