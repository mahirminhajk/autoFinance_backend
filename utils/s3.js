import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv'
import { infoLogger } from './loggerHelper.js';

//* dotenv config
dotenv.config();


//* s3Client
export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

//* uploadFile(file.buufer, imageName, file.mimetype)
//? const fileURL = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
//? https://leadup-crm.s3.ap-south-1.amazonaws.com/sbi_1684313708260
export function uploadFile(fileBuffer, fileName, mimetype, acl = 'public-read') {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype,
        ACL: acl,//! default: private , public-read
    }

    infoLogger.info({
        message: "Image Uploaded",
        fileName: fileName,
        mimetype: mimetype,
        acl: acl
    });
    return s3Client.send(new PutObjectCommand(uploadParams));
}

//* deleteFile(db.imageName)
export function deleteFile(fileName) {
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    }
    infoLogger.info({
        message: "Image Deleted",
        fileName: fileName,
    });
    return s3Client.send(new DeleteObjectCommand(deleteParams));
}

//* getObjectSignedURL(db.imageName)
export async function getObjectSignedURL(key) {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        }
        const command = new GetObjectCommand(params)
        const seconds = 3600;

        await s3Client.send(new HeadObjectCommand(params));

        const url = await getSignedUrl(s3Client, command, { expiresIn: seconds })
        return url;
    } catch (error) {
        return false;
    }
}