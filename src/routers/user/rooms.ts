import express from "express";
import db from "../../db";
import forbidAnonymUser from "../../middlewares/forbidAnonymUser";
import methods from "../../middlewares/methods";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";

const router = express.Router();

router
  .route("/user/rooms")
  .get(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    const rooms = (
      await db.query(
        `SELECT id, subject, scope, "updatedAt" FROM rooms WHERE "creatorId"=$1`,
        [(req.user as Express.User).id],
      )
    ).rows;

    res.status(200).json({ rooms });
  })
  .all(methods([]));

export default router;
