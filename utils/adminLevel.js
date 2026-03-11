import { createErr } from "./createErr.js";
import { verifyToken } from "./verifyToken.js";


export const isAdminLevelThree = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        if (req.user.level === 3) {
            next();
        } else {
            next(createErr(401, "Unauthorized: Admin level 3 required"));
        }
    });
};

export const isAdminLevelTwo = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        if (req.user.level === 2 || req.user.level === 3) {
            return next();
        } else {
            return next(createErr(401, "Unauthorized: Admin level 2 required"));
        }
    });
};


