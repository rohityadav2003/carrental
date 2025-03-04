const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const router = require("./router/user");
const router1 = require("./router/admin");

app.use(bodyParser.json());


app.use(cors());

app.use("/uploads", express.static(uploadDir));
app.use('/backend/image', express.static(path.join(__dirname, "image")));
app.use(express.static("public"));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "mykey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

 mongoose.connect("mongodb+srv://mongodbdatabase:rohit2003@cluster0.ppf45.mongodb.net")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/user", router);
app.use("/admin", router1);

app.get("/", function (req, res) {
  res.render("index"); 
});

app.listen(2000, () => {
  console.log("server running on port 1800");
});
