const status = ['pending', 'unconform3', 'unconform2', 'unconform1', 'conform', 'upload_docs', 'verification', 'ready_login', 'login', 'ftr', 'loan_approved', 'loan_desp', 'rto_work', 'completed'];

export const getNextStatus = (statusName) => {
    const index = status.indexOf(statusName);
    if (index === -1) return null;
    return status[index + 1];
};

//TODO: we does not need this function if the fronted start to work properly
export const checkStatusIsCorrect = (statusName) => {
    const index = status.indexOf(statusName);
    if (index === -1) return false;
    else return true;
}