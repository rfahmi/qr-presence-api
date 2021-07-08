import Division from "../models/Division"
class DivisionController {
    /** Get List */
    static async index(req: any, res: any) {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;
        const skip = (page - 1) * size;
        try {
            const data = await Division.find({})
                .limit(size)
                .skip(skip)
                .sort({
                    createdAt: 'desc'
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

    /** Get One */
    static async get(req: any, res: any) {
        try {
            const data = await Division.findOne(
                { _id: req.params.id }
            );
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
        const data = new Division({
            name: req.body.name,
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

    /** Update */
    static async update(req: any, res: any) {
        const find = { _id: req.params.id };
        const data = {
            name: req.body.name,
        };
        const options = {
            upsert: true,
            useFindAndModify: false
        };

        try {
            await Division.findOneAndUpdate(
                find,
                data,
                options,
                (error: any, response: any) => {
                    if (!error) {
                        if (!response) {
                            response = new Division();
                        }
                        response.save();

                        res.json({
                            success: true,
                            message: "Data Updated",
                            data
                        });
                    }
                });

        } catch (error) {
            res.status(400).send(error);
        }
    }

    /** Delete */
    static async delete(req: any, res: any) {
        try {
            const data = await Division.remove(
                { _id: req.params.id }
            );
            res.json({
                success: true,
                message: "Data Deleted",
                data
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default DivisionController;
