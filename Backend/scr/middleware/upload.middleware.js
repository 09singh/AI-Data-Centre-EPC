import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});

const fileFilter = (req, file, cb) => {

  const allowed = [
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

export default multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});