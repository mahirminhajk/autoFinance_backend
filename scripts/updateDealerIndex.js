import mongoose from 'mongoose';
import Dealer from '../models/Dealer.js';
import dotenv from 'dotenv';

dotenv.config();

const updateDealerIndexField = async () => {
    try {
        // Connect to the MongoDB database
        await mongoose.connect(process.env.MONGODB_URI);

        // Find all dealers sorted by creation date
        const dealers = await Dealer.find().sort({ createdAt: 1 });

        // Update each dealer with a sequential index
        for (let i = 0; i < dealers.length; i++) {
            dealers[i].index = i + 1;
            await dealers[i].save();
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error updating dealer index field:', error);
        await mongoose.disconnect();
    }
};

updateDealerIndexField();
