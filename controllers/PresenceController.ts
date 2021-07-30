import Presence from "../models/Presence"
import Setting from "../models/Setting"
import User from "../models/User"
const bcrypt = require("bcryptjs");
const QRCode = require('qrcode');
const moment = require('moment-business-days');
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
        const momentDate = moment(year + '-' + month + '-01 00:00', 'YYYY-MM-DD h:m');

        try {
            const setting = await Setting.findOne({});
            Presence.find({
                user: req.params.id,
                timestamp: {
                    $gte: momentDate.startOf('day').toDate(),
                    $lte: momentDate.endOf('month').toDate()
                }
            }, (err: any, presences: any) => {
                let in_count = presences.filter((e: any) => {
                    return e.type === "in"
                })
                let late_count = in_count.filter((e: any) => {
                    return e.isLate
                })

                const lastDay = Number(momentDate.endOf('month').format('D'));
                let late_min = Object.values(late_count).reduce((a: any, { lateDurationMin }) => a + lateDurationMin, 0);


                moment.updateLocale('en', {
                    workingWeekdays: [1, 2, 3, 4, 5, 6]
                });
                const businessDayCount = moment(year + '-' + month + '-01', 'YYYY-MM-DD').businessDiff(moment(year + '-' + month + '-' + lastDay, 'YYYY-MM-DD'));
                const jumlahTelat = Number(late_count.length); //Count type: in , isLate: true
                const jumlahMasuk = Number(in_count.length); //Count type: in
                const tidakHadir = businessDayCount - jumlahMasuk;
                const jumlahTelatMin = Math.round(Number(late_min)); //count late minute 
                const uangMakan = Number(setting.uangMakan) * jumlahMasuk;
                const dendaTelat = Number(setting.dendaTelat) * Math.ceil(jumlahTelatMin / Number(setting.kelipatanTelatMin));
                const ratioMasuk = Math.round((jumlahMasuk / businessDayCount) * 100);
                const ratioTelat = Math.round((jumlahTelat / jumlahMasuk) * 100) || 0;
                res.send({
                    success: true,
                    message: "Data Found",
                    data: {
                        businessDayCount,
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
        const momentDate = moment(year + '-' + month + '-01 00:00', 'YYYY-MM-DD h:m');
        const momentDate2 = moment(year + '-' + month + '-01 00:00', 'YYYY-MM-DD h:m');

        const setting = await Setting.findOne({});
        //Buat workbook excel
        var workbook = new excel.Workbook({
            defaultFont: {
                size: 11,
            },
        });
        var worksheet = workbook.addWorksheet('Sheet 1');
        //Header
        let titleCell = workbook.createStyle({
            alignment: {
                horizontal: 'center',
                vertical: 'center',
            },
            font: {
                bold: true,
                size: 20,
            },
        });
        let headerCell = workbook.createStyle({
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#D6DCE4',
                fgColor: '#D6DCE4'
            },
            font: {
                bold: true,
            },
        });
        let currencyCell = workbook.createStyle({
            numberFormat: "Rp #,##0",
        });
        let borderCell = workbook.createStyle({
            border: { // §18.8.4 border (Border)
                left: {
                    style: "thin", //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
                    color: "#000000"// HTML style hex value
                },
                right: {
                    style: "thin",
                    color: "#000000"
                },
                top: {
                    style: "thin",
                    color: "#000000"
                },
                bottom: {
                    style: "thin",
                    color: "#000000"
                }
            },
        });
        worksheet.cell(1, 1, 1, 10, true).string("LAPORAN KEHADIRAN BULANAN").style(titleCell);

        worksheet.cell(2, 1).string("Tahun").style(borderCell);
        worksheet.cell(2, 2).string(String(year)).style(borderCell);
        worksheet.cell(3, 1).string("Bulan").style(borderCell);
        worksheet.cell(3, 2).string(momentDate.format("MMMM")).style(borderCell);
        worksheet.cell(4, 1).string("Jumlah Hari").style(borderCell);
        // worksheet.cell(4, 2).string(momentDate.endOf('month').format('D')).style(borderCell);
        worksheet.cell(5, 1).string("Jumlah Libur").style(borderCell);
        worksheet.cell(5, 2).string("0").style(borderCell);

        worksheet.cell(7, 1, 8, 1, true).string("No").style(headerCell).style(borderCell);
        worksheet.cell(7, 2, 8, 2, true).string("Divisi").style(headerCell).style(borderCell);
        worksheet.cell(7, 3, 8, 3, true).string("NIK").style(headerCell).style(borderCell);
        worksheet.cell(7, 4, 8, 4, true).string("Nama Karyawan").style(headerCell).style(borderCell);
        worksheet.cell(7, 5, 7, 8, true).string("Summary").style(headerCell).style(borderCell);
        worksheet.cell(8, 5).string("Hari Kerja").style(headerCell).style(borderCell);
        worksheet.cell(8, 6).string("Tidak Hadir").style(headerCell).style(borderCell);
        worksheet.cell(8, 7).string("Telat (Kali)").style(headerCell).style(borderCell);
        worksheet.cell(8, 8).string("Telat (Menit)").style(headerCell).style(borderCell);
        worksheet.cell(7, 9, 7, 10, true).string("Pembayaran").style(headerCell).style(borderCell);
        worksheet.cell(8, 9).string("Uang Makan").style(headerCell).style(borderCell);
        worksheet.cell(8, 10).string("Denda Telat").style(headerCell).style(borderCell);

        User.find({}).populate('division').lean().exec((err: any, users: any) => {
            const userIds = users.map((user: any) => user._id)
            Presence.find({
                user: { $in: userIds }, timestamp: {
                    $gte: momentDate2.startOf('day').toDate(),
                    $lte: momentDate2.endOf('month').toDate()
                }
            }, (err: any, presences: any) => {
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
                const lastDay = Number(momentDate2.endOf('month').format('D'));
                moment.updateLocale('en', {
                    workingWeekdays: [1, 2, 3, 4, 5, 6]
                });
                const businessDayCount = moment(year + '-' + month + '-01', 'YYYY-MM-DD').businessDiff(moment(year + '-' + month + '-' + lastDay, 'YYYY-MM-DD'));
                worksheet.cell(4, 2).string(String(businessDayCount)).style(borderCell);

                users.forEach((e: any, index: number) => {

                    //Deklarasi Variabel Pendukung
                    const rowNum = index + 9;
                    const jumlahTelat = Number(e.presences.late.num); //Count type: in , isLate: true
                    const jumlahMasuk = Number(e.presences.in); //Count type: in
                    const tidakHadir = businessDayCount - jumlahMasuk;
                    const jumlahTelatMin = Math.round(Number(e.presences.late.min)) || 0; //count late minute 
                    const uangMakan = Number(setting.uangMakan) * jumlahMasuk;
                    const dendaTelat = Number(setting.dendaTelat) * Math.ceil(jumlahTelatMin / Number(setting.kelipatanTelatMin));
                    worksheet.cell(rowNum, 1).number(rowNum - 8).style(borderCell);
                    worksheet.cell(rowNum, 2).string(e.division.name).style(borderCell);
                    worksheet.cell(rowNum, 3).number(Number(e.nik)).style(borderCell);
                    worksheet.cell(rowNum, 4).string(e.name).style(borderCell);
                    worksheet.cell(rowNum, 5).number(businessDayCount).style(borderCell); //Hari Kerja
                    worksheet.cell(rowNum, 6).number(tidakHadir).style(borderCell); //Tidak Hadir
                    worksheet.cell(rowNum, 7).number(jumlahTelat).style(borderCell); //Telat (Kali)
                    worksheet.cell(rowNum, 8).number(jumlahTelatMin).style(borderCell); //Telat (Menit)
                    worksheet.cell(rowNum, 9).number(uangMakan).style(currencyCell).style(borderCell); //Uang Makan
                    worksheet.cell(rowNum, 10).number(dendaTelat).style(currencyCell).style(borderCell); //Denda Telat
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
        const today = new Date().toISOString().slice(0, 10);
        moment.updateLocale('en', {
            workingWeekdays: [1, 2, 3, 4, 5, 6]
        });
        if (!moment(today).isBusinessDay()) {
            return res.send({
                success: false,
                message: "Sekarang hari libur",
                data: today
            });
        }
        //Jika tidak ada photo
        if (!req.files || req.files.length === 0) {
            if (req.body.qr) {
                //Cek QR code string
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
