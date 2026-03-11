import express from 'express'
import { sendWhatsappMessage, sendWhatsappMessageMedia, sendWhatsappOTP } from '../utils/whatsappMessage.js';

const router = express.Router();

router.post('/wa', async (req, res, next) => {
    try {
      const number = req.body.number;
      const templateName = req.body.template;

      // const messageRes = await sendWhatsappMessage('917293338400',
      // 'hello this is a messag from dev');

    //   const message = `Hello Mahir Minhaj K,\n\nA friendly reminder from Leadup: Your EMI is due this month. Please ensure a timely payment. Thank you for your continued support!\n\nfor more details contact: 918086009808\nLeadup Team`;
    //   const mediaLink = "https://api.leadupcars.com/images/logo.jpg";

    //   const messageRes = await sendWhatsappMessageMedia('917293338400', message, mediaLink);

      // const messageRes = await sendWhatsappMessageMedia(
      //   "917293338400",
      //   "hello this is a meida message from dev",
      //   "https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg"
      // );

      res.json({ success: true, message: messageRes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


export default router;