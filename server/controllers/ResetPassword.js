const { defaultMaxListeners } = require("nodemailer/lib/xoauth2");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPasswordToken
exports.resetPasswordToken = async(req, res)=>{
   try{
        // get email body
        const email = req.body.email;
        // check user for this mailSender, email verification
        const user  = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:'Your email is not registered with us'
            });
        }
        // generate token 
        const token = crypto.randomUUID();
        //update user bt adding token an expiration time
        const updatedDetails= await User.findOneAndUpdate({email:email},
            {
                token:token,
                resetPasswordExpires:Date.now()+ 5*60*1000,
            },
            {new:true}
        );
        // create url
        const url  = `http://localhost:3000/update=password/${token}`;
        // send mail containing url
        await mailSender(email, 
                 "Password Reset Link", 
                `Password Reset Link:${url}`);
        // reten reponse
        return res.json({
            success:true, 
            message:'Email sent successfully, please check email and change pasword ',
        });
   }
   catch(error){
    console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending rest link'
        })
   }
}

//resetPassword
exports.resetPassword = async(req, res)=>{
    try{
        // data fetch
        //this token came to body by frontend we have put it in url as param
        const {password, confirmPassword, token}= req.body;
        // validation
        if(password != confirmPassword){
            return res.json({
                success:false,
                message:'Password not matchig'
            });
        }
        // get user details from db using token
        const userDetails = await User.findOne({token:token});
        // if no entry-in valid token
        if(!userDetails){
            return res.json({
                success:false,
                message:'token not invalid'
            });
        }
        // token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:'token is expired , please regenerate your token'
            });
        }
        // hash pwd 
        const hashedPassword= await bcrypt.hash(password, 10);
        // password update... new:true means return updated value
        await User.findOneAndUpdate(
            {token:token}, 
            {password:hashedPassword}, 
            {new:true});
        // return res
        return res.status(200).json({
            success:true,
            message:'Password was successfully updated'
        });

    }
    catch(error){
        return res.status(402).json({
            success:false,
            message:'Password was not successfully updated, tyr again'
        });
    }
}