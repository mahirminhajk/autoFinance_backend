import axios from "axios";
import { errorLogger } from "./loggerHelper.js";
import dotenv from "dotenv";

//*config dotenv
dotenv.config();
//* dotenv variables
//TODO: remove hardcoded values
const dxingEndpoint = process.env.DXING_ENDPOINT;
const secert = process.env.DXING_SECERT
const unqiueId = process.env.DXING_UNQIUE
// const instanceId = process.env.DXING_INSTANCE_ID;
// const accessToken = process.env.DXING_ACCESS_TOKEN;

const logourl = "https://api.leadupcars.com/images/logo.jpg";

const messageStaffNumber = "+91 95448 80098";
// const MesTemplates = [
//   {
//     name: "set1",
//     message:
//       `*Please Send these documents to our given below WhatsApp number to confirm your information*

// - Aadhar
// - PAN
// - Photo
// - Land Tax
// - KSEB bill
// - Last 6 month’s statement
// - RC
// - Insurance

// For further updates please connect with our staffs
// Contact number: ${messageStaffNumber}

//       `,
//     media: logourl,
//   },
//   {
//     name: "set2",
//     message:
//       `*Please Send these documents to our given below Whatsapp number to confirm your information*

// - Aadhar
// - Pan (voter id / passport)
// - Photo
// - Land tax owner’s (Aadhar, Photo, Pan)
// - KSEB bill
// - Last 6 month’s statement
// - RC
// - Insurance

// For further updates please connect with our staffs
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "set3",
//     message:`*Please Send these documents to our given below Whatsapp number to confirm your information*

// - Aadhar
// - Pan
// - Photo
// - Land tax
// - KSEB bill
// - Last 1-year statement
// - Last 2-year statement
// - GST paper
// - Business proof

// For further updates please connect with our staffs
// Contact number: ${messageStaffNumber}`,
//     media: logourl,
//   },
//   {
//     name: "set4",
//     message:
//       `*Please Send these documents to our given below Whatsapp number to confirm your information*

// - Aadhar
// - Pan
// - Photo
// - Land tax
// - Last 6 months statement
// - Land tax owners
// - Business proof
// - Last 2 year IT
// - GST paper
// - Shop photo
// - House photo

// For further updates please connect with our staffs
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "set5",
//     message:
//       `*Please Send these documents to our given below Whatsapp number to confirm your information*

// - Firm
// - Last 2-year ITR
// - Computation
// - Profit Loss a/c
// - Pan card
// - Last 6 months statement
// - Partnership details
// - Partner all pan card
// - Firm Seal

// For managing partner:
// - Pan
// - Aadhar
// - Photo
// - RC
// - Insurance

// For further updates please connect with our staffs
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "logged",
//     message:
//       `Dear customer, your loan application is successfully logged in.
// For further updates, please connect with our staffs.
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "approved",
//     message:
//       `Dear customer, your loan application is approved! We're delighted to inform you that by paying your 12 EMI through your bank account, you're unlocking an exciting opportunity. You could receive three times the loan amount in future loans. This is a fantastic chance to enhance your borrowing potential and secure your financial future. Thank you for choosing us. For further updates please connect with our staffs.
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "rto_work",
//     message:
//       `Dear customer,
// Please confirm that the address has changed on the RC in the Parivahan website. If okay, then transfer the insurance to your name.

// For further updates, please connect with our staffs.
// Contact number: ${messageStaffNumber}
// `,
//     media: logourl,
//   },
//   {
//     name: "load_through_bank",
//     message: `Dear valued customer, 
//     we have great news for you! Paying your 12 EMI through your bank account means you can potentially receive three times the amount in future loans. This is an incredible opportunity to maximize your borrowing power and secure your financial future. Thank you for choosing us.
//     For further updates please connect with our staffs
//     Contact number:${messageStaffNumber}`,
//     media: logourl,
//   }
// ];

const MesTemplates = [
  {
    name: "set1",
    message: [
      "*Please Send these documents to our given below WhatsApp number to confirm your information*",
      "",
      "- Aadhar",
      "- PAN",
      "- Photo",
      "- Land Tax",
      "- KSEB bill",
      "- Last 6 months’ statement",
      "- RC",
      "- Insurance",
      "",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "set2",
    message: [
      "*Please Send these documents to our given below WhatsApp number to confirm your information*",
      "",
      "- Aadhar",
      "- Pan (voter id / passport)",
      "- Photo",
      "- Land tax owner’s (Aadhar, Photo, Pan)",
      "- KSEB bill",
      "- Last 6 months’ statement",
      "- RC",
      "- Insurance",
      "",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "set3",
    message: [
      "*Please Send these documents to our given below WhatsApp number to confirm your information*",
      "",
      "- Aadhar",
      "- Pan",
      "- Photo",
      "- Land tax",
      "- KSEB bill",
      "- Last 1-year statement",
      "- Last 2-year statement",
      "- GST paper",
      "- Business proof",
      "",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "set4",
    message: [
      "*Please Send these documents to our given below WhatsApp number to confirm your information*",
      "",
      "- Aadhar",
      "- Pan",
      "- Photo",
      "- Land tax",
      "- Last 6 months statement",
      "- Land tax owners",
      "- Business proof",
      "- Last 2 year IT",
      "- GST paper",
      "- Shop photo",
      "- House photo",
      "",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "set5",
    message: [
      "*Please Send these documents to our given below WhatsApp number to confirm your information*",
      "",
      "- Firm",
      "- Last 2-year ITR",
      "- Computation",
      "- Profit Loss a/c",
      "- Pan card",
      "- Last 6 months statement",
      "- Partnership details",
      "- Partner all pan card",
      "- Firm Seal",
      "",
      "For managing partner:",
      "- Pan",
      "- Aadhar",
      "- Photo",
      "- RC",
      "- Insurance",
      "",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "logged",
    message: [
      "Dear customer, your loan application is successfully logged in.",
      "For further updates, please connect with our staffs.",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "approved",
    message: [
      "Dear customer, your loan application is approved! We're delighted to inform you that by paying your 12 EMI through your bank account, you're unlocking an exciting opportunity. You could receive three times the loan amount in future loans. This is a fantastic chance to enhance your borrowing potential and secure your financial future.",
      "Thank you for choosing us. For further updates please connect with our staffs.",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "rto_work",
    message: [
      "Dear customer,",
      "Please confirm that the address has changed on the RC in the Parivahan website. If okay, then transfer the insurance to your name.",
      "",
      "For further updates, please connect with our staffs.",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  },
  {
    name: "load_through_bank",
    message: [
      "Dear valued customer,",
      "We have great news for you! Paying your 12 EMI through your bank account means you can potentially receive three times the amount in future loans. This is an incredible opportunity to maximize your borrowing power and secure your financial future.",
      "Thank you for choosing us.",
      "For further updates please connect with our staffs",
      `Contact number: ${messageStaffNumber}`
    ].join('\n'),
    media: logourl,
  }
];


//* function to send whatsapp message
export const sendWhatsappMessage = async (number, message) => {

  const data = {
    recipient: number,
    type: "text",
    message: message,
    secret: secert,
    account: unqiueId,
  };

  // const data = {
  //   number: number,
  //   type: "text",
  //   message: message,
  //   instance_id: instanceId,
  //   access_token: accessToken,
  // };

  const encodedMessage = encodeURIComponent(message);
  const url = `https://app.dxing.in/api/send/whatsapp?secret=${secert}&account=${unqiueId}&recipient=${number}&type=text&message=${encodedMessage}`;


  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    errorLogger.error({
      level: "error",
      timestamp: new Date().toLocaleString(),
      message: `Error sending message: ${error.message}`,
      stack: error.stack,
    });
  }

  // try {
  //   const response = await axios.post(dxingEndpoint, data);
  //   console.log("response: ", response.data);
  //   return response.data;
  // } catch (error) {
  //   errorLogger.error({
  //     level: "error",
  //     timestamp: new Date().toLocaleString(),
  //     message: `Error sending message: ${error.message}`,
  //     stack: error.stack,
  //   });
  // }
};

//* function to send whatsapp media message
export const sendWhatsappMessageMedia = async (number, message, media) => {
  const data = {
    recipient: number,
    type: "media",
    message: message,
    media_url: media,
    secret: secert,
    account: unqiueId,
  };

  // const data = {
  //   number: number,
  //   type: "media",
  //   message: message,
  //   media_url: media,
  //   instance_id: instanceId,
  //   access_token: accessToken,
  // };

  const encodedMessage = encodeURIComponent(message);
  const url = `https://app.dxing.in/api/send/whatsapp?secret=${secert}&account=${unqiueId}&recipient=${number}&type=media&message=${encodedMessage}&media_type=image&media_url=${media}`;

  try {
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    errorLogger.error({
      level: "error",
      timestamp: new Date().toLocaleString(),
      message: `Error sending message: ${error.message}`,
      stack: error.stack,
    });
  }

  // try {
  //   const response = await axios.post(dxingEndpoint, data);
  //   return response.data;
  // } catch (error) {
  //   errorLogger.error({
  //     level: "error",
  //     timestamp: new Date().toLocaleString(),
  //     message: `Error sending message: ${error.message}`,
  //     stack: error.stack,
  //   });
  // }

};

//* function to send text whatsapp 
export const sendTextWhatsappMessage = async (number, message) => {
  //* check if the number is 12 digits
  if (number.length !== 12) {
    return Promise.reject("Phone number invalid");
  }
  return sendWhatsappMessage(number, message);
}

//* function to send whatsapp template message
export const sendWhatssappTemplateMessage = async (number, templateName) => {
  // Check if the templateName exists in MesTemplates
  const template = MesTemplates.find(
    (template) => template.name === templateName
  );
  if (!template) {
    return Promise.reject("Template not found");
  }

  //* check if the number is 12 digits
  if (number.length !== 12) {
    return Promise.reject("Phone number invalid");
  }

  if (template.media) {
    //* send message with media
    return sendWhatsappMessageMedia(number, template.message, template.media);
  } else {
    //* send text message
    return sendWhatsappMessage(number, template.message);
  }
};

//* function to send whatsapp otp
export const sendWhatsappOTP = async (otpModel) => {
  const { username, otp } = otpModel;

  const adminNumber = process.env.ADMIN_NUMBER;

  // const data = {
  //   number: adminNumber,
  //   type: "text",
  //   message: `${otp} is OTP for user ${username} to reset password.`,
  //   instance_id: instanceId,
  //   access_token: accessToken,
  // };

  const data = {
    recipient: adminNumber,
    type: "text",
    message: `${otp} is OTP for user ${username} to reset password.`,
    secret: secert,
    account: unqiueId,
  };

  try {
    await axios.post(dxingEndpoint, data);
  } catch (error) {
    errorLogger.error({
      level: "error",
      timestamp: new Date().toLocaleString(),
      message: `Error sending message: ${error.message}`,
      stack: error.stack,
    });
  }
};
