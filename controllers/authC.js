import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
//* models
import User from '../models/User.js'
//* utils
import { createErr } from '../utils/createErr.js';
import { infoLogger } from '../utils/loggerHelper.js';

//? POST /signup
export const signup = async (req, res, next) => {
    try {

        //*password:bcrypt
        const { password } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hash =await bcrypt.hashSync(password, salt)

        //*save user to DB
        const user = await User.create({
            username: req.body.username,
            password: hash,
            level: parseInt(req.body.level),
        });

        infoLogger.info({
            level: 'info',
            message: `USER_CREATED:${user._id}:${user.username}:${user.level}:${new Date().toLocaleString()} \n user: ${JSON.stringify(req.user)}`,
        })

        //*user data
        const { _id, username, level } = user._doc;

        //*send response
        res
            .status(201)
            .json({ success: true, id: _id });

    } catch (err) {
        next(err);
    }
};

//? POST /login
export const login = async (req, res, next) => {
    try {
        //*user
        const user = await User.findOne({ username: req.body.username });
        if (!user) return next(createErr(404, 'User not found')); //! check if user exists

        //*password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password); //! check if password matches
        if (!isPasswordMatch) return next(createErr(400, 'Invalid credentials'));

        //*user data
        const { _id, username, level } = user._doc;

        //*token::stored in cookie[_id, username, level]
        const token = jwt.sign({ id: _id, username, level }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        infoLogger.info({
            level: 'info',
            message: `USER_LOGGED_IN:${_id}:${username}:${level}:${new Date().toLocaleString()}`,
        })

        //*send response
        res
            .cookie('access_token', token, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .status(200)
            .json({ _id, username, level });


    } catch (err) {
        next(err);
    }
}

//? GET /logout
export const logout = (req, res, next) => {
    res
        .clearCookie("access_token")
        .send({ success: true });
}

