import Setting from "../models/Setting"

class SettingController {
    /** Init */
    static async init(req: any, res: any) {
        const data = new Setting({
            uangMakan: 0,
            dendaTelat: 0,
            jamTelatMasuk: "080000",
            kelipatanTelatMin: 1,
        });
        try {
            await data.save();
            res.send({
                success: true,
                message: "Setting initialized",
                data
            });
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
    /** Get One */
    static async get(req: any, res: any) {
        try {
            const data = await Setting.findOne({});
            res.send({
                success: true,
                message: "Data Found",
                data
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }
    /** Update */
    static async update(req: any, res: any) {
        const data = req.body;
        try {
            await Setting.updateMany(data);
            res.send({
                success: true,
                message: "Setting Updated",
                data
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default SettingController;
