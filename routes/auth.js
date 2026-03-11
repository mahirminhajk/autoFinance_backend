import express from 'express'
//* utils
import { isAdminLevelThree } from '../utils/adminLevel.js';
//* controller
import { login, logout, signup } from '../controllers/authC.js';
import { verfiyAdminOrSameUser, verifyLogin, verifyUser } from '../utils/verifyToken.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs'
import { createErr } from '../utils/createErr.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { infoLogger } from '../utils/loggerHelper.js';
import { sendWhatsappOTP } from '../utils/whatsappMessage.js';

const router = express.Router();

//*signup
router.post('/signup', isAdminLevelThree, signup);

//*Login
router.post('/login', login);

//*verfiy user
router.get('/verify/:id', verifyUser)

//* change password
router.patch('/changepassword/:id', verfiyAdminOrSameUser, async (req, res, next) => {
    try {
        const { password, newPassword } = req.body;

        const user = await User.findById(req.params.id);
        if (user === null) return next(createErr(404, 'User not found'));

        //* check the user password is correct
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return next(createErr(400, 'Invalid credentials'));

        //*password:bcrypt
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt)

        //*save user to DB
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            password: hash,
        }, { new: true });

        //*user data
        const { _id, username, level } = updatedUser._doc;

        infoLogger.info({
            level: 'info',
            message: `USER_PASSWORD_CHANGED:${_id}:${username}:${level}:${new Date().toLocaleString()}`,
        })

        //*send response
        res
            .status(200)
            .json({ success: true, user: { _id, username, level } });
    } catch (err) {
        next(err);
    }
})

//* forgot password
router.patch('/forget-password', async( req, res, next)=>{
    try{
      //* get username
      const { username } = req.body;

      //* check if user exists
      const user = await User.findOne({ username }).exec();

      if (user === null) return next(createErr(404, "User not found"));

      //* generate otp
      const otp = Math.floor(100000 + Math.random() * 900000);

      //* check if otp exists, if exists delete it
      await Otp.findOneAndDelete({ username }).exec();

      //* save otp to DB
      const newOtp = new Otp({
        username,
        userid: user._id,
        otp,
      });

      await newOtp.save();

      //* send otp to admin
       await sendWhatsappOTP(newOtp);

      res.status(200).json({ success: true, message: "OTP sent to admin" });
    }catch(err){
        next(err);
    }
});

router.patch('/verfiy-otp', async( req, res, next)=>{
    try {
        const { username, otp } = req.body;

        //* check if otp exists
        const otpModel = await Otp.findOne({ username }).exec();

        if(otpModel === null) return next(createErr(404, 'OTP Expired, please try again'));

        //* check if otp is correct
        if(otpModel.otp !== otp) return next(createErr(400, 'Invalid OTP'));
       
        //* create a token and send it to user
        const token = jwt.sign({ id: otpModel.userid, username }, process.env.JWT_SECRET, { expiresIn: 60*5 });

        //* send response
        res
            .cookie('change_password_token', token, { httpOnly: false, maxAge: 5 * 60 * 1000 })
            .status(200)
            .json({ success: true, message: 'OTP verified'});

    } catch (error) {
        next(error);
    }
});

router.patch("/changepassword", async (req, res, next) => {
    try {
        const { password } = req.body;

        //* get token from cookie
        const token = req.cookies.change_password_token;
        if(!token) return next(createErr(401, 'Access denied'));
        
        //* verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
            if (err) return next(createErr(401, "Access denied"));
            const { id, username } = data;

            //* check if user exists
            const user = await User.findById(id).exec();
            if (user === null) return next(createErr(404, 'User not found'));

            //*password:bcrypt
            const salt = bcrypt.genSaltSync(10);
            const hash =await bcrypt.hashSync(password, salt)

            //*save user to DB
            user.password = hash;
            await user.save();

            //*user data
            const { _id, level } = user._doc;

            infoLogger.info({
                level: 'info',
                message: `USER_PASSWORD_CHANGED:${_id}:${username}:${level}:${new Date().toLocaleString()}`,
            })

            //*send response
            res
                .clearCookie('change_password_token')
                .status(200)
                .json({ success: true, message: 'Password changed successfully'});
        });

    } catch (error) {
        next(error)
    }
});

//*Logout
router.get('/logout', logout);

export default router;