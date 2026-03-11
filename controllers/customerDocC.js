//* model
import Customer from "../models/Customer.js";
//* helpers
import { deleteFile, getObjectSignedURL, s3Client } from "../utils/s3.js";
//* utils
import { createErr } from "../utils/createErr.js";
import mongoose from "mongoose";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const addDoc = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const docName = req.query.docname;

    const imgFiles = [];

    const files = req.files;

    if (files["img1"])
      imgFiles.push({
        field: "img1",
        name: `${docName}_0_${cusId}`,
        mimetype: files["img1"][0].mimetype,
        buffer: files["img1"][0].buffer,
      });

    if (files["img2"])
      imgFiles.push({
        field: "img2",
        name: `${docName}_1_${cusId}`,
        mimetype: files["img2"][0].mimetype,
        buffer: files["img2"][0].buffer,
      });

    //* check if customer exist
    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    //* doc
    const doc = {
      docname: docName,
      verifydoc: JSON.parse(req.body.verifydoc),
      img1: null,
      img2: null,
      status: "uploading",
    };

    //* push doc to customer
    cus.docuploads.push(doc);
    //* save customer
    const newCus = await cus.save();

    res.status(201).json(doc);

    //* upload to s3
    //* loop through the files
    const uploadToS3 = async () => {
      const uploadPromises = imgFiles.map(async (file) => {
        const imgField = file.field;
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: file.buffer,
          Key: file.name,
          ContentType: file.mimetype,
          ACL: "private",
        };

        try {
          // Upload to S3
          const data = await s3Client.send(new PutObjectCommand(uploadParams));
          // Set doc imgField to imgname
          doc[imgField] = file.name;
        } catch (error) {
          // Set doc imgField to 'error'
          doc[imgField] = "error";
        }
      });

      // Wait for all the upload promises to resolve
      await Promise.all(uploadPromises);
    };

    // Call the async function
    await uploadToS3();

    //* change status to done
    doc.status = "done";
    //* in newCus, remove the doc which name is docName
    newCus.docuploads = newCus.docuploads.filter(
      (doc) => doc.docname !== docName
    );
    //* push the doc to newCus
    newCus.docuploads.push(doc);

    //* save newCus
    await newCus.save();
  } catch (err) {
    next(err);
  }
};

export const updateDoc = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;
    const updateInfo = JSON.parse(req.body.updateInfo);

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const docName = req.query.docname;

    //* check if customer exist
    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));
    //* old doc
    const oldDoc = cus.docuploads.find((doc) => doc.docname === docName);
    if (!oldDoc) return next(createErr(404, "Document not found"));
    //* remove the old doc from customer
    cus.docuploads = cus.docuploads.filter((doc) => doc.docname !== docName);

    //* doc
    const doc = {
      docname: docName,
      verifydoc: JSON.parse(req.body.verifydoc),
      img1: null,
      img2: null,
      status: "updating",
    };

    const files = req.files;
    const imgFiles = [];

    if (files["img1"])
      imgFiles.push({
        field: "img1",
        name: `${docName}_0_${cusId}`,
        mimetype: files["img1"][0].mimetype,
        buffer: files["img1"][0].buffer,
      });
    else if (oldDoc.img1 && oldDoc.img1 !== "error") {
      doc.img1 = oldDoc.img1;
    }

    if (files["img2"])
      imgFiles.push({
        field: "img2",
        name: `${docName}_1_${cusId}`,
        mimetype: files["img2"][0].mimetype,
        buffer: files["img2"][0].buffer,
      });
    else if (oldDoc.img2 && oldDoc.img2 !== "error") {
      doc.img2 = oldDoc.img2;
    }

    //* oldDoc img stay or delete
    if (updateInfo.img1 === "delete") await deleteFile(oldDoc.img1);
    else doc.img1 = oldDoc.img1;
    if (updateInfo.img2 === "delete") await deleteFile(oldDoc.img2);
    else doc.img2 = oldDoc.img2;

    //* push doc to customer
    cus.docuploads.push(doc);
    //* save customer
    const newCus = await cus.save();

    res.status(201).json(doc);

    //* upload to s3
    //* loop through the files
    const uploadToS3 = async () => {
      const uploadPromises = imgFiles.map(async (file) => {
        const imgField = file.field;
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: file.buffer,
          Key: file.name,
          ContentType: file.mimetype,
          ACL: "private",
        };

        try {
          // Upload to S3
          const data = await s3Client.send(new PutObjectCommand(uploadParams));
          // Set doc imgField to imgname
          doc[imgField] = file.name;
        } catch (error) {
          // Set doc imgField to 'error'
          doc[imgField] = "error";
        }
      });

      // Wait for all the upload promises to resolve
      await Promise.all(uploadPromises);
    };

    // Call the async function
    await uploadToS3();

    //* change status to done
    doc.status = "done";
    //* in newCus, remove the doc which name is docName
    newCus.docuploads = newCus.docuploads.filter(
      (doc) => doc.docname !== docName
    );
    //* push the doc to newCus
    newCus.docuploads.push(doc);
    //* save newCus
    await newCus.save();
  } catch (err) {
    next(err);
  }
};

export const getDocs = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    //* check if customer exists
    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    //* get docs
    const docs = cus.docuploads;

    const modifiedDocs = await Promise.all(
      docs.map(async (doc) => {
        //* check the doc.status, if the job is done, then send the image URL.
        if (doc.status === "done") {
          if (doc.img1 && doc.img1 !== "error")
            doc.img1 = await getObjectSignedURL(doc.img1);
          if (doc.img2 && doc.img2 !== "error")
            doc.img2 = await getObjectSignedURL(doc.img2);
        } else {
          doc.img1 = doc.status;
          doc.img2 = doc.status;
        }
        return doc;
      })
    );

    //* res
    res.status(200).json(modifiedDocs);
  } catch (err) {
    next(err);
  }
};

export const getDoc = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const docName = req.params.docname;

    //* check if customer exist
    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    //* get doc
    const doc = cus.docuploads.find((doc) => doc.docname === docName);

    //* if the doc is undefined, then return false
    if (!doc) {
      res.status(200).json(false);
      return;
    }

    //* check the job status, if the job is completed, then send the image url, otherwise send the job status
    const docStatus = doc.status;
    if (docStatus === "done") {
      if (doc.img1 && doc.img1 !== "error")
        doc.img1 = await getObjectSignedURL(doc.img1);
      if (doc.img2 && doc.img2 !== "error")
        doc.img2 = await getObjectSignedURL(doc.img2);
    } else {
      doc.imgname = docStatus;
      doc.imgname1 = docStatus;
    }

    //* res
    res.status(200).json(doc);
  } catch (err) {
    next(err);
  }
};

export const deleteDocImg = async (req, res, next) => {
  try {
    const cusId = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, "Invalid customer id"));

    const docName = req.query.docname;
    const imgField = req.query.imgfield;

    //*cus
    const cus = await Customer.findById(cusId);
    if (!cus) return next(createErr(404, "Customer not found"));

    //* doc
    const doc = cus.docuploads.find((doc) => doc.docname === docName);
    if (!doc) return next(createErr(404, "Document not found"));

    //* delete from s3
    if (doc[imgField]) {
      if (doc[imgField] !== "error") await deleteFile(doc[imgField]);
      else
        res
          .status(200)
          .json({ success: true, message: "Document deleted successfully" });
    }

    //* delete from docuploads
    cus.docuploads = cus.docuploads.filter((doc) => doc.docname !== docName);

    doc[imgField] = null;

    //* push doc to cus
    cus.docuploads.push(doc);

    //* save
    await cus.save();

    //* send response
    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    next(err);
  }
};
