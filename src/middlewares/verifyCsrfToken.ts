import type { RequestHandler } from "express";
import { string, ValidationError } from "yup";
import db from "../db";
import { updateCsrfToken } from "../routers/csrf";

const msg =
  "Hmmm... The provided data are weird. Please redo your action or sign in again if it still doesn't work.";

const csrfTokenSchema = string().required(msg).typeError(msg);

const verifyCsrfToken: RequestHandler = async (req, res, next) => {
  const token = req.headers["x-csrf-token"];

  try {
    await csrfTokenSchema.validate(token);
  } catch (e) {
    res.status(422).json({ error: (e as ValidationError).message });
    return;
  }

  try {
    const result = (
      await db.query<{ token: string }>(
        `SELECT token from sessions WHERE sid=$1`,
        [req.sessionID],
      )
    ).rows[0];

    if (result?.token !== token) {
      res.status(422).json({ error: msg });
      return;
    }

    await updateCsrfToken(req.sessionID);

    next();
  } catch (e) {
    next(e);
  }
};

export default verifyCsrfToken;
