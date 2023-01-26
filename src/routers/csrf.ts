import { randomBytes } from "crypto";
import express from "express";
import db from "../db";
import methods from "../middlewares/methods";

const router = express.Router();

router
  .route("/csrf")
  .get(async (req, res, next) => {
    try {
      const result = (
        await db.query<{ token: string }>(
          `SELECT token FROM sessions WHERE sid=$1`,
          [req.sessionID],
        )
      ).rows[0];

      if (result?.token) {
        res.status(200).json({ token: result.token });
        return;
      }

      const token = await updateCsrfToken(req.sessionID);

      res.status(200).json({ token });
    } catch (e) {
      next(e);
    }
  })
  .all(methods([]));

export default router;

export const updateCsrfToken = async (sessionId: string) => {
  const token = randomBytes(128).toString("base64");

  await db.query(`UPDATE sessions SET token=$1 WHERE sid=$2`, [
    token,
    sessionId,
  ]);

  return token;
};
