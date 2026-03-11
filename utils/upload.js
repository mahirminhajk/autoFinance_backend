import multer from "multer";

//* multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;