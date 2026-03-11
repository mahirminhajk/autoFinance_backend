import express from "express";
//* model
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import { isValidDate, parseDateString } from "../utils/ValidateDate.js";

const router = express.Router();

//* new transaction
router.post("/transaction", async (req, res, next) => {
  try {
    //* create new transaction
    const transaction = await Transaction.create({
      date: req.body.date,
      label: req.body.label,
      details: req.body.details,
      amount: req.body.amount,
    });

    //* send response
    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

//* update a transaction
router.put("/transaction/:transactionid", async (req, res, next) => {
  try {
    const transactionId = req.params.transactionid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(transactionId);
    if (!isValidateObjectId)
      return next(createErr(400, "Invalid transaction id"));

    //* find the transaction
    const transaction = await Transaction.findById(transactionId);

    //* check if transaction exist
    if (!transaction) return next(createErr(404, "Transaction not found"));

    //* update the transaction, if there date set the new date, what in the req.body only update that value, other vlaues are old
    transaction.date = req.body.date || transaction.date;
    transaction.label = req.body.label || transaction.label;
    transaction.details = req.body.details || transaction.details;
    transaction.amount = req.body.amount || transaction.amount;

    //* save the transaction
    await transaction.save();

    //* send response
    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
});

//* delete a transaction
router.delete("/transaction/:transactionid", async (req, res, next) => {
  try {
    const transactionId = req.params.transactionid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(transactionId);
    if (!isValidateObjectId)
      return next(createErr(400, "Invalid transaction id"));

    //* find the transaction and delete it
    await Transaction.findByIdAndDelete(transactionId);

    //* send response
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

//* get all transactions
router.get("/transactions", async (req, res, next) => {
  try {
    const search = req.query.search;
    const labelFilter = req.query.label;

    //* pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    let query = {};

    //* search
    if (search) {
      if (isValidDate(search)) {
        const serachDate = parseDateString(search);
        const startDate = new Date(serachDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(serachDate);
        endDate.setHours(23, 59, 59, 999);

        query = {
          date: {
            $gte: startDate,
            $lte: endDate,
          }, // search by date
        };
      } else
        query = {
          $or: [
            { label: { $regex: search, $options: "i" } },
            { details: { $regex: search, $options: "i" } },
          ],
        };
    }

    //* label filter
    if (labelFilter)
      query = {
        $or: [{ label: { $regex: labelFilter, $options: "i" } }],
      };

    //* total transactions
    const totalTransactions = await Transaction.countDocuments(query);

    //* find transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalTransactions / limit);

    //* send response
    return res.status(200).json({
      success: true,
      transactions,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

//* delete all transaction
router.delete("/transactions", async (req, res, next) => {
  try {
    //* delete all transactions
    await Transaction.deleteMany();

    //* send response
    return res.status(200).json({
      success: true,
      message: "All transactions deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
