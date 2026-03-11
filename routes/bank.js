import express from 'express'
//* model import
import Bank from '../models/Bank.js';
//* helpers
import upload from '../utils/upload.js';
import { uploadFile, deleteFile } from '../utils/s3.js'
import { createErr } from '../utils/createErr.js';
import mongoose from 'mongoose';

const router = express.Router();

//* get all banks
router.get('/', async (req, res, next) => {
    try {
        const selectField = req.query.forOption === 'true' ? '_id bankName branch ifsc address employees' : 'logo bankName branch';

        const search = req.query.search;

        let banks;
        if (search) {
            banks = await Bank.find({
                $or: [
                    {
                        bankName: {
                            $regex: search, $options: 'i'
                        }
                    },
                    { branch: { $regex: search, $options: 'i' } },
                ]
            })
                .select(selectField)
                .sort({ updatedAt: -1 });
        } else {
            banks = await Bank.find()
                .select(selectField)
                .sort({ updatedAt: -1 });
        }

        //* if there is a logo, send the url
        if (!req.query.forOption) {
            banks = banks.map(bank => {
                if (bank.logo) {
                    bank.logo = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${bank.logo}`;
                }
                return bank;
            });
        }


        res.status(200).send(banks);
    } catch (err) {
        next(err)
    }
});

//* get a bank 
router.get('/:bankid', async (req, res, next) => {
    try {
        const bankId = req.params.bankid;

        //* validate bank id
        const isValidId = mongoose.Types.ObjectId.isValid(bankId);
        if (!isValidId) return next(createErr(400, 'Invalid bank id'));

        const bank = await Bank.findById(bankId);
        if (bank == null) return next(createErr(404, 'Bank not found'));

        //* if there is a logo, send the url
        if (bank.logo) {
            bank.logo = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${bank.logo}`;
        }

        res.status(200).send(bank);
    } catch (err) {
        next(err)
    }
});

//* create bank
router.post('/', upload.single('logo'), async (req, res, next) => {
    try {
        const file = req.file;
        const logoName = `${req.body.bankName}_${Date.now()}_logo`;

        const newBank = new Bank({
            bankName: req.body.bankName,
            branch: req.body.branch,
            ifsc: (req.body?.ifsc).toUpperCase(),
            address: req.body.address,
            branchPolicy: req.body.branchPolicy,
            mandatoryDoc: req.body.mandatoryDoc,
        });

        //* upload file to s3
        if (file) {
            await uploadFile(file.buffer, logoName, file.mimetype, 'public-read');
            newBank.logo = logoName;
        }

        await newBank.save();
        res.status(200).send({
            success: true,
            _id: newBank._id,
            bankName: newBank.bankName,
        });
    } catch (err) {
        next(err)
    }
});

//* update bank 
router.patch('/:bankid', upload.single('logo'), async (req, res, next) => {
    try {
        const bankId = req.params.bankid;

        //* validate bank id
        const isValidId = mongoose.Types.ObjectId.isValid(bankId);
        if (!isValidId) return next(createErr(400, 'Invalid bank id'));

        const update = req.body;
        const file = req.file;
        const logoName = `${req.body.bankName}_${Date.now()}_logo`;

        const bank = await Bank.findById(bankId);
        if (bank == null) return next(createErr(404, 'Bank not found'));

        //* upload file to s3
        if (file) {
            if (bank.logo) await deleteFile(bank.logo);
            await uploadFile(file.buffer, logoName, file.mimetype, 'public-read');
            update.logo = logoName;
        } else if (update.logo === 'remove' && bank.logo) {
            await deleteFile(bank.logo);
            update.logo = undefined;
        } else {
            update.logo = bank.logo;
        }

        bank.set(update);
        await bank.save();

        res.status(200).send({
            success: true,
            _id: bank._id,
            bankName: bank.bankName,
        });
    } catch (err) {
        next(err);
    }
})

//* update employee details
router.patch('/:bankid/employees', async (req, res, next) => {
    try {
        const bankId = req.params.bankid;

        //* validate bank id
        const isValidId = mongoose.Types.ObjectId.isValid(bankId);
        if (!isValidId) return next(createErr(400, 'Invalid bank id'));

        const update = req.body;

        const bank = await Bank.findById(bankId);
        if (bank == null) return next(createErr(404, 'Bank not found'));

        bank.employees = update;
        await bank.save();

        res.status(200).send({
            success: true,
            _id: bank._id,
            bankName: bank.bankName,
            employees: bank.employees,
        });
    } catch (err) {
        next(err);
    }
})


//* delete bank
router.delete('/:bankid', async (req, res, next) => {
    try {
        const bankId = req.params.bankid;

        //* validate bank id
        const isValidId = mongoose.Types.ObjectId.isValid(bankId);
        if (!isValidId) return next(createErr(400, 'Invalid bank id'));

        const bank = await Bank.findByIdAndDelete(bankId);
        //* delete the logo from s3
        if (bank.logo) await deleteFile(bank.logo);

        res.status(200).send('Bank deleted successfully');
    } catch (err) {
        next(err)
    }
})

//* get employee details
// TODO: check the router is needed
router.get('/:bankid/employee', async (req, res, next) => {
    try {
        const bankId = req.params.bankid;

        //* validate bank id
        const isValidId = mongoose.Types.ObjectId.isValid(bankId);
        if (!isValidId) return next(createErr(400, 'Invalid bank id'));

        const bank = await Bank.findById(bankId);
        const employees = bank.employees;

        res.status(200).send(employees);

    } catch (err) {
        next(err)
    }
});


export default router;