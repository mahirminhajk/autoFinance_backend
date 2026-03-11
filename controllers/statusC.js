//* model
import Customer from "../models/Customer.js";
//* helpers
import { checkStatusIsCorrect } from "../helpers/statusHelper.js";
//* utils
import { createErr } from "../utils/createErr.js";
import mongoose from "mongoose";

export const getCustomersWithStatus = async (req, res, next) => {
    try {
        const status = req.params.statusname;
        //* get cus
        const cus = await Customer.find({ status });
        //* response
        res.status(200).json(cus);
    } catch (err) {
        next(err);
    }
}

export const getCustomerStatus = async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* get status
        const status = cus.general.status;

        //* res
        res.status(200).json({ status });

    } catch (err) {
        next(err);
    }
}

export const updateCustomerStatus = async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const newStatus = req.body.status;
        //* check status is correct
        const statusCorrect = checkStatusIsCorrect(newStatus);

        if (!statusCorrect) return next(createErr(400, 'Status is incorrect'))
        //* update the customer
        const updateCus = await Customer.findByIdAndUpdate(
            cusId,
            { $set: { 'general.status': newStatus } },
            { new: true }
        );
        //* check if customer exit
        if (!updateCus) return next(createErr(404, 'Custoemr not found'))
        //* update the statusHistory
        const { statusHistory } = updateCus;
        //* if there is already added status to the statusHistory remove it and add the new one
        const statusExist = statusHistory.find((statusObj) => statusObj.status === newStatus);
        if (statusExist) {
            //* remove the status
            statusHistory.pull(statusExist);
        }
        //* Push the status update to statusHistory manually
        const updatedBy = req.user.username;
        updateCus.statusHistory.push({ status: newStatus, updatedBy });
        await updateCus.save();
        //* res
        res.status(200).json({
            success: true
        });
    } catch (err) {
        next(err);
    }
}