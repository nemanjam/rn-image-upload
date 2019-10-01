const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const serveIndex = require("serve-index");

var fs = require("fs");
var imagesDir = __dirname + "/images";

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const app = express();
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, imagesDir);
  },
  filename(req, file, callback) {
    callback(null, `${file.filename}_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use("/images", serveIndex(imagesDir));
app.use("/images", express.static(imagesDir));

app.get("/info", (req, res) => {
  res.status(200).send("you can post to /api/upload");
});

app.post("/api/upload", upload.array("photo", 1), (req, res) => {
  console.log("file", req.files);
  console.log("body", req.body);
  res.status(200).json({ message: "success", url: req.files[0].filename });
});

let port = process.env.PORT || 5000;
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT || 80;
}

app.listen(port, () => console.log(`Server started on port ${port}`));
