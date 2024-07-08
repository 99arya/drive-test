// Imports
const express = require("express");
const path = require("path");
const ejs = require("ejs");

const User = require("./models/User");

const mongoose = require("mongoose");

const uri =
  "mongodb+srv://99aryaa:qwe123@conestoga.erpyj64.mongodb.net/?retryWrites=true&w=majority&appName=Conestoga";

// Config
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// DB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Get Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/class-g", (req, res) => {
  res.render("class-g");
});

app.get("/class-g2", (req, res) => {
  res.render("class-g2");
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

  const newUser = new User({
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
  });

  try {
    await newUser.save();
    res.status(200).send("User saved successfully");
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

// Listen
app.listen(3000, () => {
  console.log("Hello! App listening on port 3000");
});
