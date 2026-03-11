import mongoose, { Schema } from 'mongoose';

//* utils
import { createErr } from '../utils/createErr.js';

const UserSchema = new Schema({
    username: {
        type: String,
        require: [true, 'Please add a username'],
        lowercase: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        require: [true, 'Please add a password'],
    },
    level: {
        type: Number,
        default: 1,
        enum: [1, 2, 3],
    },
    name: String,
    email: String,
    phone: String,
    address: String,
}, { timestamps: true })

UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(createErr(422, "Username already exists"));
    } else {
        next();
    }
});


export default mongoose.model('User', UserSchema);
