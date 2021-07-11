import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import FTPStorage from "multer-ftp";
const setTZ = require('set-tz')
// set timezone
setTZ('Asia/Jakarta');

/** Mutler Configs */
var storage = FTPStorage({
    ftp: {
        host: 'ftp.haribahagia.net',
        secure: false,
        username: 'files@haribahagia.net',
        password: 'q6{xGV/q&wu;T4v*'
    },
    destination: (req: any, file: any, cb: any) => {
        cb(null, 'uploads')
    },
    filename: (req: any, file: any, cb: any) => {
        const ext = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + Date.now() + "." + ext)
    }
});
const upload = multer({ storage });

/** Express Init */
const app = express();
app.use(cors());
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
