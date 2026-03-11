import multer from 'multer';

const storage = multer.diskStorage({
    destination: 'public/28w3ko',
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }

})

// const uploadToServer = multer({ storage: storage });

const memoryStorage = multer.memoryStorage();

const uploadToServer = multer({ storage: memoryStorage });

export default uploadToServer;