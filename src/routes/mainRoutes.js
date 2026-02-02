const express = require("express");
const patientRoutes = require("./patientRoutes");
const doctorRoutes = require("./doctorRoutes");

const mainRoutes = express.Router();

mainRoutes.use("/patient", patientRoutes);
mainRoutes.use("/doctor", doctorRoutes);

module.exports = mainRoutes;
