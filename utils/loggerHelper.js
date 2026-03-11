import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Create separate loggers for each log level
const errorLogger = winston.createLogger({
    level: "error",
    format: winston.format.json(),
    transports: [
        new DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "7d",
        }),
    ],
});

const infoLogger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new DailyRotateFile({
            filename: "logs/info-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "7d",
        }),
    ],
});

const warnLogger = winston.createLogger({
    level: "warn",
    format: winston.format.json(),
    transports: [
        new DailyRotateFile({
            filename: "logs/warn-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "7d",
        }),
    ],
});

// Add console transport for development (optional)
if (process.env.NODE_ENV !== "production") {
    errorLogger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
    infoLogger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
    warnLogger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

export { errorLogger, infoLogger, warnLogger };