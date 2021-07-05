
const Presence = require("../models/Presence");
const bcrypt = require("bcryptjs");
const QRCode = require('qrcode');
const moment = require('moment');

class PresenceController {
    /** GenerateQR */
    static async generateQR(req: any, res: any) {
        const salt = await bcrypt.genSalt(10);
        const today = new Date().toISOString().slice(0, 10);
        const QRString = await bcrypt.hash(
            today,
            salt
        );
        try {
            QRCode.toDataURL(QRString, { errorCorrectionLevel: 'H' }, (err: any, url: any) => {
                res.send({
                    success: true,
                    message: "QR Presence Generated",
                    data: {
                        url, string: QRString
                    }
                });
            })
        } catch (error) {
            res.status(400).send(error);
        }
    }

    /** GenerateQR */
    static async downloadReport(req: any, res: any) {
        const salt = await bcrypt.genSalt(10);
        try {
            res.send({
                success: true,
                message: "Report Generated",
                data: null
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }

    /** Get User Presence */
    static async get(req: any, res: any) {
        try {
            const data = await Presence.find({ userId: req.params.id });
            res.send({
                success: true,
                message: "Data Found",
                data
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }

    /** Create */
    static async create(req: any, res: any) {

        //Jika tidak ada photo
        if (!req.files || req.files.length === 0) {
            if (req.body.qr) {
                //Cek QR code string
                const today = new Date().toISOString().slice(0, 10);
                const validQR = await bcrypt.compare(
                    today,
                    req.body.qr
                );
                if (!validQR) {
                    return res.status(400).send({
                        success: false,
                        message: "QR Code Invalid"
                    });
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: "Bad Request",
                    data: req.body
                });
            }
        }

        //Cek jika presensi sudah ada hari ini dengan type yang sama
        const userData = await Presence.findOne({
            type: req.params.type, timestamp: {
                $gte: moment().startOf('day').toLocaleString(),
                $lte: moment().endOf('day').toLocaleString()
            }
        });

        if (userData) {
            return res.status(400).send({
                success: false,
                message: "Presence exists"
            });
        }

        const data = new Presence({
            userId: req.params.id,
            timestamp: Date.now(),
            type: req.params.type,
            photo: req.files.length > 0 ? req.files[0].filename : null,
        });
        try {
            await data.save();
            res.send({
                success: true,
                message: "Data Created",
                data
            });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
}

export default PresenceController;
