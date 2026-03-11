import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import dotenv from 'dotenv';

dotenv.config();

const updateIndexField = async () => {
    try {
        // Connect to the MongoDB database
        await mongoose.connect(process.env.MONGODB_URI);

        // Find all customers sorted by creation date
        const customers = await Customer.find().sort({ createdAt: 1 });

        // Update each customer with a sequential index
        for (let i = 0; i < customers.length; i++) {
            customers[i].index = i + 1;
            await customers[i].save();
        }
        mongoose.disconnect();
    } catch (error) {
        console.error('Error updating index field:', error);
        mongoose.disconnect();
    }
};

updateIndexField();