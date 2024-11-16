const Profile= require( "../models/Profile"); 
const User = require ("../models/User");

exports.updateProfile = async (req, res)=>{
    try{
        //get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        // get userid 
        const id = req.user.id;

        // validation 
        if( !contactNumber || !gender || !id ){
            return res.status(400).json({
                success:false,
                message:'All feils are required',
            });
        }

        // find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails= await Profile.findById(profileId);

        // update Profile
        profileDetails.dateOfBirth= dateOfBirth;
        profileDetails.about= about;
        profileDetails.gender= gender;
        profileDetails.contactNUmber=contactNUmber;
        await profileDetails.save();
        // return res
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            profileDetails,
        });
    }
    catch (error){
        return res.status(500).json({
            success:false,
            // message:'Unable to create section',
            error:error.message
        });
    }
}

//delete Account
// exploration ->how we can scedule this deletion task 

exports.deleteAccount = async (req, res)=>{
    try{
        // get id
        const id = req.user.id;
        
        // validation
        const userDetails = await User.findById(id);
        if( !userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            })
        }

        // delete profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // TODO: unrooll user fro all enrolled courses 

        // delete user
        await User.findByIdAndDelete({_id:id});

        // return res 
        return res.status(200).json({
            success:true,
            message:'user updated successfully',
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to deleten',
        });
    }
}

// all details get 

exports.getAllUserDeatails = async (req, res)=>{
    try{
        // get id 
        const id= req.user.id;

        // validation and get user userDetails
        const userDetails= await User. findById(id).populate("addtionalDetails").exec();

        //  return response 
        return res.status(200).json({
            success:true,
            message:'user data fetched successfully',
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
}