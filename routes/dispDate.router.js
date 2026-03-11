import { Router } from "express";
import {DispDateService} from "../service/dispDateService.js";

const router = Router();

//* get all dispDate
router.get('/', async (req, res, next) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    try {
        const dispDate = await DispDateService.getDispDate(date);
        res
            .status(200)
            .json({dispDate});
    } catch (err) {
        next(err);
    }
});

export default router;