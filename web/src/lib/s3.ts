import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";
export const s3Client = new S3Client({
  region: "us-west-2",
  forcePathStyle: true,
  endpoint:
    process.env.NODE_ENV !== "development"
      ? undefined
      : env.NEXT_PUBLIC_S3_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
