const Category = require("../models/tags");

//create tag ka handler
exports.createCategory = async(req,res)=>{
    try{
        //fetch data
        const {name, description}= req.body;

        //validation
        if(!name || !description){
            return res.status(500).json({
                success:false,
                message:"All feilds are required",
            })
        }

        //create entry in DB
        const tagDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success:true,
            message: "Category Created Successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAllTags handler
exports.showAllCategory = async(req, res)=>{
    try{
        const allTags = await Category.find({},{name:true, description:true});
        return res.status(200).json({
            success:true,
            message:"All category returned Successfully",
            allTags,
        })
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// category page details 
exports.categoryPageDetails = async (req, res)=>{
    try{
        // get category id 
        const {categoryId} = req.body;
        // get courses for specified catagory 
        const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();

        //validation
        if( !selectedCategory){
            return res.status(400).json({
                success: false,
                message: "Data not found",
            });
        }
        // get course for diffrent categories 
        const differentCategories = await Category.find({
            _id: {$ne: categoryId},
        })
        .populate("courses")
        .exec();
        
        // TODO: get top selling courses 

        // return response 
        return res.status(200).json({
            success: false,
            data:{
                selectedCategory,
                differentCategories,
            }
        })
    }
    catch(error){

    }
}