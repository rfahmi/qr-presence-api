const jwt = require("jsonwebtoken");

const auth = (req: any, res: any, next: any) => {
    const token = req.header("token");

    if (!token)
        return res
            .status(403)
            .send({ success: false, message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send({ success: false, message: "Invalid Token" });
    }
};

export default auth;