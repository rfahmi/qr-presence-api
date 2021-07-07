const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserController {
    /** Login */
    static async login(req: any, res: any) {
        const user = await User.findOne({ nik: req.body.nik });
        if (!user)
            return res.status(400).send({
                success: false,
                message: "User Not Exists",
            });
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (validPassword) {
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET
            );
            return res.header("token", token).send({
                success: true,
                message: "Access Granted!",
                data: user,
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Invalid Password",
            });
        }
    }

    /** Get List */
    static async index(req: any, res: any) {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;
        const skip = (page - 1) * size;
        try {
            const data = await User.find({})
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
            const data = await User.findOne(
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
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(
            req.body.password,
            salt
        );

        const data = new User({
            name: req.body.name,
            nik: req.body.nik,
            password: hashPassword,
            division: req.body.division,
            isAdmin: req.body.isAdmin,
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
            nik: req.body.nik,
            password: req.body.password,
            division: req.body.division,
            isAdmin: req.body.isAdmin,
            presences: []
        };
        const options = {
            upsert: true,
            useFindAndModify: false
        };

        try {
            await User.findOneAndUpdate(
                find,
                data,
                options,
                (error: any, response: any) => {
                    if (!error) {
                        if (!response) {
                            response = new User();
                        }
                        response.save();

                        res.json({
                            success: true,
                            message: "Data Updated",
                            data
                        });
                    }
                })

        } catch (error) {
            res.status(400).send(error);
        }
    }

    /** Delete */
    static async delete(req: any, res: any) {
        try {
            const data = await User.remove(
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

export default UserController;
