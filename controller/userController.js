const res= require("express/lib/response") 
const user = require("../models/userModel")
const bcrypt= require("bcrypt")//hashing the password

const securePassword = async (password)=>{
    try {
        
        const passwordHash= await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message);
    }
}


 
const loadRegister = async (req,res)=>{
    try {
        res.render("registration")//this is for getting the registration form 
    } catch (error) {
        console.log( error.message);
    }
}
const insertUser = async(req,res)=>{
    try {
        const securePasswd= await securePassword(req.body.password)//wait for the hashed password
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(req.body.name)) {
            return res.render('registration', { message: "Invalid name format!" });
        }
        
        
        // Validation: Check if the email or mobile is already in use
        const existingUserByEmail = await user.findOne({ email:req.body.email });
        const existingUserBymobile = await user.findOne({ mobile:req.body.mobile });

        if (existingUserByEmail) {
            return res.render("registration", { message: "Email is already in use!" });
        }

        if (existingUserBymobile) {
            return res.render("registration", { message: "mobile is already in use!"})}

      
        const newUser = new user({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:securePasswd,
            isAdmin:0
        })
        const userData=await newUser.save();
        if(userData){
            res.render("login",{message:"your registration is successfull!"})
        }else{
            res.render("registration",{message:"your registration is failed"})
        }



    } catch (error) {
        console.log(error.message);
    }

}

//login user
const loginLoad= async(req,res)=>{
    try {
        
        res.render('login')

    } catch (error) {
        console.log(error.message);
    }


}

const verifylogin= async(req,res)=>{
    try {
        const email= req.body.email;
        const password= req.body.password;
        const loginUserData = await user.findOne({email:email})
        if(loginUserData){
            const passwordCheck = await bcrypt.compare(password,loginUserData.password)
            if (passwordCheck) {
               if (loginUserData.isVarified ===0) {//approving without mail verification
                res.render("login",{message:"please verify your mail"})
               } else {
                    req.session.user_id =loginUserData._id
                    res.redirect("/home")
               }
            } else {
                res.render("login",{message:"Login credentials are incorrect"})
            }
        }else{
            res.render("login",{message:"Login credentials are incorrect"})
        }

    } catch (error) {
        console.log(error.message);
    }


}

const loadHome =async (req,res)=>{
    try {
        const users = await user.findById({_id:req.session.user_id})
        res.render("home",{users:users})
    } catch (error) {
        console.log(error.message);
    }
}
const userLogout =async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect("/")
    } catch (error) {
        console.log(error.message);
    }
}



module.exports= {
    loadRegister,
    insertUser,
    loginLoad,
    verifylogin,
    loadHome,
    userLogout
}