// const User = require("../models/User");
import User from "../models/User"
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import NodeRSA from 'node-rsa'


class UserController {
    /** Login */
    static async login(req: any, res: any) {
        try {
            const user = await User.findOne({ nik: req.body.nik }).populate("division");
            if (!user)
                return res.send({
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
                return res.send({
                    success: false,
                    message: "Invalid Password",
                });
            }
        } catch (error) {
            res.status(400).send(error);

        }

    }

    /** Get List */
    static async index(req: any, res: any) {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;
        const skip = (page - 1) * size;
        try {
            const data = await User.find({}).populate("division")
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
            ).populate("division");
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
        const options = {
            upsert: true,
            useFindAndModify: false
        };

        try {
            await User.findOneAndUpdate(
                find,
                req.body,
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
                            data: response
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

    static async verifySign(req: any, res: any) {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.send({
                success: false,
                message: "User tidak ada",
            });
        }
        if (!user.publicKey) {
            return res.send({
                success: false,
                message: "Public key tidak tersedia",
            });
        }
        const publicKey = user.publicKey;
        const signature = req.body.signature;
        const payload = req.params.id;
        try {
            const key = new NodeRSA();
            const publicKeyBuffer = Buffer.from(publicKey, 'base64');
            const signer = key.importKey(publicKeyBuffer, 'public-der');
            const signatureVerified = signer.verify(Buffer.from(payload), signature, 'utf8', 'base64');

            res.json({
                success: signatureVerified,
                message: signatureVerified ? 'Signature Valid' : 'Signature Invalid',
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default UserController;
