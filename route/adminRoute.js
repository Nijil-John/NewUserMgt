const express = require("express");
const adminRoute = express();
const admincontoller = require("../controller/adminContoller");

const session = require("express-session");
const config = require("../config/config");
adminRoute.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json()); //body parsing middleware for JSON
adminRoute.use(bodyParser.urlencoded({ extended: true })); //body parsing middleware for URL-encoded data

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

const multer = require("multer");
const path = require("path");

adminRoute.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImage"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

const auth = require("../middleware/adminAuth");

adminRoute.get("/", auth.islogout, admincontoller.loadAdminLogin);

adminRoute.post("/", admincontoller.verifyLogin);
adminRoute.get("/home", auth.islogin, admincontoller.loadDashboard);
adminRoute.get("/logout", auth.islogin, admincontoller.logout);
adminRoute.get("/dashboard", auth.islogin, admincontoller.adminDashboard);

adminRoute.get("/new-user", auth.islogin, admincontoller.newUserLoad);
adminRoute.post("/new-user", upload.single("image"), admincontoller.addUser);
adminRoute.get("/edit-user", auth.islogin, admincontoller.editUserLoad);
adminRoute.post("/edit-user", admincontoller.updateUser);
adminRoute.get("/delete-user", admincontoller.deleteUser);

adminRoute.get("*", (req, res) => {
  res.redirect("/admin");
});

module.exports = adminRoute;
