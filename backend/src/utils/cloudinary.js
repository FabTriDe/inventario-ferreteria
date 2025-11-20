const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsdnkc3eb",
  api_key: process.env.CLOUDINARY_API_KEY || "479784982925749",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "ecbeq43QirS9FtFP9zBLJQNLgbo",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "inventario-ferreteria",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
