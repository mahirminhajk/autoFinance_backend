import mongoose, { Schema } from 'mongoose';

const TakeOverSchema = new Schema({
    index: {
        type: Number,
    },
    general: {
        _id: false,
        name: {
            type: String,
        },
        phoneNo: {
            type: String,
        },
    },
    emiStartDate: {
        type: Date,
    },
    emiEndDate: {
        type: Date,
    },
}, { timestamps: true });

export default mongoose.model('TakeOver', TakeOverSchema);

