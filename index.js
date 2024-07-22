// Imports
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

// Models
const User = require("./models/User");
const mongoose = require("mongoose");

const uri =
  "mongodb+srv://99aryaa:qwe123@conestoga.erpyj64.mongodb.net/?retryWrites=true&w=majority&appName=Conestoga";

// Config
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: true }));

// DB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
const authenticate = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } else {
    res.redirect("/login");
  }
};

// Get Routes
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// Protected routes
app.get("/class-g2", authenticate, (req, res) => {
  console.log("req.user", req.user);
  if (req.user.userType === "Driver") {
    res.render("class-g2", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.get("/class-g", authenticate, (req, res) => {
  if (req.user.userType === "Driver") {
    res.render("class-g", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.get("/get-user/:licenseNumber", async (req, res) => {
  const { licenseNumber } = req.params;

  try {
    const user = await User.findOne({ licenseNumber });

    if (!user) {
      res.status(404).send("No User Found");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).send("Error fetching user: " + error.message);
  }
});

app.post("/save-user", async (req, res) => {
  const { firstName, lastName, licenseNumber, age, dob, carMake, carModel, carYear, plateNumber } =
    req.body;

  const updatedUser = {
    firstName,
    lastName,
    licenseNumber,
    age,
    dob,
    car_details: {
      make: carMake,
      model: carModel,
      year: carYear,
      plateNumber,
    },
  };

  console.log("req.user@update", req.user);
  try {
    let foundUser = await User.findOneAndUpdate({ _id: req.session.userId }, updatedUser);
    res.status(200).json({ message: "User saved successfully", user: foundUser });
  } catch (error) {
    res.status(500).send("Error saving user: " + error.message);
  }
});

app.post("/update-car", async (req, res) => {
  const { licenseNumber, make, model, year, plateNumber } = req.body;

  try {
    const user = await User.findOne({ licenseNumber });

    if (!user) {
      res.status(404).send("No User Found");
    } else {
      user.car_details = {
        make,
        model,
        year,
        plateNumber,
      };

      await user.save();
      res.status(200).send("Car details updated successfully");
    }
  } catch (error) {
    res.status(500).send("Error updating car details: " + error.message);
  }
});

//A-3

// Sign up
app.post("/signup", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    let encryptedPassword = await bcrypt.hash(password, 10).then(function (hash) {
      return hash;
    });

    const user = new User({ username, password: encryptedPassword, userType });
    await user.save();
    res.status(201).send("User created.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send("Invalid username or password.");
    }
    req.session.userId = user._id;
    res.send("Login successful.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Listen
app.listen(3000, () => {
  console.log("Hello! App listening on port 3000");
});
