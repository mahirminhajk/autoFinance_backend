import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

//* router import
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import dashboardRouter from './routes/dashboard.js';
import customerRouter from './routes/customer.js'
import dealerRouter from './routes/dealer.js'
import bankRouter from './routes/bank.js'
import transactionRouter from './routes/transaction.js'
import loadRouter from './routes/loan.js'
import sendMessage from './routes/messageSender.js'
import callRecordRouter from './routes/callRecord.js'
import groupRouter from './routes/group.js'
import takeoverRouter from './routes/takeover.router.js'
import dispDateRouter from './routes/dispDate.router.js'
import { errorLogger, infoLogger, warnLogger } from './utils/loggerHelper.js';

//* test
import morgan from 'morgan';

//* main config
const app = express();
dotenv.config();

//* database connection function
const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URI)
        .catch(error => { throw error });
}

mongoose.connection.on('disconnected', () => {
    console.error("mongoDB disconnected!");
});

//*test 
app.use(morgan('dev'));

//* middlewares
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.static('public'));


//* routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/das', dashboardRouter);
app.use('/api/cus', customerRouter);
app.use('/api/dealer', dealerRouter);
app.use('/api/bank', bankRouter);
app.use('/api/account', transactionRouter);
app.use('/api/loan', loadRouter);
app.use('/api/message', sendMessage);
app.use('/api/call', callRecordRouter);
app.use('/api/group', groupRouter);
app.use('/api/takeover', takeoverRouter);
app.use('/api/disp-date', dispDateRouter);



//* error handler
app.use((err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMessage = err.message || 'Something went wrong';
    return res.status(errStatus).json({
        sucess: false,
        status: errStatus,
        message: errMessage,
        stack: err.stack,
    })
});

//* server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    connectDB()
        .then(() => {
            infoLogger.info({
                level: 'info',
                message: `Server is running`,
                timestamp: new Date().toLocaleString(),
            })
        });
});


//? strict: false
//? http://localhost:5000/api/