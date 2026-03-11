import mongoose, { Schema } from 'mongoose';

const staffSchema = new Schema({
    name: String,
    phoneNo: String,
}, { _id: false });

const dealerSchema = new Schema({

    name: {
        type: String,
        require: [true, 'Please add a name']
    },
    type: {
        type: String,
        default: 'dealer',
        require: [true, 'Please add a type'],
        enum: ['dealer', 'broker']
    },
    category: {
        type: String,
        default: 'gold',
        enum: ['gold', 'platinum', 'diamond']
    },
    shopname: String,
    phoneNo: String,
    place: String,
    photo: String,
    staffs: [staffSchema],
    // sequential index for dealers
    index: {
        type: Number,
        unique: true,
    }

}, { timestamps: true })

//* pre-save middleware to assign next sequential index for new dealers
dealerSchema.pre('save', async function (next) {
    const dealer = this;
    if (dealer.isNew) {
        try {
            const lastDealer = await mongoose
                .model('Dealer')
                .findOne({}, { index: 1 })
                .sort({ index: -1 })
                .lean();
            const lastIndex = (lastDealer && typeof lastDealer.index === 'number') ? lastDealer.index : 0;
            dealer.index = lastIndex + 1;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

export default mongoose.model('Dealer', dealerSchema);