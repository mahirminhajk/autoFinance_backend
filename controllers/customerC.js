//* model
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
//* utils
import { createErr } from "../utils/createErr.js";
import { deleteFile } from "../utils/s3.js";
import {
  sendTextWhatsappMessage,
  sendWhatsappMessage,
  sendWhatssappTemplateMessage,
} from "../utils/whatsappMessage.js";

export const getCustomers = async (req, res, next) => {
  try {
    const search = req.query.search;
    const categoryQuery = req.query.category;
    const statusQuery = req.query.status;
    const cibilQuery = req.query.cibil;
    const ftrStatus = req.query.ftrStatus;

    //* Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    let query = {};

    //* search
    if (search) {
      const searchNumber = parseInt(search);
      if (!isNaN(searchNumber)) {
        if (search.length >= 5) {
          query["general.phoneNo"] = { $regex: search, $options: "i" };
        } else {
          query["index"] = searchNumber;
        }
      } else {
        query.$or = [
          { "general.name": { $regex: search, $options: "i" } },
          { "general.car.carName": { $regex: search, $options: "i" } },
        ];
      }
    }

    //* category
    if (categoryQuery) query["general.category"] = categoryQuery;

    //* status
    if (statusQuery) query["general.status"] = statusQuery;

    //* cibil query
    if (cibilQuery) query["ftr.Status"] = cibilQuery == 'forward' ? true : false;

    //* ftr status
    if (ftrStatus) query["ftr.ftrStatus"] = ftrStatus; 

    //* total customers to calculate total pages
    const totalCustomers = await Customer.countDocuments(query);

    const customers = await Customer.find(query)
      .select(
        "general.name general.phoneNo general.category general.status _id index"
      )
      .populate("general.dealer", "name shopname _id")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit) //? skip records based on the current page
      .limit(limit); //? limit the number of records

    //* transform
    const transformedCustomers = customers.map((customer) => {
      const { general, _id, index } = customer._doc;
      const { name, phoneNo, category, dealer, status } = general;
      const dealerName = dealer ? dealer.name : null;
      const shopname = dealer ? dealer.shopname : null;
      const dealerId = dealer ? dealer._id : null;
      return {
        name,
        phoneNo,
        status,
        category,
        dealerName,
        shopname,
        _id,
        dealerId,
        index
      };
    });

    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      success: true,
      customers: transformedCustomers,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const cusid = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    //* check if customer exsist
    const cus = await Customer.findById(cusid).populate(
      "general.dealer general.bank loan",
      "name phoneNo shopname place bankName branch _id address employees irrRate advance irr advanceAmount arrears pf loanSecurity InsuranceEndingDate loanNumber loanAmount emiAmount emiTenure emiStartDate emiEndDate yearCount chart"
    );


    if (!cus) return next(createErr(404, "Customer not found"));

    //* dealer and bank transform
    const { general, docuploads, ...cusData } = cus._doc;
    const { dealer, bank, ...generalData } = general._doc;

    //* bank employee transform
    const { employees, ...bankData } = bank?._doc || {};
    const employee = cus.general.executive;

    let employeePhoneNo;
    let managerPhoneNo;

    if (employees) {
      employeePhoneNo = employees.find((e) => e.name === employee)?.phoneNo;
      managerPhoneNo = employees.find(
        (e) => e.name === general.manager
      )?.phoneNo;
    }


    //* docuploads transform
    for (let doc of docuploads) {
      if (doc.img1) {
        doc.img1 = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${doc.img1}`;
      }
      if (doc.img2) {
        doc.img2 = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${doc.img2}`;
      }
    }

    const resData = {
      ...cusData,
      docuploads,
      general: {
        ...generalData,
        dealer: {
          ...dealer?._doc,
        },
        bank: {
          ...bankData,
        },
        executive: employee,
        employeePhoneNo,
        managerPhoneNo,
      },
    };

    //* res
    res.status(200).json(resData);
  } catch (err) {
    next(err);
  }
};

//* router get customer certain field
export const getCustomerField = async (req, res, next) => {
  try {
    const cusid = req.params.cusid;
    const field = req.params.field;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    //* check if customer exsist
    const cus = await Customer.findById(cusid).select(field);
    if (!cus) return next(createErr(404, "Customer not found"));

    //* send res the field
    res.status(200).json(cus[field]);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const newCus = new Customer({
      general: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNo: req.body.phoneNo,
        email: req.body.email,
        dealer: req.body.dealer,
        status: req.body.status,
        bank: req.body.bank,
        executive: req.body.executive,
        manager: req.body.manager,
        method: req.body.method,
        policy: req.body.policy,
        car: {
          carName: req.body.carName,
          model: req.body.model,
          regNo: req.body.regNo,
          ownership: req.body.ownership,
          vehicleLocation: req.body.vehicleLocation,
          km: req.body.km,
        },
        // valuationDetails: req.body.valuationDetails,
        //* new valuation
        valuationCompanyName: req.body.valuation_company_name,
        valuationAmount: req.body.valuation_amount,
        valuationPlace: req.body.valuation_place,
        valuationMobileNumber: req.body.valuation_mobile_number,
        valuationFreeTime: req.body.valuation_free_time,
        valuationVehicleHolderName: req.body.valuation_vehicle_holder_name,

        insuranceDate: req.body.insuranceDate,
        insuranceType: req.body.insuranceType,
        initalCheckup: req.body.initalCheckup,
      },
    });

    await newCus.save();
    res.status(201).json({
      success: true,
      name: newCus.general.name,
      _id: newCus._id,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const cusId = req.params.cusId;

    //* check if customer exist
    const cus = await Customer.findByIdAndDelete(cusId);

    //* res
    res.status(200).json({ success: true, message: "Customer deleted" });

    //* if there is docuploads, delete them from s3 bucket
    if (cus.docuploads.length > 0) {
      for (let doc of cus.docuploads) {
        if (doc.imgname) await deleteFile(doc.imgname);
        if (doc.imgname1) await deleteFile(doc.imgname1);
      }
    }
  } catch (err) {
    next(err);
  }
};

//* send whatsapp message to customer
export const sendWhatsappMsgToCustomer = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;
    const templateName = req.query.template;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    const phoneNo = cus.general.phoneNo;
    //* if phoneNo is not valid
    if (!phoneNo) return next(createErr(400, "Phone number not found"));

    //* send whatsapp Message using template
    sendWhatssappTemplateMessage(phoneNo, templateName)
      .then(async (response) => {
        //* res
        if (response.status === "success") {
          await Customer.updateOne(
            { _id: cusId },
            {
              $push: {
                messSendInfo: {
                  name: templateName,
                  date: new Date(),
                },
              },
            }
          );
          res.status(200).json({ success: true });
        } else {
          res
            .status(400)
            .json({ success: false, message: "something went wrong" });
        }
      })
      .catch((error) => {
        return next(createErr(400, error));
      });
  } catch (err) {
    next(err);
  }
};

//* send whatsapp text message to customer
export const sendWhatsappTextMsgToCustomer = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;
    const text = req.body.text;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    const phoneNo = cus.general.phoneNo;
    //* if phoneNo is not valid
    if (!phoneNo) return next(createErr(400, "Phone number not found"));

    //* send whatsapp Message using template
    sendTextWhatsappMessage(phoneNo, text)
      .then(async (response) => {
        //* res
        if (response.status === "success") {
          res.status(200).json({ success: true });
        } else {
          res
            .status(400)
            .json({ success: false, message: "something went wrong" });
        }
      })
      .catch((error) => {
        return next(createErr(400, error));
      });
  } catch (err) {
    next(err);
  }
};

//* v3
export const getInsuranceValidityList = async (req, res, next) => {
  try {
    //* this method query have 3 day range to back and 7 day range to forward.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset hours to start of the day

    const threeDaysBack = new Date(today);
    threeDaysBack.setDate(today.getDate() - 3); // 3 days ago

    const sevenDaysForward = new Date(today);
    sevenDaysForward.setDate(today.getDate() + 7); // 7 days from now

    const customers = await Customer.find({
      "general.insuranceDate": { $gte: threeDaysBack, $lte: sevenDaysForward },
    }).select("general index _id");

    res.status(200).json({ success: true, customers });

  } catch (error) {
    next(error);
  }
};