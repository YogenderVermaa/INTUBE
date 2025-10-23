import multer from "multer";

const storage = multer.diskStorage({
  // created a storage configuration object
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.floor(Math.random() * 1e9);
    cb(null, file.filaname + "-" + uniqueSuffix);
  },
});

export const upload = multer({
  storage,
});
