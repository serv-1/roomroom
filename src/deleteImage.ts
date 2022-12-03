import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import env from "./env";
import s3Client from "./s3Client";

const deleteImage = async (Key: string) => {
  const input = { Bucket: env.AWS_BUCKET, Key };
  await s3Client.send(new DeleteObjectCommand(input));
};

export default deleteImage;
