import { randomBytes } from "crypto";
import express from "express";
import db from "../db";

const router = express.Router();

router
  .route("/csrf")
  .get(async (req, res, next) => {
    try {
      const result = (
        await db.query<{ token: string }, string[]>(
          "SELECT token FROM sessions WHERE sid=$1",
          [req.sessionID],
        )
      ).rows[0];

      if (result?.token) {
        res.status(200).json({ token: result.token });
        return;
      }

      const token = await updateCsrfToken();

      res.status(200).json({ token });
    } catch (e) {
      next(e);
    }
  })
  .all((req, res, next) => {
    res.status(405).json({ error: "This method is not allowed." });
  });

export default router;

export const updateCsrfToken = async () => {
  const token = randomBytes(128).toString("base64");

  await db.query("UPDATE sessions SET token=$1", [token]);

  return token;
};
