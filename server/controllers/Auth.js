
// auth.js ( sendotp, signup, login, change password)
// resetpassword

const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config;

//SEND OTP
exports.sendOTP = async (req, res) => {

    try {

        //fetch email from req body
        const { email } = req.body;

        //check if user exists
        const checkUserPresent = await User.findOne({ email });

        // if already exsists
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered ",
            })
        }

        //if not present generate otp
        var otp = otpGenerator.generate(6, {
            uppercaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated", otp);

        //check unique otp
        const result = await OTP.findOne({ otp: otp });

        // not good code bcz we are looping over db calls
        while (result) {
            otp = otpGenerator(6, {
                uppercaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        //create an entry in db for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success: true,
            message: 'OTP sent Successfully',
            otp,
        })

        // return response
    }
    catch (error) {
        console.Console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//SIGNUP

exports.signUp = async (req, res) => {

    //data fetch
    try {
        const {
            firstName,
            lastname,
            email,
            password,
            confirmPassword,
            accountType,
            contactType,
            otp
        } = req.body;

        //data validate
        if (!firstName || !lastname || !email || !password || !confirmPassword || !accountType || !contactType || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }
        //match pass
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not matches, please try again"
            });
        }
        //check id user exist
        const existingUser = await User.findOne(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered"
            })
        }

        //find most recent otp fr the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //validate otp
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'Otp Found',
            })
        }
        else if (otp != recentOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        //hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastname,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            //got from dicebear
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastname}`,
        })

        // return response
        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again",
        })
    }

}

// login 

exports.login = async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;
        // validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required, please try again'
            });
        }
        // user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please sign up first"
            })
        }
        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
                // role:user.role,
            }
            const token = jwt.sign(payload, proccess.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password doesnt match"
            })
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login failure ,please try again'
        })
    }
};

//Change password
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }
  

