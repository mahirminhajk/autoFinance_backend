import mongoose, { Schema } from 'mongoose';

const callRecordSchema = new Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    name: String,
    desc: String,
    status: String,

},)

export default mongoose.model('CallRecord', callRecordSchema);