// import fs from 'fs';
// import mime from 'mime-types';
// import { Queue, Worker, RedisConnection, QueueEvents } from 'bullmq';
// import sharp from "sharp";
// //* utils
// import { uploadFile } from './s3.js';
// import { errorLogger, infoLogger } from './loggerHelper.js';

// //* Create a BullMQ Redis connection
// const connection = new RedisConnection({
//     host: "localhost",
//     port: 6379,
// });

// //* Create a BullMQ Queue
// export const imageUploadQueue = new Queue("imageUpload", { connection });

// //* Create a BullMQ Worker
// const imageUploadWorker = new Worker("imageUpload", async (job) => {
//     try {
//         const { filePaths, fileNames } = job.data;

//         //for loop
//         for (let i = 0; i < filePaths.length; i++) {
//             const filePath = filePaths[i];
//             const fileName = fileNames[i];

//             //* Read the file from the server
//             const fileData = fs.readFileSync(filePath);

//             //* Resize the image
//             const resizedImage = await sharp(fileData).resize({ width: 800 }).toBuffer();

//             //* MIME types of image
//             const mimeType = mime.lookup(filePath);
//             //* upload the file to s3
//             await uploadFile(resizedImage, fileName, mimeType);
//             //* Delete the file from the server
//             fs.unlinkSync(filePath);
//         }
//     } catch (err) {
//         errorLogger.error('Error in uploading image', err);
//     }
// }, { connection });


// export const imageUploadQueueEvents = new QueueEvents('imageUpload', { connection });

// imageUploadQueueEvents.on('completed', (jobId, result) => {
//     infoLogger.info({
//         level: 'info',
//         message: 'Image uploaded successfully',
//         jobId,
//         result
//     });
// });

// imageUploadQueueEvents.on('failed', (jobId, err) => {
//     errorLogger.error('Error in uploading image', err);
// });


// //* important link
// //! https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
