import mongoose, { Schema } from 'mongoose';

const loanSchema = new Schema({
    //? customer
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },

    irrRate: Number,
    advance: Boolean,
    irr: String,
    advanceAmount: Number,
    arrears: String,
    pf: String,
    loanSecurity: String,
    InsuranceEndingDate: Date,
    loanNumber: String,

    //? loan details
    loanAmount: Number,
    emiAmount: Number,
    emiTenure: Number,
    emiStartDate: Date,
    emiEndDate: Date,
    yearCount: Number,
    //* image
    chart: String,


}, { timestamps: true })

export default mongoose.model('Loan', loanSchema);