const express = require("express");
const router1 = express.Router();
const path = require("path");
const multer = require("multer");
const app = express();
const session = require("express-session");
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({ extended: true });
const admin1 = require("../models/admindata");
const brand = require("../models/brand");
const booking = require("../models/booking");
const User = require("../models/mongocar"); //only for  reg users count //
const vehicles = require("../models/vehicle");
// const router = require("./user");

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
router1.get("/adminlogin", function (req, res) {
  res.render("adminlogin");
});
router1.post("/adminlogin", urlencoder, async (req, res) => {
  const { name, password } = req.body;
  const adname = await admin1.findOne({ name });
  if (!adname) {
    return res.send("no record found");
  }
  if (adname.password === password) {
    req.session.adminname = { name: adname.name, email: adname.email };
    res.redirect(`/admin/admindash`);
  } else {
    return res.send("incorrect");
  }
});
router1.get("/admindash", function (req, res) {
  if (!req.session.adminname) {
    res.render("adminlogin");
  } else {
    const { name, email } = req.session.adminname;
    res.render("admindash", { name, email, message: "" });
  }
});
//session admin logout//
router1.get("/signout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send("cannot login please try again");
    } else {
      res.render("adminlogin");
    }
  });
});
router1.post("/change-password", urlencoder, async (req, res) => {
  const { pass, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    // res.send("password does not match");
    res.render("admindash", { message: "password does not match" });
  }

  try {
    const admin2 = await admin1.findOne({ password: pass });
    if (!admin2) {
      res.render("admindash", { message: "current password is wrong" });
      // res.send("current password is wrong");
    } else {
      admin2.password = newPassword;
      await admin2.save();
      // res.send('password update successfully');
      res.render("admindash", { message: "password update successfully" });
    }
  } catch (err) {
    console.log(err.message);
  }
});
router1.get("/brandcreate", function (req, res) {
  res.render("createbrand", { success: null });
});

router1.post("/submit-brand", urlencoder, async (req, res) => {
  try {
    const { brand_name } = req.body;
    const createbrand = new brand({ brand_name });
    const savebrand = await createbrand.save();
    res.render("createbrand", { success: "brand created successfully" });
  } catch (err) {
    console.log(err.message);
  }
});
router1.get("/manage", async (req, res) => {
  const data = await brand.find();

  res.render("managetable", { data });
});
router1.get("/delete/:id", async (req, res) => {
  await brand.findByIdAndDelete(req.params.id);
  res.redirect(`/admin/manage`);
});
router1.get("/edit1/:id", async (req, res) => {
  const brands = await brand.findById(req.params.id);
  res.render("editbrand", { brands, message: "" });
});
router1.post("/edit/:id", urlencoder, async (req, res) => {
  const { brand_name } = req.body;
  await brand.findByIdAndUpdate(req.params.id, { brand_name });
  res.redirect(`/admin/manage`);
});
// count documents//
router1.get("/homedash", async (req, res) => {
  const count = await User.countDocuments();
  const count1 = await brand.countDocuments();

  res.render("dashhome", { count, count1 });
});
//vehicle//
router1.get("/vehiclepost", async (req, res) => {
  const data = await brand.find();
  res.render("vehiclepost", { data, message: "" });
});
//api frontend//
router1.get("/apivehiclepost", async (req, res) => {
  const data = await brand.find();
  res.json(data);
});

//multer upload image//
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const filetype = /jpg|jpeg|png|gif/;
    const extname = filetype.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetype.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("only images are allowed"));
    }
  },
});
router1.post(
  "/vehiclep",
  urlencoder,
  upload.array("image", 10),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      const { title, car, over, price, fuel, carmodel, seating } = req.body;
      const imagePATH = req.files.map((file) => `/uploads/${file.filename}`);
      const newvehicle = new vehicles({
        title,
        car,
        over,
        price,
        fuel,
        carmodel,
        seating,
        image: imagePATH,
      });
      const savedata = await newvehicle.save();
      const data = await brand.find();
      res.render("vehiclepost", { data, message: "file upload successfully" });
    } catch (err) {
      console.log(err.message);
    }
  }
);
//table vehicle//
// router1.get('/managevehicl',async(req,res)=>{
//   const data=await vehicles.find();
//   res.render('vehicletable',{data});

// })

//API FRONTEND//
router1.get("/apimanagevehicl", async (req, res) => {
  try {
    let query = {}; // Default: fetch all vehicles

    if (req.query.search) {
      query.title = { $regex: new RegExp(req.query.search, "i") }; // Case-insensitive search
    }

    const data = await vehicles.find(query); // Fetch vehicles from MongoDB
    // res.render('vehicletable', { data, searchQuery: req.query.search || "" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
});

router1.get("/managevehicl", async (req, res) => {
  try {
    let query = {}; // Default: fetch all vehicles

    if (req.query.search) {
      query.title = { $regex: new RegExp(req.query.search, "i") }; // Case-insensitive search
    }

    const data = await vehicles.find(query); // Fetch vehicles from MongoDB
    res.render("vehicletable", { data, searchQuery: req.query.search || "" });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
});

//delete  vehicle//
router1.get("/delete1/:id", async (req, res) => {
  await vehicles.findByIdAndDelete(req.params.id);

  res.redirect(`/admin/managevehicl`);
});
router1.get("/editvehicle1/:id", async (req, res) => {
  const vehicle = await vehicles.findById(req.params.id);
  const brands = await brand.find();
  res.render("vehicleedit", { vehicle, brands });
});
router1.post("/editvehicle1/:id", urlencoder, async (req, res) => {
  console.log("Vehicle ID:", req.params.id);
  const { title, car, over, price, fuel, carmodel, seating } = req.body;
  console.log(req.body);
  await vehicles.findByIdAndUpdate(req.params.id, {
    title,
    car,
    over,
    price,
    fuel,
    carmodel,
    seating,
  });
  res.redirect(`/admin/managevehicl`);
});
//edit image//
// Route to show image edit form for a specific image
router1.get("/imgchange/:vehicleId/:imageIndex", async (req, res) => {
  const { vehicleId, imageIndex } = req.params; // Get vehicle ID and image index from URL
  const vehicle = await vehicles.findById(vehicleId); // Find the vehicle by ID

  if (!vehicle) {
    return res.send("Vehicle not found");
  }

  const image = vehicle.image[imageIndex]; // Get the specific image based on index
  if (!image) {
    return res.send("Image not found");
  }

  // Render the image edit form, passing vehicle, imageIndex, and the current image
  res.render("imageedit", { vehicleId, imageIndex, currentImage: image });
});

// Route to upload a new image and replace the specific image in the array
router1.post(
  "/upload-image/:vehicleId/:imageIndex",
  upload.single("file"),
  urlencoder,
  async (req, res) => {
    const { vehicleId, imageIndex } = req.params;
    const file = req.file;
    const vehicle = await vehicles.findById(vehicleId);
    if (!vehicle) {
      res.send("vehicle not found");
    }
    if (!vehicle.image[imageIndex]) {
      return res.send("image not found specified index");
    }
    const newimagepath = `/uploads/${file.filename}`;
    vehicle.image[imageIndex] = newimagepath;
    await vehicle.save();
    res.send("upload succesfully");
  }
);
//delete image//
router1.get("/deleteimg/:vehicleId/:imageIndex", async (req, res) => {
  const { vehicleId, imageIndex } = req.params;
  const vehicle = await vehicles.findById(vehicleId);
  vehicle.image.splice(imageIndex, 1);
  await vehicle.save();

  const brands = await brand.find();
  res.render("vehicleedit", { vehicle, brands });
});
//manage booking//
router1.post("/booking", urlencoder, async (req, res) => {
  const { from, to, vehicle, message, fname, images } = req.body;
  const newbooking = new booking({
    from,
    to,
    vehicle,
    message,
    fname,
    status: "Not Yet Confirmed", // Default status
    postingDate: new Date(),
    images,
  });
  await newbooking.save();
  res.json({ message: "record successfully" });
});

router1.get("/bookings", async (req, res) => {
  try {
    const bookings = await booking.find();
    res.render("booking", { bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});
router1.get("/apibookings", async (req, res) => {
  try {
    const bookings = await booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});
router1.post("/update-booking/:id", urlencoder, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await booking.findByIdAndUpdate(
      req.params.id,
      { status }, 
      { new: true }
    );
    // res.json({ message: "Booking updated successfully", updatedBooking });
    res.redirect("/admin/bookings");
  } catch (error) {
    res.status(500).json({ message: "Error updating booking" });
  }
});

module.exports = router1;
