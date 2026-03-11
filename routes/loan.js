import express from 'express'
//* model
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
//*utils
import { createErr } from '../utils/createErr.js';
//* helper
import upload from '../utils/upload.js';
import { deleteFile, uploadFile } from '../utils/s3.js';

//* cron
import cron from 'node-cron';
import mongoose from 'mongoose';
import { errorLogger, infoLogger } from '../utils/loggerHelper.js';
import { sendWhatsappMessageMedia } from '../utils/whatsappMessage.js';


const router = express.Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//* this cron job will run 4th day of every month at 12:00 AM
// const emiRemeberCornJob = "0 0 4 * *";
// cron.schedule(emiRemeberCornJob, async () => {
//     try {
//       const currentDate = new Date();

//       //* contact number customer
//       const contactNum = "918086009808";
//       // const contactNum = process.env.CONTACT_NUMBER;

//       const activeLoans = await Loan.find({
//         emiStartDate: { $lte: currentDate },
//         emiEndDate: { $gte: currentDate },
//       }).populate("customer", "general");

//       //* remove customer who goes not have phone number
//       const activeLoansWithPhone = activeLoans.filter(
//         (loan) => loan.customer.general.phoneNo
//       );

//       //* check the number start form the country code(india: 91, uae: 971, saudi: 966, qatar: 974, oman: 968, bahrain: 973, kuwait: 965)
//       const countryCode = ["91", "971", "966", "974", "968", "973", "965"];

//       //* remove customer who phoneNumber not start with one of the countrycode
//       const customerWithValidPhoneNo = activeLoansWithPhone.filter((loan) => {
//         const phoneNumber = loan.customer.general.phoneNo;
//         return countryCode.some((code) => phoneNumber.startsWith(code));
//       });

//       // Add a 3-second delay before sending each message
//       await delay(index * 3000); // 3000 milliseconds (3 seconds) delay

//       //* send whatsapp message
//       activeLoansWithPhone.forEach(async (loan) => {
//         const phoneNumber = loan.customer.general.phoneNo;
//         const cusName = loan.customer.general.name;

//         const message = `Hello ${cusName},\n\nA friendly reminder from Leadup: Your EMI is due this month. Please ensure a timely payment. Thank you for your continued support!\n\nfor more details contact: ${contactNum}\nLeadup Team`;
//         const mediaLink = "https://api.leadupcars.com/images/logo.jpg";

//         const messageRes = await sendWhatsappMessageMedia(
//           phoneNumber,
//           message,
//           mediaLink
//         );

//         //* check the message successfully sended and
//         //* push a item to messSendInfo in customer model, with current date and emiRemeber
//         if (messageRes.status === "success") {
//           const customerId = loan.customer._id;
//           const emiRemeberData = {
//             name: "emi",
//             date: new Date(),
//           };
//           await Customer.updateOne(
//             { _id: customerId },
//             {
//               $push: { messSendInfo: emiRemeberData },
//             }
//           );
//         }
//       });

//       res.status(200).json({ success: true });
//     } catch (error) {
//       res.status(500).json({ success: false, error: error.message });

//       const currentTime = new Date().toLocaleString();
//       errorLogger.log({
//         level: "error",
//         timestamp: currentTime,
//         message: `cron error in loan remember:: ${error.message}`,
//         stack: error.stack,
//       });
//     }
// })

//* get a loan
router.get('/:cusid', async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        //* check cusid is valid
        const isValid = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValid) return next(createErr(400, 'Invalid customer id'));

        //* check if customer exist
        const cus = await Customer.findById(cusId).populate('loan').select('loan -_id');
        if (!cus) return next(createErr(404, 'Customer not found'));
        //* take only needed details
        const { loan } = cus._doc;

        //* send a empty res if there  no loan
        if (!loan) return res.status(200).json(false);

        const { _id, __v, updatedAt, createdAt, customer, ...response } = loan._doc;

        //* res
        res.status(200).json(response);

    } catch (err) {
        next(err)
    }
});

//* create a loan
router.post('/:cusid', upload.single('chart'), async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        //* check cusid is valid
        const isValid = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValid) return next(createErr(400, 'Invalid customer id'));

        const loan = req.body;
        const file = req.file;
        const imageName = `chart_${cusId}_${Date.now()}`;

        //* check if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* save customer id into loan
        loan.customer = cusId;

        if (file) {
            //* upload file
            await uploadFile(file.buffer, imageName, file.mimetype, 'public-read');

            //* save chart name into loan
            loan.chart = imageName;
        }

        //* save loan
        const newLoan = await Loan.create(loan);

        //* save loan id to customer
        cus.loan = newLoan._id;

        //* save cus
        await cus.save();

        //* res
        res.status(200).json(newLoan);
    } catch (err) {
        next(err);
    }
})

//* update a loan
router.patch('/:cusid', upload.single('chart'), async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        //* check cusid is valid
        const isValid = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValid) return next(createErr(400, 'Invalid customer id'));

        const loanData = req.body;
        const file = req.file;
        const imageName = `chart_${cusId}}_${Date.now()}}`;

        //* check if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* find loan
        const loanId = cus.loan;
        const loan = await Loan.findById(loanId);

        //* check if loan exist
        if (!loan) return next(createErr(404, 'Loan not found'));

        //* check if there is chart
        if (file) {
            //* upload file
            await uploadFile(file.buffer, imageName, file.mimetype, 'public-read');
            //* save chart name into loan
            loanData.chart = imageName;
        }

        //* update loan
        loan.set(loanData);
        const updateLoan = await loan.save();

        res.status(200).json(updateLoan);

    } catch (err) {
        next(err)
    }
});

//* image delete router
router.delete('/:cusid/chart', async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        //* check cusid is valid
        const isValid = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValid) return next(createErr(400, 'Invalid customer id'));

        //* check if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* find loan
        const loanId = cus.loan;
        const loan = await Loan.findById(loanId);
        //* check if loan exist
        if (!loan) return next(createErr(404, 'Loan not found'));

        //* delete image from s3
        await deleteFile(loan.chart);

        //* remove chart name from loan
        loan.chart = null;

        //* save loan
        await loan.save();

        //* res
        res.status(200).json(true);

    } catch (err) {
        next(err)
    }
})

export default router;