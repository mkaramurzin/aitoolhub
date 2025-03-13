import { env } from "@/env";
import { UPLOAD_MAX_FILE_SIZE } from "@/lib/constants";
import { s3Client } from "@/lib/s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuidv4 } from "uuid";
import { authenticatedProcedure, createTRPCRouter } from "../trpc";

export const imagesRouter = createTRPCRouter({
  getPresignedPost: authenticatedProcedure.mutation(async ({ ctx }) => {
    const imageId = uuidv4();
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: imageId,
      Fields: {
        key: imageId,
      },
      Conditions: [
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
      ],
    });

    return { presignedPost, imageId };
  }),
});
