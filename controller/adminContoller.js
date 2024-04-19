const User = require("../models/userModel")
const bcrypt = require("bcrypt")

const loadAdminLogin = async (req, res) => {
    try {
        res.render("adminLogin")
    } catch (error) {
        console.log(error.message);
    }

}
const verifyLogin= async(req,res)=>{
    try {
        const email= req.body.email;
        const password= req.body.password
        const userData= await User.findOne({email:email})
        if (userData) {
            const passwordMatch= await bcrypt.compare(password,userData.password)
            
            if (passwordMatch) {
                if(userData.isAdmin ===0){
                    res.render("adminLogin",{message:"email and password is incorrect 3"})
                }else{
                    req.session.user_id = userData._id
                    res.redirect('/admin/home')
                    //console.log("check here");
                }
            } else { 
                res.render("adminLogin",{message:"email and password is incorrect 2"})
            }
            
        }else{
            res.render("adminLogin",{message:"email and password is incorrect 1"})
        }
    } catch (error) {
        console.log();
    }
}


const loadDashboard = async(req,res)=>{
    try {
        const useData =await User.findById({_id:req.session.user_id})
        res.render('adminhome',{ admin:useData})
    } catch (error) {
        console.log(error.message);
    }
}

const logout =async (req,res)=>{
    try {
        req.session.destroy()
        res.redirect("/admin")
        
    } catch (error) {
        console.log(error.message);
    }
}
const adminDashboard= async(req,res)=>{
    try {
        var search=""
        if (req.query.search) {
            search=req.query.search
        }

        const userDatas=await User.find({
            isAdmin:0,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}}
            ]
        })
        res.render('dashboard',{user:userDatas})
    } catch (error) {
        console.log(error.message);
    }
}

const newUserLoad= async(req,res)=>{
    try {
        res.render("new-user")
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async (password)=>{
    try {
        
        const passwordHash= await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message);
    }
}

const addUser =async (req,res)=>{
    try {
        const name=req.body.name
        const email=req.body.email
        const mobile=req.body.mno
        const image=req.file.filename
        const password=req.body.password
      

        const spassword = await securePassword(password)

        const nameRegex = /^[a-zA-Z]+$/;
        
        // Validation: Check if the email or mobile is already in use
        const existingUserByEmail = await User.findOne({ email: email });
        const existingUserBymobile = await User.findOne({ mobile: mobile });

        if (existingUserByEmail) {
            return res.render("new-user", { message: "Email is already in use!" });
        }

        if (existingUserBymobile) {
            return res.render("new-user", { message: "mobile is already in use!"})}

        if (!nameRegex.test(req.body.name)) {
                return res.render("new-user", { message: "Invalid name format!" });
            }

        const user =new User({
            name:name,
            email:email,
            mobile:mobile,
            image:image,
            password:spassword,
            isAdmin:0
        })
        const userData= await user.save()
        if (userData) {
            res.redirect('/admin/dashboard')
        } else {
            res.render('new-user',{message:'something went wrong'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const editUserLoad= async(req,res)=>{
    try {
        const id= req.query.id
        const userData= await User.findById({_id:id})         
               
                if (userData) {
            res.render('editUser',{user:userData})
        } else {
            res.redirect('/admin/dashboard')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const updateUser=async(req,res)=>{
    try {
        
        const userDatas= await User.findById({_id:req.body.id})
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(req.body.name)) {
            return res.render('editUser', { user:userDatas,message: "Invalid name format!" });
        }



        /* 
        
        // Validation: Check if the email or mobile is already in use
        const existingUserByEmail = await User.findOne({ email:req.body.email });
        const existingUserBymobile = await User.findOne({ mobile:req.body.mobile });

        if (existingUserByEmail) {
            return res.render("editUser", { message: "Email is already in use!" });
        }

        if (existingUserBymobile) {
            return res.render("editUser", { message: "mobile is already in use!"})}


        //console.log(req.body.name); */
        const userData=await User.findByIdAndUpdate({_id:req.body.id},{        
            $set:{
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mno
            }
        })
        
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}
const deleteUser= async(req,res)=>{
    try {
        const id=req.query.id;
        await User.deleteOne({_id:id})
        res.redirect("/admin/dashboard")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadAdminLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUser,
    deleteUser
}