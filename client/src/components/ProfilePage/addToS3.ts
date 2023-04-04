import { nanoid } from "nanoid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import env from "../../env";
import s3Client from "../../s3Client";

const addToS3 = async (file: Blob) => {
  const Key = nanoid();

  await s3Client.send(
    new PutObjectCommand({
      Key,
      Bucket: env.AWS_BUCKET,
      Body: file,
    }),
  );

  return Key;
};

export default addToS3;
