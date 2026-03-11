import DispDate from "../models/DispDate.js";

export class DispDateService {
    static async createDispDate({
        _id, general, day, amount
    }) {
        //* if exists, then update the existing document
        let dispDate = await DispDate.findOne({ _id });
        if (dispDate) {
            dispDate.general = general;
            dispDate.day = day;
            dispDate.amount = amount;
            return dispDate.save();
        }
        //* if not exists, then create a new document
        const newDispDate = new DispDate({
            _id, general, day, amount
        });
        return newDispDate.save();
    };

    static async removeDispDate(_id) {
    return DispDate.findByIdAndDelete(_id);
    }
        
    static async getDispDate(date) {
        //* find all dispDate within the month of the passed date
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return DispDate.find({ 
            day: { 
                $gte: startOfMonth, 
                $lte: endOfMonth 
            } 
        }).sort({ createdAt: -1 });
        
    };
};
    