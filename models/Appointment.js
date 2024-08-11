const mongoose = require("mongoose");

// Appointment schema
const AppointmentSchema = new mongoose.Schema({
  date: { type: Date },
  time: { type: String },
  isTimeSlotAvailable: { type: Boolean, default: true },
  testType: { type: String },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
