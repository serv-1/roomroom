import express from "express";
import { number } from "yup";
import db from "../../db";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";

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

    const room = (
      await db.query<Room, string[]>("SELECT * FROM rooms WHERE id=$1", [id])
    ).rows[0];

    if (!room) {
      res.status(404).json({ error: "Chat room not found." });
      return;
    }

    if (room.scope === "private") {
      const member = (
        await db.query(
          "SELECT id FROM members WHERE user_id=$1 AND room_id=$2",
          [(req.user as Express.User).id, id],
        )
      ).rows[0];

      if (!member) {
        res.status(403).json({ error: "This chat room is private." });
        return;
      }
    }

    const { rows } = await db.query<{ user_id: number }, string[]>(
      "SELECT user_id FROM members WHERE room_id=$1 AND banned=false",
      [id],
    );

    const member_ids: number[] = [];

    for (const row of rows) {
      member_ids.push(row.user_id);
    }

    res.status(200).json({ ...room, member_ids });
  })
  .all(methods([]));

export default router;

export interface Room {
  id: number;
  subject: string;
  scope: "public" | "private";
  creator_id: number;
}
