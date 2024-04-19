const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/usr_Mgt_Stm");

const express = require("express");
const app = express();
const nocache = require("nocache");

app.use(nocache());

//for userRoutes
const userRoute = require("./route/userRoute");
app.use("/", userRoute);

//for adminRoutes
const adminRoute = require("./route/adminRoute");
app.use("/admin", adminRoute);

app.listen(4000, () => {
  console.log("server is running");
});
