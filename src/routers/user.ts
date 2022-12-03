import express from "express";
import { object, string, ValidationError } from "yup";
import db from "../db";
import deleteImage from "../deleteImage";
import forbidAnonymUser from "../middlewares/forbidAnonymUser";
import methods from "../middlewares/methods";
import signOut from "../middlewares/signOut";
import verifyCsrfToken from "../middlewares/verifyCsrfToken";
import { emailSchema } from "./auth";

const updateUserSchema = object({
  name: string()
    .trim()
    .max(40, "The name cannot exceed ${max} characters.")
    .typeError("This name is invalid."),
  email: emailSchema.optional(),
  image: string()
    .trim()
    .length(21, "The image name must have ${length} characters.")
    .typeError("This image is invalid."),
});

const router = express.Router();

router.use(express.json());

router
  .route("/user")
  .get(async (req, res, next) => {
    const result = await db.query("SELECT * FROM users WHERE id=$1", [
      req.user?.id,
    ]);

    res.status(200).json(result.rows[0]);
  })
  .put(
    forbidAnonymUser,
    verifyCsrfToken,
    async (req, res, next) => {
      const body = Object.entries(req.body);

      if (body.length === 0) {
        res.status(204).end();
        return;
      }

      try {
        await updateUserSchema.validate(req.body);
      } catch (e) {
        res.status(422).json({ error: (e as ValidationError).message });
        return;
      }

      let query = "UPDATE users SET";
      const values: string[] = [];

      for (let i = 0; i < body.length; i++) {
        const data = body[i] as [string, string];

        query += ` ${data[0]}=$${i + 1}${i === body.length - 1 ? "" : ","}`;
        values.push(data[1]);
      }

      try {
        if (req.body.image) {
          const result = (
            await db.query<{ image: string }, string[]>(
              "SELECT image FROM users WHERE id=$1",
              [(req.user as Express.User).id],
            )
          ).rows[0];

          if (result?.image) await deleteImage(result.image);
        }

        await db.query(query + " WHERE id=$" + (body.length + 1), [
          ...values,
          (req.user as Express.User).id,
        ]);

        if (req.body.email) {
          return next();
        }

        res.status(204).end();
      } catch (e) {
        next(e);
      }
    },
    signOut,
  )
  .all(methods([]));

export default router;
