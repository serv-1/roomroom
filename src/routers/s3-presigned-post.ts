import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import express from "express";
import { nanoid } from "nanoid/async";
import env from "../env";
import forbidAnonymUser from "../middlewares/forbidAnonymUser";
import methods from "../middlewares/methods";
import verifyCsrfToken from "../middlewares/verifyCsrfToken";
import s3Client from "../s3Client";

const router = express.Router();

router
  .route("/s3-presigned-post")
  .get(forbidAnonymUser, verifyCsrfToken, async (req, res, next) => {
    const Key = await nanoid();

    try {
      const { url, fields } = await createPresignedPost(s3Client, {
        Key,
        Bucket: env.AWS_BUCKET,
        Conditions: [["content-length-range", 0, 1048576]],
        Expires: 60,
      });

      res.status(200).json({ url, fields, key: Key });
    } catch (e) {
      next(e);
    }
  })
  .all(methods([]));

export default router;
