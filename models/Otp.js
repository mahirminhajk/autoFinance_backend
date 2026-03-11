import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema({
  username: String,
  userid: String,
  otp: String,
  createdAt: {
    type: Date,
    default: new Date(),
    expires: 600,
  },
});

export default mongoose.model('otp', otpSchema);