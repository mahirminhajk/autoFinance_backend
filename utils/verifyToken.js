import jwt from "jsonwebtoken"

//* utils
import { createErr } from "./createErr.js"

export const verifyToken = (req, res, next) => {
    //* token
    const token = req.cookies.access_token
    if (!token) return next(createErr(401, "Access denied"))

    //* verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(createErr(401, "Access denied"))
        req.user = user
        next();
    });
};

export const verifyLogin = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        //* check the req.user and req.params.id is equal
        if (req.user.id === req.params.id) {
            next();
        } else return next(createErr(401, "Access denied"));

    });
}

export const verfiyAdmin = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        //* check admin level
        if (req.user.level === 3) {
            next();
        } else return next(createErr(401, "Access denied"));
    });
};

export const verfiyAdminOrSameUser = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        //* check admin level
        if (req.user.level === 3 || req.user.id === req.params.id) {
            next();
        } else return next(createErr(401, "Access denied"));
    });
};

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        //* check same user
        if (req.user.id === req.params.id) {
            res
                .status(200)
                .json({ success: true });
        }
        else return next(createErr(401, "Access denied"));
    });
};