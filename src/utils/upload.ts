import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Blob } from "buffer";
import { v4 as uuid } from "uuid";

const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  }
})

export const uploadToS3 = async (file: any, user_id: string) => {
  const key = `${user_id}/${uuid()}`
  const date = new Date()
  date.setMonth(date.getMonth() + 2)
  const command = new PutObjectCommand({
    Bucket: "onlyfriends-bucket",
    Key: key,
    Expires: date,
    Body: file,
    // ContentType: file.mimetype,
    ContentType: 'image/jpeg',
  })
  try {
    await s3.send(command);
    return key;
  } catch (error) {
    console.log(error);
  }
}