import TakeOver from "../models/TakeOver.js";

export class TakeOverService {
    static async createTakeOver({
        _id, index, general, emiStartDate, emiEndDate
    }) {
        const newTakeOver = new TakeOver({
            _id, index, general, emiStartDate, emiEndDate
        });
        return newTakeOver.save();
    };

    static async addCusToTakeOver({
        _id, index, general, emiStartDate, emiEndDate
    }) {
        //* check if the takeOver exists
        let takeOver = await TakeOver.findOne({ _id });
        if (!takeOver) {
            return this.createTakeOver({ _id, index, general, emiStartDate, emiEndDate });
        };
        return takeOver;   
    };

    static async removeCusFromTakeOver(_id) {
        return TakeOver.findByIdAndDelete(_id);
    }
        
    static async getTakeOverList() {
        //* find all takeOver in created time descending order
        return TakeOver.find().sort({ createdAt: -1 });
    };
};
    