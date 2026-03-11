import express from 'express'
//* controllers
import { createCustomer, deleteCustomer, getCustomers, getCustomer, sendWhatsappMsgToCustomer, getCustomerField, sendWhatsappTextMsgToCustomer, getInsuranceValidityList } from '../controllers/customerC.js';
import { getCustomerStatus, getCustomersWithStatus, updateCustomerStatus } from '../controllers/statusC.js';
//* models
import Customer from '../models/Customer.js';
//* utils
import { verifyToken } from '../utils/verifyToken.js';
import uploadToServer from '../utils/uploadToServer.js'
import upload from '../utils/upload.js';
import { getCustomerComplete, getCustomerFTR, getCustomerGeneral, getCustomerHeadAndValue, getCustomerLoanDesp, getCustomerLoginFormData, getCustomerRtoWork, updateCustomerComplete, updateCustomerFTR, updateCustomerGeneral, updateCustomerHeadAndValue, updateCustomerLoanDesp, updateCustomerLoginFormData, updateCustomerRtoWork, updateCustomerBankForm, getCustomerBankForm } from '../controllers/customerFormC.js';
import { addDoc, deleteDocImg, getDoc, getDocs, updateDoc } from '../controllers/customerDocC.js';
//* cron
import cron from 'node-cron';
import { infoLogger } from '../utils/loggerHelper.js';
import { sendWhatsappMessage, sendWhatsappMessageMedia } from '../utils/whatsappMessage.js';

const router = express.Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//* cron job
const insuracneRemiderCornJob = '0 8 * * 1'; // Every Monday at 8:00 AM
// const insuracneRemiderCornJob = '* * * * *'; // TEST:Every 1 minutes
cron.schedule(insuracneRemiderCornJob, async () => {
  console.log("Running insurance reminder cron job...");
  try {
    const currentDate = new Date();

    // Calculate the start and end dates of the current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Set to Monday

    const endOfWeek = new Date(currentDate);
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(currentDate.getDate() + (7 - currentDate.getDay())); // Set to Sunday

    console.log(`Current date: ${currentDate}`);
    console.log(`Start of week: ${startOfWeek}`);
    console.log(`End of week: ${endOfWeek}`);

    const customers = await Customer.find({
      // Specify your conditions here
      "general.insuranceDate": { $gte: startOfWeek, $lte: endOfWeek }, // Adjust the regex as needed
    }).select("general");

    console.log(`Sending insurance reminders to ${customers.length} customers...`);
    
    customers.forEach(async (customer) => {
      const phoneNumber = customer.general.phoneNo;
      const cusName = customer.general.name;

      console.log(`found date: ${customer.general.insuranceDate}`);
      
      console.log(`Sending insurance reminder to ${cusName} (${phoneNumber})...`);
      
      const message = [
        `Hello ${cusName},`,
        "A friendly reminder from Leadup:",
        "Your insurance will expire this week. Please ensure it's renewed promptly. If you've already taken care of it, kindly disregard this message.",
        "For more details, contact: +91 95448 80098",
        "Leadup Team",
      ].join("\n");

//       const message = `Hello ${cusName},\n\nA friendly reminder from Leadup:Your insurance will expire this week. please ensure it's renewed promptly. If you've already taken care of it, kindly disregard this message.
// \n\nfor more details contact: +919544880098\nLeadup Team`;
      const mediaLink = "https://api.leadupcars.com/images/logo.jpg";

      // Add a 3-second delay before sending each message
      await delay(3000); // 3000 milliseconds (3 seconds) delay

      const messageRes = await sendWhatsappMessageMedia(
        phoneNumber,
        message,
        mediaLink
      );

      //* check the message successfully sened and push a item to messSendInfo in customer modek, with current date and insuracneRemider
      if (messageRes.status === "success") {
        const customerId = customer._id;
        const insuranceRemiderData = {
          name: "insurance",
          date: new Date(),
        };

        await Customer.updateOne(
          { _id: customerId },
          {
            $push: { messSendInfo: insuranceRemiderData },
          }
        );
      }
    });

  } catch (error) {
    console.log(`cron error in insurance remember:: ${error.message}`);
    errorLogger.log({
      level: 'error',
      timestamp: currentTime,
      message: `cron error in insurance remember:: ${error.message}`,
      stack: error.stack,
    });
  }
});

//* v3
router.get('/insurance-validity-list', getInsuranceValidityList);

//* get all customer
//? /?search=abc
router.get('/', getCustomers);

//* get a customer full details
router.get('/:cusid', getCustomer);

//* get a customer certain fields
router.get("/:cusid/field/:field", getCustomerField);

//* create a customer
router.post('/general', createCustomer);

//* get customer general
router.get('/:cusid/general', getCustomerGeneral);

//* update customer general
router.patch('/:cusId/general', updateCustomerGeneral);

//* customer update, push all to array //? /cusid?field=verification || readyLogin || ftr || ...
router.post('/:cusid/headvalue', updateCustomerHeadAndValue);

//* get customer head and value //? /cusid/headvalue?field=verification || readyLogin || ftr || ...
router.get('/:cusid/headvalue', getCustomerHeadAndValue);

//* get customer login
router.get('/:cusid/login', getCustomerLoginFormData)

//* update customer login value
router.patch('/:cusid/login', verifyToken, updateCustomerLoginFormData);

router.get('/:cusid/bank', getCustomerBankForm);

router.patch('/:cusid/bank', updateCustomerBankForm);

//* get customer ftr
router.get('/:cusid/ftr', getCustomerFTR);

//* update customer ftr
router.patch('/:cusid/ftr', updateCustomerFTR);

//* get customer loanDesp
router.get('/:cusid/loandesp', getCustomerLoanDesp);

//* update customer loanDesp

router.patch('/:cusid/loandesp', upload.single('despLetter'), updateCustomerLoanDesp);

//* get customer rtoWork
router.get('/:cusid/rtowork', getCustomerRtoWork);

//* update customer rtoWork
router.patch('/:cusid/rtowork', updateCustomerRtoWork);

//* get customer completed
router.get('/:cusid/completed', getCustomerComplete);

//* update customer completed
router.patch('/:cusid/completed', upload.fields([{ name: 'payoutSlip', maxCount: 1 }, { name: 'invoice', maxCount: 1 }]), updateCustomerComplete);

//* delete customer
router.delete('/:cusId', deleteCustomer)

//! STATUS ROUTER

//* get all customer with specific status
router.get('/status/:statusname', getCustomersWithStatus);

//* get a customer status
router.get('/:cusid/status', getCustomerStatus);

//* update status
router.patch('/:cusid/status', verifyToken, updateCustomerStatus);

//! DOC ROUTER

//* add with two or one image doc
router.post('/doc/:cusid', uploadToServer.fields([{ name: 'img1', maxCount: 1 }, { name: 'img2', maxCount: 1 }]), addDoc);

router.patch(
  "/doc/:cusid",
  uploadToServer.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
  ]),
  updateDoc
);

//* get docs 
router.get('/doc/:cusid', getDocs);

//* get a spicif doc    
router.get('/doc/:cusid/:docname', getDoc);

//* delete a doc
router.delete('/doc/:cusid', deleteDocImg)

//? wa message // api/cus/wa/kdkwod54cusid?template=hello_world
router.get('/wa/:cusid', sendWhatsappMsgToCustomer);

router.post("/wa/:cusid/text", sendWhatsappTextMsgToCustomer);

export default router;