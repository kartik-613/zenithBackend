const express = require('express');
const { getDoctorDashboard, getDoctorAppointments, getDoctorPatients, getDoctorPayments, getDoctorProfile, updateDoctorProfile, getDoctorNotifications, markDoctorNotificationRead, deleteDoctorNotification, markAllDoctorNotificationsRead, getPatientHistory, createPrescription, createAppointment } = require('../controllers/doctorController');
const doctorRoutes = express.Router();

doctorRoutes.get('/dashboard/:id', getDoctorDashboard);
doctorRoutes.get('/appointments/:id', getDoctorAppointments);
doctorRoutes.get('/patients/:id', getDoctorPatients);
doctorRoutes.get('/payments/:id', getDoctorPayments);
doctorRoutes.get('/profile/:id', getDoctorProfile);
doctorRoutes.put('/profile/:id', updateDoctorProfile);
doctorRoutes.get('/notifications/:id', getDoctorNotifications);
doctorRoutes.put('/notifications/:id/read', markDoctorNotificationRead);
doctorRoutes.delete('/notifications/:id', deleteDoctorNotification);
doctorRoutes.put('/notifications/user/:id/read-all', markAllDoctorNotificationsRead);

// New Routes
doctorRoutes.get('/patient/:id/history', getPatientHistory);
doctorRoutes.post('/prescription', createPrescription);
doctorRoutes.post('/appointments', createAppointment);

module.exports = doctorRoutes;