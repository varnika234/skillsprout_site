const express = require("express");
const app =express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes=  require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect}= require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credential:true
        })
)
app.use(
    fileUpload({
        useTempRoutes:true,
        tempFileDir:"/tmp",
    })
)

// cloudiary connect 
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes );
app.use("/api/v1/profile",profileRoutes );
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment",paymentRoutes );
app.get("/",(req, res)=>{
   return res.json({
    success:true,
    message:"Your serever is runing..."
   }) 
});

app.listen(PORT, ()=>{
    console.log(`App is running at ${PORT}`)
})