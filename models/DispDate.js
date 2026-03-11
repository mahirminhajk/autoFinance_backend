import mongoose, { Schema } from 'mongoose';

const DispDateSchema = new Schema({
    general: {
        _id: false,
        name: {
            type: String,
        },
        phoneNo: {
            type: String,
        },
    },
    day: {
        type: Date,
    },
    amount: {
        type: Number,
    },
}, { timestamps: true });

export default mongoose.model('DispDate', DispDateSchema);

