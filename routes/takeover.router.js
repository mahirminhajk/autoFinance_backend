import { Router } from "express";
import {TakeOverService} from "../service/takeOverService.js";

import Loan from "../models/Loan.js";
import cron from "node-cron";
import Customer from "../models/Customer.js";


const router = Router();

//* get all takeovers
router.get('/', async (req, res, next) => {
    try {
        const takeovers = await TakeOverService.getTakeOverList();
        res
            .status(200)
            .json({takeovers});
    } catch (err) {
        next(err);
    }
});

export default router;

const updateTakeOverList = async () => {
    try {
        console.log("Running cron job to check loan EMI start date...");

        // Get the date exactly 12 months ago
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Find loans where emiStartDate is exactly 12 months ago
        const loans = await Loan.find({ emiStartDate: { $lte: twelveMonthsAgo } }).populate('customer');

        for (const loan of loans) {
            if (!loan.customer) continue; // Skip if no customer is linked

            const general = {
                name: loan.customer.general.name,
                phoneNo: loan.customer.general.phoneNo,
            };

            await TakeOverService.addCusToTakeOver({
                _id: loan.customer._id,
                index: loan.customer.index, 
                general,
                emiStartDate: loan.emiStartDate,
                emiEndDate: loan.emiEndDate,
            });

            //* update the customer completedValue.takeOverList to true
            const cus = await Customer.findById(loan.customer._id);
            if (cus) {
                if(!cus.completed) {
                    cus.completed = {};
                }
                cus.completed.takeOverList = "true";
                await cus.save();
            }

            console.log(`Added customer ${loan.customer.general.name} to TakeOver`);
        }
    } catch (error) {
        console.error("Error running cron job:", error);
    }
};

// Schedule the cron job to run every day at 12:30 AM
cron.schedule('30 0 * * *',async () => {
    await updateTakeOverList();
});