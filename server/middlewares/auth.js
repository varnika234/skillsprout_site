const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
//next to go on next block
exports.auth = async (req, res, next) => {

    try {
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'toekn is invalid'
            })
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'something went wrong, while validating token'
        })
    }
}

//  isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for student only'
            })
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}

// is instructor
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Instructor only'
            })
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}

// is admin
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only'
            })
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}




