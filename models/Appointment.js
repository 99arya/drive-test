const mongoose = require("mongoose");

// Appointment schema
const AppointmentSchema = new mongoose.Schema({
  date: { type: String },
  time: { type: String },
  dateTime: { type: Date },
  isTimeSlotAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
