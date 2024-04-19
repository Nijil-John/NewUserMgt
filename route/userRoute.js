const express = require("express");
const userRoute = express(); // Create an instance of express Router
const bodyParser= require("body-parser")

const session =require("express-session")
const auth= require("../middleware/auth")

const config= require("../config/config")
userRoute.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true }))

userRoute.use(bodyParser.json());//body parsing middleware for JSON
userRoute.use(bodyParser.urlencoded({extended:true}))//body parsing middleware for URL-encoded data

// Set view engine and views directory
userRoute.set('view engine', 'ejs');
userRoute.set("views", "./views/users");
 
const multer =require("multer")
const path = require("path")

userRoute.use(express.static("public"))

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImage'))
    },
    filename:function(req,file,cb) {
        const name=Date.now()+"-"+file.originalname;
        cb(null,name)
    }
})

const upload=multer({storage:storage})

// Import userController
const userController = require("../controller/userController");

// Define routes
userRoute.get("/register",auth.isLogout, userController.loadRegister); // Route to load the registration form
userRoute.post("/register",upload.single('image'),userController.insertUser); // Route to handle user registration form submission
userRoute.get('/',auth.isLogout,userController.loginLoad)// load the login page
userRoute.get('/login',auth.isLogout,userController.loginLoad)
userRoute.post("/login",userController.verifylogin)
userRoute.get("/home",auth.isLogin,userController.loadHome)
userRoute.get("/logout",auth.isLogin,userController.userLogout)


module.exports = userRoute; // Export the router
