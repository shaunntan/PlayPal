// Import the required AWS SDK clients and commands for Node.js
import {
    CreateBucketCommand,
    DeleteObjectCommand,
    PutObjectCommand,
    DeleteBucketCommand }
  from "aws-sdk/client/s3";
  import { s3Client } from "./libs/s3Client.js"; // Helper function that creates Amazon S3 service client module.
  import { getSignedUrl } from "aws-sdk/s3-request-presigner";
  import fetch from "node-fetch";
  
  // Set parameters
  // Create a random names for the Amazon Simple Storage Service (Amazon S3) bucket and key
  export const bucketParams = {
    Bucket: `shaunntestbucket`,
    Key: `cat.jpg`,
    Body: "BODY"
  };
  export const run = async () => {
    try {
      // Create an Amazon S3 bucket.
      console.log(`Creating bucket ${bucketParams.Bucket}`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketParams.Bucket }));
      console.log(`Waiting for "${bucketParams.Bucket}" bucket creation...`);
    } catch (err) {
      console.log("Error creating bucket", err);
    }
    try {
      // Create the command.
      const command = new PutObjectCommand(bucketParams);
  
      // Create the presigned URL.
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      console.log(
        `\nPutting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`
      );
      console.log(signedUrl);
      const response = await fetch(signedUrl);
      console.log(
        `\nResponse returned by signed URL: ${await response.text()}\n`
      );
      return response;
    } catch (err) {
      console.log("Error creating presigned URL", err);
    }
    try {
      // Delete the object.
      console.log(`\nDeleting object "${bucketParams.Key}"} from bucket`);
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketParams.Bucket, Key: bucketParams.Key })
      );
    } catch (err) {
      console.log("Error deleting object", err);
    }
    try {
      // Delete the Amazon S3 bucket.
      console.log(`\nDeleting bucket ${bucketParams.Bucket}`);
      await s3.send(new DeleteBucketCommand({ Bucket: bucketParams.Bucket }));
    } catch (err) {
      console.log("Error deleting bucket", err);
    }
  };
  run();