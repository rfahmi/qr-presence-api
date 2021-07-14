import Presence from "../models/Presence"
import Setting from "../models/Setting"
import User from "../models/User"
const bcrypt = require("bcryptjs");
const QRCode = require('qrcode');
const moment = require('moment');
const excel = require('excel4node');
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
    /** Get One */
    static async getReportSumary(req: any, res: any) {
        const { month, year } = req.body;
        try {
            const setting = await Setting.findOne({});
            Presence.find({ user: req.params.id }, (err: any, presences: any) => {
                let in_count = presences.filter((e: any) => {
                    return e.type === "in"
                })
                let late_count = in_count.filter((e: any) => {
                    return e.isLate
                })

                let late_min = Object.values(late_count).reduce((a: any, { lateDurationMin }) => a + lateDurationMin, 0);

                const totalDay = moment(year + '-' + month + '-01 00:00', 'YYYY-MM-DD h:m')
                    .endOf('month')
                    .format('D'); //Ambil last day on month,year

                const jumlahTelat = Number(late_count.length); //Count type: in , isLate: true
                const jumlahMasuk = Number(in_count.length); //Count type: in
                const tidakHadir = Number(totalDay) - jumlahMasuk;
                const jumlahTelatMin = Math.round(Number(late_min)); //count late minute 
                const uangMakan = Number(setting.uangMakan) * jumlahMasuk;
                const dendaTelat = Number(setting.dendaTelat) * Math.ceil(jumlahTelatMin / Number(setting.kelipatanTelatMin));
                const ratioMasuk = Math.round((jumlahMasuk / totalDay) * 100);
                const ratioTelat = Math.round((jumlahTelat / jumlahMasuk) * 100);
                res.send({
                    success: true,
                    message: "Data Found",
                    data: {
                        jumlahTelat,
                        jumlahMasuk,
                        tidakHadir,
                        jumlahTelatMin,
                        uangMakan,
                        dendaTelat,
                        ratioMasuk,
                        ratioTelat
                    }
                })
            })
        } catch (error) {
            res.status(400).send(error);
        }
    }
    /** Download Report in Excel */
    static async downloadReport(req: any, res: any) {
        const { month, year } = req.body;
        const setting = await Setting.findOne({});
        //Buat workbook excel
        var workbook = new excel.Workbook();
        var worksheet = workbook.addWorksheet('Sheet 1');
        //Header
        worksheet.cell(1, 1, 2, 1, true).string("No");
        worksheet.cell(1, 2, 2, 2, true).string("Divisi");
        worksheet.cell(1, 3, 2, 3, true).string("NIK");
        worksheet.cell(1, 4, 2, 4, true).string("Nama Karyawan");
        worksheet.cell(1, 5, 1, 7, true).string("Summary");
        worksheet.cell(2, 5).string("Tidak Hadir");
        worksheet.cell(2, 6).string("Telat (Kali)");
        worksheet.cell(2, 7).string("Telat (Menit)");
        worksheet.cell(1, 8, 1, 9, true).string("Pembayaran");
        worksheet.cell(2, 8).string("Uang Makan");
        worksheet.cell(2, 9).string("Denda Telat");

        User.find({}).lean().exec((err: any, users: any) => {
            const userIds = users.map((user: any) => user._id)
            Presence.find({ user: { $in: userIds } }, (err: any, presences: any) => {
                users.forEach((user: any) => {
                    let in_count = presences.filter((presence: any) => {
                        return String(presence.user) === String(user._id) && presence.type === "in"
                    })
                    let out_count = presences.filter((presence: any) => {
                        return String(presence.user) === String(user._id) && presence.type === "out"
                    })
                    let late_count = in_count.filter((presence: any) => {
                        return presence.isLate
                    })
                    let late_min = Object.values(late_count).reduce((a: any, { lateDurationMin }) => a + lateDurationMin, 0);

                    user.presences = {
                        in: in_count.length,
                        out: out_count.length,
                        late: {
                            num: late_count.length,
                            min: late_min
                        },
                    }
                });


                //Body dari row ke-3
                const totalDay = moment(year + '-' + month + '-01 00:00', 'YYYY-MM-DD h:m')
                    .endOf('month')
                    .format('D'); //Ambil last day on month,year
                users.forEach((e: any, index: number) => {

                    //Deklarasi Variabel Pendukung
                    const rowNum = index + 3;
                    const jumlahTelat = Number(e.presences.late.num); //Count type: in , isLate: true
                    const jumlahMasuk = Number(e.presences.in); //Count type: in
                    const tidakHadir = Number(totalDay) - jumlahMasuk;
                    const jumlahTelatMin = Math.round(Number(e.presences.late.min)); //count late minute 
                    const uangMakan = Number(setting.uangMakan) * jumlahMasuk;
                    const dendaTelat = Number(setting.dendaTelat) * Math.ceil(jumlahTelatMin / Number(setting.kelipatanTelatMin));

                    // console.log(jumlahTelatMin);

                    worksheet.cell(rowNum, 1).number(rowNum);
                    worksheet.cell(rowNum, 2).string("");
                    worksheet.cell(rowNum, 3).string(e.nik);
                    worksheet.cell(rowNum, 4).string(e.name);
                    worksheet.cell(rowNum, 5).number(tidakHadir); //Tidak Hadir
                    worksheet.cell(rowNum, 6).number(jumlahTelat); //Telat (Kali)
                    worksheet.cell(rowNum, 7).number(jumlahTelatMin); //Telat (Menit)
                    worksheet.cell(rowNum, 8).number(uangMakan); //Uang Makan
                    worksheet.cell(rowNum, 9).number(dendaTelat); //Denda Telat
                });

                //Send excel file sebagai response
                workbook.write('LaporanPresensi.xlsx', res);
            })
        })

    }

    /** Get User Presence */
    static async get(req: any, res: any) {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;
        const skip = (page - 1) * size;

        try {
            const data = await Presence.find({ user: req.params.id })
                .limit(size)
                .skip(skip)
                .sort({
                    timestamp: 'desc'
                });
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
                    return res.send({
                        success: false,
                        message: "QR Code Invalid"
                    });
                }
            } else {
                return res.send({
                    success: false,
                    message: "Bad Request",
                    data: req.body
                });
            }
        }

        //Cek jika presensi sudah ada hari ini dengan type yang sama
        const userData = await Presence.findOne({
            user: req.params.id,
            type: req.params.type,
            timestamp: {
                $gte: moment().startOf('day').utc().format(),
                $lte: moment().endOf('day').utc().format()
            }
        });

        if (userData) {
            return res.send({
                success: false,
                message: "Presence exists"
            });
        }


        //Hitung Keterlambatan, Waktu dihitung UTC
        const presenceTime = moment().utc();
        const lateInTime = moment().set(
            {
                "hour": 8,
                "minute": 0,
                "second": 0
            }).utc();
        const lateDurationMin = moment.duration(presenceTime.diff(lateInTime)).asMinutes();
        const isLate = req.params.type === "in" && lateDurationMin > 0;
        const data = new Presence({
            user: req.params.id,
            timestamp: presenceTime.format(),
            type: req.params.type,
            isLate,
            lateDurationMin: isLate ? lateDurationMin : 0,
            photo: req.files.length > 0 ? req.files[0].key : null,
        });

        try {
            const savedPresence = await data.save();
            User.findById(req.params.id, (err: any, user: any) => {
                user.presences.push(savedPresence);
                user.save();
            });
            res.send({
                success: true,
                message: "Data Created",
                data: savedPresence
            });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
}

export default PresenceController;
