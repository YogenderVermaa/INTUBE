import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  // created a storage configuration object
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.floor(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // for .png ,.jpg
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
});


