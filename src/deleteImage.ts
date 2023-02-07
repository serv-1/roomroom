import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ObjectIdentifier,
} from "@aws-sdk/client-s3";
import env from "./env";
import s3Client from "./s3Client";

const deleteImage = async (keyOrObjects: string | ObjectIdentifier[]) => {
  if (typeof keyOrObjects === "string") {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: keyOrObjects,
      }),
    );
  } else {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: env.AWS_BUCKET,
        Delete: { Objects: keyOrObjects },
      }),
    );
  }
};

export default deleteImage;
