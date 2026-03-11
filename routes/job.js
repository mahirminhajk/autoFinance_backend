// import { imageUploadQueue, imageUploadQueueEvents } from '../utils/jobWroker.js';
// import { createErr } from '../utils/createErr.js';


// // router.get('/:jobId', async (req, res, next) => {
// //     try {
// //         const _JobId = req.params.jobId;

// //         //* Get the job from the queue
// //         const job = await imageUploadQueue.getJob(_JobId);

// //         //* If the job is not found, return an error
// //         if (!job) return next(createErr(404, 'Job not found'));

// //         //* Get details of the job
// //         const status = await job.getState();

// //         //* check if job is complete
// //         if (status === 'completed') {
// //             return res.status(200).json({ status: 'completed' });
// //         } else if (status === 'failed') {
// //             return res.status(200).json({ status: 'failed' });
// //         } else {
// //             return res.status(200).json({ status: 'progress' });
// //         }
// //     } catch (err) {
// //         next(err)
// //     }
// // });

// export const docJobFinder = async (jobId) => {
//     try {
//         //* Get the job from the queue
//         const job = await imageUploadQueue.getJob(jobId);

//         //* If the job is not found, return an error
//         if (!job) return 'completed';

//         //* Get details of the job
//         const status = await job.getState();

//         //* check if job is complete
//         if (status === 'completed') {
//             return 'completed';
//         } else if (status === 'failed') {
//             return 'failed';
//         } else {
//             return 'active';
//         }
//     } catch (err) {
//         return 'failed';
//     }
// }

