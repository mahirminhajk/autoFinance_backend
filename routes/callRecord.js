import express from "express";
import CallRecord from "../models/CallRecord.js";
import mongoose from "mongoose";
import { isValidDate, parseDateString } from "../utils/ValidateDate.js";

const router = express.Router();

//* get all call records
router.get("/", async (req, res, next) => {
  try {
    const search = req.query.search;
    const statusFilter = req.query.status;

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
            { desc: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        };
    }

    //* status filter
    if (statusFilter)
      query = {
        $or: [{ status: { $regex: statusFilter, $options: "i" } }],
      };

    //* total call records
    const totalCallRecords = await CallRecord.countDocuments(query);

    //* find call records
    const callRecords = await CallRecord.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCallRecords / limit);

    //* send response
    res.status(200).json({
      success: true,
      callRecords,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

//* create a call record
router.post("/", async (req, res, next) => {
  try {
    const callRecord = await CallRecord.create(req.body);
    res.status(200).json({
      success: true,
      callRecord,
    });
  } catch (error) {
    next(error);
  }
});

//* delete all call records
router.delete("/", async (req, res, next) => {
  try {
    await CallRecord.deleteMany({});
    res.status(200).json({
      success: true,
      message: "all call records deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

//* delete a call record
router.delete("/:id", async (req, res, next) => {
  try {
    const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isValidId) return next(createErr(400, "Call record not found"));

    await CallRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "call record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
