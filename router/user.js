const express = require("express");
const router = express.Router();
const app = express();
const session = require("express-session");
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({ extended: true });

const User = require("../models/mongocar");

app.use(
  session({
    secret: "mykey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(express.static("public"));
app.set("view engine", "ejs");
// router.get('/signuphere', async (req, res) => {
//     res.render('usersignup');
// });
// router.post('/signup', urlencoder, async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const existuser = await User.findOne({ email });
//         if (existuser) {
//             // return res.send({message:"user already exist this email "})
//            return res.send("user already exist");

//         }
//         const newuser = new User({
//             name, email, password, role: "user"
//         })
//         const savedata = await newuser.save();
//         res.send("registered successfully");
//     }
//     catch (err) {
//         console.log(err.message);
//     }

// });

router.post("/signup", urlencoder, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existuser = await User.findOne({ email });

    if (existuser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const newuser = new User({ name, email, password, role: "user" });
    await newuser.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/login", function (req, res) {
  res.render("userlogin");
});
router.post("/Login", urlencoder, async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (!existing) {
    return res
        .status(400)
        .json({ message: "no record  found" });
  }
  if (existing.password === password) {
    req.session.userEmail = { name: existing.name, email: existing.email };
    return res
    .status(201)
    .json({ message: "login succesfull", user: { name: existing.name, email: existing.email } });
   
    // res.redirect(`/user/userdash`);
   
  } else {
    return res
    .status(400)
    .json({ message: "incorrect password" });
  }
});
router.get("/userdash", function (req, res) {
  if (!req.session.userEmail) {
    res.render("userlogin");
  } else {
    const { name, email } = req.session.userEmail;
    res.render("userdashboard", { name, email });
  }
});


module.exports = router;
