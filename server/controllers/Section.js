const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async ( req, res )=>{
    try{

        // data fetch
        const {sectionName, courseId } = req.body;
        
        // data validation
        if( !sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }
        
        // create section 
        const newSection = await Section.create({sectionName});

        // update course with section objetID 
        const updateCourseDetails= await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                },
            },
           //use populate to replace section / sub section 
             {new:true},
        )

        // return response
        return res.status(200)({
            success:true,
            message:'Section created',
            updateCourseDetails,
        });

    }
    catch(error){
        return res.status(500)({
            success:false,
            message:'Unable to create section',
            error:error.message
        });
    }
}

exports.updateCourseSection = async (req, res )=>{
    try{
        
        // data input
         const {sectionName, sectionId } = req.body;
        
         // data validation
         if( !sectionName || !sectionId){
             return res.status(400).json({
                 success:false,
                 message:'Missing Properties'
             });
         }

        // update data
        const section = await section.findByIdAndUpdate( sectionId, {sectionName}, {new:true});

        // return res
        return res.status(200)({
            success:true,
            message:'Section updated sucessfully',
        });

    }
    catch( error){
        return res.status(500)({
            success:false,
            message:'Unable to create section',
            error:error.message
        });
    }
}

exports.deleteSection = async(req, res)=>{
    try{
        // get ID- assuming we are sending id in paraams 
        const {sectionId} = req.params;

        // delete section
        await Section.findByIdAndDelete(sectionId);

        // TODO: we ned to delete entry in course scema

        // return response
        return res.status(200)({
            success:true,
            message:'ID deleted sucessfully',
        });

    }
    catch( error){
        return res.status(500).json({
            success:false,
            message:'Unable to create section',
            error:error.message
        });
    }
}