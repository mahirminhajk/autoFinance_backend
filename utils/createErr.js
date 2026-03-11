// error: 0,
//   warn: 1,
//   info: 2,

export const createErr = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    err.success = false;
    return err;
}