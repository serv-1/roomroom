import type { ObjectIdentifier } from "@aws-sdk/client-s3";
import express from "express";
import { object, string, ValidationError } from "yup";
import db from "../../db";
import deleteImage from "../../deleteImage";
import forbidAnonymUser from "../../middlewares/forbidAnonymUser";
import methods from "../../middlewares/methods";
import signOut from "../../middlewares/signOut";
import verifyCsrfToken from "../../middlewares/verifyCsrfToken";
import { emailSchema } from "../auth";
import type { RoomMessage } from "../rooms/[id]";
import type { User } from "../users/[id]";

const updateUserSchema = object({
  name: string()
    .trim()
    .max(40, "The name cannot exceed ${max} characters.")
    .test("unique", "This name is already taken.", async (value) => {
      if (!value) return true;

      const result = (
        await db.query<{ exist: boolean }>(
          `SELECT count(*) > 0 exist FROM users WHERE name=$1`,
          [value],
        )
      ).rows[0];

      return !result?.exist;
    })
    .typeError("This name is invalid."),
  email: emailSchema
    .optional()
    .test("unique", "This email is already taken.", async (value) => {
      if (!value) return true;

      const result = (
        await db.query<{ exist: boolean }>(
          `SELECT count(*) > 0 exist FROM users WHERE email=$1`,
          [value],
        )
      ).rows[0];

      return !result?.exist;
    }),
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
    const result = await db.query(`SELECT * FROM users WHERE id=$1`, [
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
        const { type, message, path } = e as ValidationError;

        if (type === "unique") {
          res.status(422).json({ field: path, error: message });
          return;
        }

        res.status(422).json({ error: message });
        return;
      }

      let query = `UPDATE users SET`;
      const values: string[] = [];

      for (let i = 0; i < body.length; i++) {
        const data = body[i] as [string, string];

        query += ` ${data[0]}=$${i + 1}${i === body.length - 1 ? "" : ","}`;
        values.push(data[1]);
      }

      try {
        if (req.body.image) {
          const result = (
            await db.query<{ image: string }>(
              `SELECT image FROM users WHERE id=$1`,
              [(req.user as Express.User).id],
            )
          ).rows[0];

          if (result?.image) await deleteImage(result.image);
        }

        await db.query(`${query} WHERE id=$${body.length + 1}`, [
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
  .delete(
    forbidAnonymUser,
    verifyCsrfToken,
    async (req, res, next) => {
      const userId = (req.user as Express.User).id;

      const messages = (
        await db.query<Pick<RoomMessage, "images" | "videos">>(
          `SELECT m.images, m.videos FROM messages AS m
				 JOIN rooms AS r ON m."roomId"=r.id WHERE r."creatorId"=$1`,
          [userId],
        )
      ).rows;

      const objects: ObjectIdentifier[] = [];

      for (const message of messages) {
        message.images?.forEach((image) => objects.push({ Key: image }));
        message.videos?.forEach((video) => objects.push({ Key: video }));
      }

      if (objects.length) await deleteImage(objects);

      const image = (
        await db.query<Pick<User, "image">>(
          `SELECT image FROM users WHERE id=$1`,
          [userId],
        )
      ).rows[0].image;

      if (image) await deleteImage(image);

      await db.query(`DELETE FROM users WHERE id=$1`, [userId]);

      next();
    },
    signOut,
  )
  .all(methods([]));

export default router;
