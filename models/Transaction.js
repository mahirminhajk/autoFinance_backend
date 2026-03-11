import mongoose, { Schema } from 'mongoose';

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    label: {
        type: String,
        required: [true, 'Please add a label'],
        //? from customer, from bank, office expenses, personal expenses, ....
    },
    details: {
        type: String,
        //? from mahir dealer humaid
    },
    amount: {
        type: Number,
        required: [true, 'Please add a amount'],
    },
})

export default mongoose.model('Transaction', transactionSchema);