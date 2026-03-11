import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema(
  {
    index: Number,
    name: String,
    role: {
      type: String,
      default: "Employee",
      enum: ["Manager", "Employee"],
    },
    email: String,
    phoneNo: String,
  },
  { _id: false }
);

const bankSchema = new Schema({
    bankName: String,
    logo: String,
    branch: String,
    ifsc: String,
    address: String,
    branchPolicy: String,
    mandatoryDoc: String,
    employees: [employeeSchema],

}, { timestamps: true })


export default mongoose.model('Bank', bankSchema);