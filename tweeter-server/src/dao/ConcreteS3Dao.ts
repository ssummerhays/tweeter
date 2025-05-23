import { S3DAO } from "./interfaces/S3Dao";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

const BUCKET = "340spencerbucket";
const REGION = "us-west-2";

export class ConcreteS3Dao implements S3DAO {
  async putImage(
    fileName: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );
    const s3Params = {
      Bucket: BUCKET,
      Key: "image/" + fileName,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    const client = new S3Client({ region: REGION });
    try {
      await client.send(c);
      return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("Server Error: s3 put image failed with: " + error);
    }
  }

  getImageUrl(fileName: string): string {
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
  }
}
