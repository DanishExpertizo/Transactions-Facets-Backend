import jwt from 'jsonwebtoken';
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decode = jwt.verify(token, JWT_SECRET);
        if (!decode || !decode.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        req.id = decode.userId;
        next();
    }
    catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
