import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"


// login user
const loginUser= async (req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User doesn't exist"})
        }
        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({success:false,message:"Invalid credentials"})
        }
        const token=createToken(user._id);
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}


// token
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

// register user
const registerUser=async (req,res)=>{
    // checking if user is alredy exists
    const {name,password,email}=req.body;
    try {
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({succes:false,message:"User already exists"})
        }
        //validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({succes:false,message:"Please Enter valid email"})
        }

        if(password.length<8){
            return res.json({succes:false,message:"Please Enter Stromg password"})
        }
        // hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        // save new user in database
        const user=await newUser.save()
        const token=createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

export {loginUser,registerUser}