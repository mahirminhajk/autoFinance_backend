import express from 'express';
import User from '../models/User.js';
import { verfiyAdmin, verfiyAdminOrSameUser } from '../utils/verifyToken.js';
import { createErr } from '../utils/createErr.js';
import { infoLogger } from '../utils/loggerHelper.js';

const router = express.Router();

//* get all users
router.get('/', verfiyAdmin, async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }, { password: 0 });
        res
            .status(200)
            .json(users);
    } catch (err) {
        next(err);
    }
});

//* get user by id
router.get('/:id', verfiyAdminOrSameUser, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });

        //* check user
        if (user === null) return next(createErr(404, 'User not found'));

        res
            .status(200)
            .json(user);

    } catch (err) {
        next(err);
    }
});

//* update user by id
router.patch('/:id', verfiyAdminOrSameUser, async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;

        const updateUser = await User.findByIdAndUpdate(req.params.id, {
            name, email, phone, address
        }, { new: true });

        //* check update
        if (updateUser === null) return next(createErr(404, 'User not found'));

        res
            .status(200)
            .json({
                success: true,
                username: updateUser.username,
            });
    } catch (err) {
        next(err);
    }
});

//* delete the user
router.delete('/:id', verfiyAdmin, async (req, res, next) => {
    try {
        const userId = req.params.id;

        const deleteUser = await User.findByIdAndDelete(userId);

        //* check delete
        if (deleteUser === null) return next(createErr(404, 'User not found'));

        //* log
        infoLogger.info({
            level: 'info',
            message: `User ${deleteUser.username} deleted by ${req.user.username}`
        });

        res
            .status(200)
            .json({
                success: true,
                username: deleteUser.username,
            });
    } catch (err) {
        next(err)
    }
})




export default router;