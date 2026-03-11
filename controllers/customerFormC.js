//* model
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
//* utils
import { createErr } from "../utils/createErr.js";
import { deleteFile, uploadFile } from "../utils/s3.js";
import mongoose from "mongoose";
import { TakeOverService } from "../service/takeOverService.js";
import { DispDateService } from "../service/dispDateService.js";

export const getCustomerGeneral = async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));


        const general = cus.general;

        const response = {
            _id: cus._id || cusId,
            firstName: general?.firstName || '',
            lastName: general?.lastName || '',
            phoneNo: general?.phoneNo || '',
            email: general?.email || '',
            status: general?.status || '',
            carName: general?.car?.carName || '',
            model: general?.car?.model || '',
            regNo: general?.car?.regNo || '',
            vehicleLocation: general?.car?.vehicleLocation || '',
            km: general?.car?.km || '',
            ownership: general?.car?.ownership || '',
            dealer: general?.dealer || '',
            bank: general?.bank || '',
            executive: general?.executive || '',
            manager: general?.manager || '',
            method: general?.method || '',
            policy: general?.policy || '',
            valuationDetails: general?.valuationDetails || '',
            insuranceDate: general?.insuranceDate || '',
            insuranceType: general?.insuranceType || '',
            initalCheckup: general?.initalCheckup,
            // dealerName: general?.dealerName || '',
            // oldOwnerPh: general?.oldOwnerPh || '',

            //* new valuation fields
            valuationCompanyName: general?.valuationCompanyName || '',
            valuationAmount: general?.valuationAmount || '',
            valuationPlace: general?.valuationPlace || '',
            valuationMobileNumber: general?.valuationMobileNumber || '',
            valuationFreeTime: general?.valuationFreeTime || '',
            valuationVehicleHolderName: general?.valuationVehicleHolderName || '',
        };

        console.log(response);
        

        //* res 
        res.status(200).json(response);
    } catch (err) {
        next(err)
    }
}


export const updateCustomerGeneral = async (req, res, next) => {
    try {
        const cusid = req.params.cusId;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const update = req.body;
        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //Update the specific field in the general object 
        Object.assign(cus.general, update);
        const updatedCus = await cus.save();
        res.status(200).json({
            success: true,
            name: updatedCus.general.name,
            _id: updatedCus._id,
        });

    } catch (err) {
        next(err);
    }
}

export const updateCustomerHeadAndValue = async (req, res, next) => {
    try {
        const cusId = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const field = req.query.field;
        const body = req.body;

        //* check if the field is valid
        if (!['verification', 'readyLogin', 'ftr', 'loanApproved'].includes(field)) return next(createErr(404, 'Invalid query field'));

        //* check if customer exsist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));


        //* update each head-value pair 
        //TODO: check if the we need the for Each loop
        body.forEach(({ head, values }) => {
            //* remove exisitng head if it already exisits
            cus[field] = cus[field].filter(item => item.head !== head);
            //* Add the new head and values
            cus[field].push({ head, values });
        });

        //* save cus
        await cus.save();

        //* res
        res.status(200).json(cus[field]);
    } catch (err) {
        next(err)
    }
}

export const getCustomerHeadAndValue = async (req, res, next) => {
    const cusId = req.params.cusid;

    const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusId);
    if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

    const field = req.query.field;

    try {
        //* check if the field is valid
        if (!['verification', 'readyLogin', 'ftr', 'loanApproved'].includes(field)) return next(createErr(404, 'Invalid query field'));

        //* chec if customer exist
        const cus = await Customer.findById(cusId);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* response
        const response = cus[field];

        //* res
        res.status(200).json(response);

    } catch (err) {
        next(err)
    }
};

export const getCustomerLoginFormData = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        res.status(200).json({ login: cus.login });
    } catch (err) {
        next(err)
    }
}

export const updateCustomerLoginFormData = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const loginValue = req.body.login;

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* update login value
        cus.login.loginStatus = loginValue;
        cus.login.updatedBy = req.user.username;
        cus.login.updatedAt = Date.now();
        // //* update customer status
        // if (loginValue === true) {
        //     const cusStatus = cus.general.status;
        //     if (cusStatus === 'ready_login') {
        //         cus.general.status = 'login';
        //     }
        // } else {

        // }

        //* save cus
        await cus.save();

        //* send res
        res.status(200).json(cus.login);

    } catch (err) {
        next(err)
    }
}

export const getCustomerBankForm = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        const bank = {
            bank: cus.general?.bank || '',
            executive: cus.general?.executive || '',
            manager: cus.general?.manager || '',
            valuationDetails: cus.general?.valuationDetails || '',
            customerVehicleLocation: cus.general?.customerVehicleLocation || '',
            dealerName: cus.general?.dealerName || '',
            oldOwnerPhoneNumber: cus.general?.oldOwnerPhoneNumber || '',
            method: cus.general?.method || '',
            policy: cus.general?.policy || '',
            // managerCall: cus.general?.initalCheckup[2].values.ManagerCall
        }

        res.status(200).json({ bank: bank, ftr: cus.ftr, status: cus.general?.status });

    } catch (err) {
        next(err)
    }
};

export const updateCustomerBankForm = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const { bank, ...ftrData } = req.body;

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* update bank value
        cus.general.bank = bank.bank || undefined;
        cus.general.executive = bank.executive || undefined;
        cus.general.manager = bank.manager || undefined;
        cus.general.valuationDetails = bank.valuationDetails || undefined;
        // cus.general.method = bank.method || undefined;
        // cus.general.policy = bank.policy || undefined;
        // cus.general.customerVehicleLocation = bank.customerVehicleLocation || undefined;
        cus.general.dealerName = bank.dealerName || undefined;
        // cus.general.oldOwnerPhoneNumber = bank.oldOwnerPhoneNumber || undefined;

        // const initalCheckupItem = cus.general.initalCheckup[2];
        // initalCheckupItem.values.ManagerCall = bank.managerCall;
        // cus.general.initalCheckup[2] = initalCheckupItem;

        const oldFTR = cus.ftr;
        //* merage the new ftr data
        const newFTR = { ...oldFTR, ...ftrData };
        cus.ftr = newFTR;

        //* save
        await cus.save();

        //* send res
        res.status(200).json({ message: "bank updated succesfully" });

    } catch (err) {
        console.log(err);
        
        next(err)
    }
};

export const getCustomerFTR = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        res.status(200).json({ ftr: cus.ftr, status: cus.general?.status });
    }
    catch (err) {
        next(err)
    }
}

export const updateCustomerFTR = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const { status, ...ftrValue } = req.body;

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* update customer status
        if (status) {
            cus.general.status = status;
        }

        //* update ftr value
        cus.ftr = ftrValue;
        //* save
        await cus.save();
        //* send res
        res.status(200).json(cus.ftr);

    } catch (err) {
        next(err)
    }
}

export const getCustomerLoanDesp = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        const loanDespValue = cus.loanDesp || false;

        //* send the transaction info
        if (loanDespValue && loanDespValue.despTransaction) {
            const transaction = await Transaction.findById(loanDespValue.despTransaction);
            if (transaction) {
                loanDespValue.despTransaction = transaction;
            }
        }

        res.status(200).json({ loanDesp: loanDespValue });
    }
    catch (err) {
        next(err)
    }
}

export const updateCustomerLoanDesp = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const loanDespValue = req.body;
        const file = req.file;
        const fileName = `${cusid}_despLetter_${Date.now()}`;

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* adding the transaction
        if (!cus?.loanDesp && loanDespValue.despAmount > 0) {
            //* create new transaction
            const newTransaction = new Transaction({
                date: Date.now(),
                label: 'Loan Despatched Amount from ' + cus.general.name,
                details: `Loan Despatched Amount from customer ${cus.general.name} of amount ${loanDespValue.despAmount}`,
                amount: loanDespValue.despAmount,
            });

            const newTransactionId = newTransaction._id;

            loanDespValue.despTransaction = newTransactionId;
        } else if (cus?.loanDesp && loanDespValue.despAmount > 0 && cus.loanDesp.despAmount !== loanDespValue.despAmount) {
            //* find the transaction
            const transaction = await Transaction.findById(cus.loanDesp.despTransaction);

            //* check if there is transaction, if yes update it or create new one
            if (transaction) {
                //* update the transaction
                transaction.label = 'Loan Despatched Amount from ' + cus.general.name;
                transaction.details = `Loan Despatched Amount from customer ${cus.general.name} of amount ${loanDespValue.despAmount}`;
                transaction.amount = loanDespValue.despAmount;
                //* save the transaction
                await transaction.save();
            } else {
                //* create new transaction
                const newTransaction = new Transaction({
                    date: Date.now(),
                    label: 'Loan Despatched Amount from ' + cus.general.name,
                    details: `Loan Despatched Amount from customer ${cus.general.name} of amount ${loanDespValue.despAmount}`,
                    amount: loanDespValue.despAmount,
                });

                const newTransactionId = newTransaction._id;

                loanDespValue.despTransaction = newTransactionId;
            }
        }

        //* if any file upload, and delete old file
        if (file) {
            if (cus?.loanDesp && 'despLetter' in cus.loanDesp) {
                await deleteFile(cus.loanDesp.despLetter);
            }
            await uploadFile(file.buffer, fileName, file.mimetype, 'public-read');
            loanDespValue.despLetter = fileName;
        } else if (loanDespValue.despLetter === 'remove' && cus?.loanDesp && 'despLetter' in cus.loanDesp) {
            await deleteFile(cus.loanDesp.despLetter);
            delete loanDespValue.despLetter;
        } else {
            loanDespValue.despLetter = cus?.loanDesp?.despLetter || undefined;
        }

        //* update loanDesp value
        cus.loanDesp = loanDespValue;

        //* update customer category, acording to despAmount
        const amount = cus.loanDesp?.despAmount;
        if (amount > 0 && amount <= 500000) {
            if (cus.general.category !== 'Gold') cus.general.category = 'Gold';
        } else if (amount > 500000 && amount <= 1000000) {
            if (cus.general.category !== 'Platinum') cus.general.category = 'Platinum';
        } else if (amount > 1000000) {
            if (cus.general.category !== 'Diamond') cus.general.category = 'Diamond';
        }

        //* save
        await cus.save();
  
        //* creating dispDate
        if( loanDespValue.dispDate && loanDespValue.despAmount > 0) {            
            //* create or update dispDate
            await DispDateService.createDispDate({
                _id: cusid,
                general: {
                    name: cus.general.name,
                    phoneNo: cus.general.phoneNo,
                },
                day: loanDespValue.dispDate,
                amount: loanDespValue.despAmount
            });
        };


        //* send res
        res.status(200).json(cus.loanDesp);
    } catch (err) {
        next(err)
    }
}

export const getCustomerRtoWork = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        const rtoWorkValue = cus.rtoWork || false;

        res.status(200).json({ rtoWork: rtoWorkValue });
    }
    catch (err) {
        next(err)
    }
}

export const updateCustomerRtoWork = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const rtoWorkValue = req.body;

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* update rtoWork value
        cus.rtoWork = rtoWorkValue;
        //* save
        await cus.save();
        //* send res
        res.status(200).json(cus.rtoWork);

    } catch (err) {
        next(err)
    }
}

export const getCustomerComplete = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        //* check if customer exsist
        const cus = await Customer.findById(cusid);
        if (!cus) return next(createErr(404, 'Customer not found'));

        const completedValue = cus.completed || false;

        res.status(200).json({ completed: completedValue });
    }
    catch (err) {
        next(err)
    }
}

export const updateCustomerComplete = async (req, res, next) => {
    try {
        const cusid = req.params.cusid;

        const isValidateObjectId = mongoose.Types.ObjectId.isValid(cusid);
        if (!isValidateObjectId) return next(createErr(400, 'Invalid customer id'))

        const completedValue = req.body;
        
        const payoutSlipFile = req.files['payoutSlip'] ? req.files['payoutSlip'][0] : undefined;
        const invoiceFile = req.files['invoice'] ? req.files['invoice'][0] : undefined;
        const payoutSlipFileName = `${cusid}_payoutSlip_${Date.now()}`;
        const invoiceFileName = `${cusid}_invoice_${Date.now()}`;

        //* check if customer exsist
        const cus = await Customer.findById(cusid).populate('loan');
        if (!cus) return next(createErr(404, 'Customer not found'));

        //* if any file upload, and delete old file
        if (payoutSlipFile) {
            if (cus?.completed && 'payoutSlip' in cus.completed) {
                await deleteFile(cus.completed.payoutSlip);
            }
            await uploadFile(payoutSlipFile.buffer, payoutSlipFileName, payoutSlipFile.mimetype, 'public-read');
            completedValue.payoutSlip = payoutSlipFileName;
        } else if (completedValue.payoutSlip === 'remove' && cus?.completed && 'payoutSlip' in cus.completed) {
            await deleteFile(cus.completed.payoutSlip);
            delete completedValue.payoutSlip;
        } else {
            completedValue
                .payoutSlip = cus?.completed?.payoutSlip || undefined;
        }

        if (invoiceFile) {
            if (cus?.completed && 'invoice' in cus.completed) {
                await deleteFile(cus.completed.invoice);
            }
            await uploadFile(invoiceFile.buffer, invoiceFileName, invoiceFile.mimetype, 'public-read');
            completedValue.invoice = invoiceFileName;
        } else if (completedValue.invoice === 'remove' && cus?.completed && 'invoice' in cus.completed) {
            await deleteFile(cus.completed.invoice);
            delete completedValue.invoice;
        } else {
            completedValue.invoice = cus?.completed?.invoice || undefined;
        }

        //* takeover list
        if(completedValue.takeOverList === 'true') {            
            //* add the customer to take over list.
            await TakeOverService.addCusToTakeOver({
                _id: cusid,
                index: cus.index,
                general: {
                    name: cus.general.name,
                    phoneNo: cus.general.phoneNo,
                },
                emiStartDate: cus?.loan?.emiStartDate || '',
                emiEndDate: cus?.loan?.emiEndDate || '',
            });
        }else if(completedValue.takeOverList === 'false') {
            //* remove the customer from take over list.
            await TakeOverService.removeCusFromTakeOver(cusid);
        }

        //* update completed value
        cus.completed = completedValue;
        //* save
        await cus.save();
        //* send res
        res.status(200).json(cus.completed);

    } catch (err) {  
        console.log(err);
              
        next(err)
    }

}