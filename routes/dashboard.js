import express from 'express'
import { verifyToken } from '../utils/verifyToken.js';
import Customer from '../models/Customer.js';
import Dealer from '../models/Dealer.js';
import Bank from '../models/Bank.js';


const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
    try {
        //* user from token
        const { id, username, level } = req.user;
        //* total customers, dealers and banks
        const totalCustomers = await Customer.countDocuments();
        const totalDealers = await Dealer.countDocuments();
        const totalBanks = await Bank.countDocuments();
        //* pending and conform customers
        const totalPendingCustomers = await Customer.countDocuments({ "general.status": "pending" });
        const totalConformCustomers = await Customer.countDocuments({ "general.status": "conform" });
        //* data
        const data = {
            id,
            username,
            level,
            totalCustomers,
            totalDealers,
            totalBanks,
            totalPendingCustomers,
            totalConformCustomers
        }
        //* res
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});


export default router;