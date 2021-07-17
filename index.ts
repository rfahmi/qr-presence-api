import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";
const setTZ = require('set-tz')
// set timezone

setTZ('Asia/Jakarta');

var s3 = new aws.S3();
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: "us-east-1",
});
var storageAWS = multerS3({
    s3: s3,
    bucket: 'rfahmibucket',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        const ext = file.originalname.split('.')[1];
        cb(null, Date.now().toString() + "." + ext)
    }
});
const upload = multer({ storage: storageAWS });

/** Express Init */
const app = express();
app.use(cors({ "exposedHeaders": "*" }));
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.any());
app.use(express.static('public'));


//Import Routes
import presence from "./routes/presence";
import user from "./routes/user";
import division from "./routes/division";
import setting from "./routes/setting";

//Route Middlewares
app.use("/presence", presence);
app.use("/user", user);
app.use("/division", division);
app.use("/setting", setting);


//Database
try {
    mongoose.connect(
        process.env.MONGODB || "",
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => console.log("Database connected")
    );
} catch (error) {
    console.log("Could not connect to database.");
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});
