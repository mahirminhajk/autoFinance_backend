import express from 'express'

//* model import
import Dealer from '../models/Dealer.js';
import Customer from '../models/Customer.js';
import upload from '../utils/upload.js';
import { deleteFile, uploadFile } from '../utils/s3.js';
import { createErr } from '../utils/createErr.js';

//* cron
import cron from 'node-cron';
import mongoose from 'mongoose';

const router = express.Router();

//* cron job for dealer category update
cron.schedule('0 1 * * 0', async () => {
    try {
        const dealers = await Dealer.find();

        dealers.forEach(async dealer => {
            const dealerId = dealer._id;
            //* get count of each dealer
            const count = await Customer.countDocuments({ 'general.dealer': dealerId });

            //* update dealer category
            const customerCount = dealer.customers.length;
            if (customerCount < 10) {
                dealer.category = 'gold';
            } else if (customerCount < 20) {
                dealer.category = 'platinum';
            }
            else {
                dealer.category = 'diamond';
            }


            //* save the dealer
            await dealer.save();
        });
    } catch (error) {
        const currentTime = new Date().toLocaleString();
        errorLogger.log({
            level: 'error',
            timestamp: currentTime,
            message: `cron error in dealer category updater:: ${error.message}`,
            stack: error.stack,
        });
    }
});


//* get all dealer
router.get('/', async (req, res, next) => {
    try {
        //* req.query
        const search = req.query.search;
        const type = req.query.type;
        const selectField = '_id name shopname place type phoneNo photo index';

        let dealers;

        if (search) {
            dealers = await Dealer.find({
                $or: [
                    {
                        name: {
                            $regex: search, $options: 'i'
                        }
                    },
                    { shopname: { $regex: search, $options: 'i' } },
                ]
            }).select(selectField).sort({ createdAt: -1 });
        } else if (type) {
            dealers = await Dealer.find({ type }).select(selectField).sort({ createdAt: -1 });
        } else {
            dealers = await Dealer.find().select(selectField).sort({ createdAt: -1 });
        }

        //* send the photo url
        dealers = dealers.map(dealer => {
            if (dealer.photo) {
                dealer.photo = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${dealer.photo}`;
            }
            return dealer;
        });



        // if (req.query.category) query.category = req.query.category;
        // if (req.query.type) query.type = req.query.type;
        // //** if(req.query.name) query.name = req.query.name; **add more if needed**
        //* get dealers data
        // const dealers = await Dealer.find(query).select(selectField).sort({ createdAt: -1 });
        //*res
        res.status(200).json(dealers);
    } catch (err) {
        next(err)
    }
})


//* get a dealer 
router.get('/:dealerid', async (req, res, next) => {
    try {
        const dealerId = req.params.dealerid;

        //* validate dealer id
        const isValidId = mongoose.Types.ObjectId.isValid(dealerId);
        if (!isValidId) return next(createErr(400, 'Invalid dealer id'));

        const customersField = req.query.customers === 'true' ? true : false;

        const dealer = await Dealer.findById(dealerId);
        if (dealer == null) return next(createErr(404, 'Dealer not found'));

        //* if there is photo send photo url
        if (dealer.photo) {
            dealer.photo = `https://leadup-crm.s3.ap-south-1.amazonaws.com/${dealer.photo}`;
        }

        let transformedCustomers;
        let transformedDealers;

        //* find customer which have the dealer id
        if (customersField) {
            const customers = await Customer
                .find({ 'general.dealer': dealerId })
                .select('general.name general.phoneNo general.category _id')
                .sort({ updatedAt: -1 });

            transformedCustomers = customers.map(cus => {
                const { _id, general } = cus;
                return {
                    _id,
                    name: general.name,
                    phoneNo: general.phoneNo,
                    category: general.category
                }
            });

            dealer.customers = transformedCustomers;
        }

        transformedDealers = {
            type: dealer.type,
            _id: dealer._id,
            index: dealer.index,
            name: dealer.name,
            shopname: dealer.shopname,
            phoneNo: dealer.phoneNo,
            place: dealer.place,
            photo: dealer.photo,
            staffs: dealer.staffs,
            customers: transformedCustomers || undefined
        }


        res.status(200).json(transformedDealers);

    } catch (err) {
        next(err)
    }
})

//* create a dealer
router.post('/', upload.single('photo'), async (req, res, next) => {
    try {
        const dealer = await Dealer.create(req.body);
        const file = req.file;
        const photoKey = `${dealer._id}_${Date.now()}_photo`;

        if (file) {
            await uploadFile(file.buffer, photoKey, file.mimetype, 'public-read');
            dealer.photo = photoKey;
        }
        await dealer.save();

        res.status(201).json({
            success: true,
            name: dealer.name,
            _id: dealer._id
        });
    } catch (err) {
        next(err)
    }
})

//* update a dealer
router.patch('/:dealerid', upload.single('photo'), async (req, res, next) => {
    try {
        const dealerId = req.params.dealerid;

        //* validate dealer id
        const isValidId = mongoose.Types.ObjectId.isValid(dealerId);
        if (!isValidId) return next(createErr(400, 'Invalid dealer id'));

        const update = req.body;
        const file = req.file;
        const photoKey = `${dealerId}_${Date.now()}_photo`;

        const dealer = await Dealer.findById(dealerId);
        if (dealer == null) return next(createErr(404, 'Dealer not found'));

        if (file) {
            if (dealer.photo) await deleteFile(dealer.photo);
            await uploadFile(file.buffer, photoKey, file.mimetype, 'public-read');
            update.photo = photoKey;
        } else if (update.photo === 'remove' && dealer.photo) {
            await deleteFile(dealer.photo);
            delete update.photo;
        } else {
            update.photo = dealer.photo;
        }

        dealer.set(update);
        await dealer.save();

        res.status(200).json({
            success: true,
            name: dealer.name,
            _id: dealer._id
        });
    } catch (err) {
        next(err)
    }
});

//* update staffs
router.patch('/:dealerid/staffs', async (req, res, next) => {
    try {
        const dealerId = req.params.dealerid;

        //* validate dealer id
        const isValidId = mongoose.Types.ObjectId.isValid(dealerId);
        if (!isValidId) return next(createErr(400, 'Invalid dealer id'));

        const update = req.body;

        const dealer = await Dealer.findById(dealerId);
        if (dealer == null) return next(createErr(404, 'Dealer not found'));

        dealer.staffs = update;
        await dealer.save();

        res.status(200).json({
            success: true,
            name: dealer.name,
            _id: dealer._id
        });
    } catch (err) {
        next(err)
    }
});


//* delete a dealer
router.delete('/:id', async (req, res, next) => {
    try {
        const dealerId = req.params.id;

        //* validate dealer id
        const isValidId = mongoose.Types.ObjectId.isValid(dealerId);
        if (!isValidId) return next(createErr(400, 'Invalid dealer id'));


        const dealer = await Dealer.findByIdAndDelete(dealerId);
        if (dealer == null) return next(createErr(404, 'Dealer not found'));

        //* delete photo from s3
        if (dealer.photo) await deleteFile(dealer.photo);

        res.status(200).json(dealer);
    } catch (err) {
        next(err)
    }
})

export default router;