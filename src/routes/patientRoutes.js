const express = require('express');
const { getPatientDashboard, getPatientAppointments, bookAppointment, getPatientPayments, getPatientProfile, updatePatientProfile, getPatientNotifications, markNotificationRead, deleteNotification, markAllNotificationsRead, getPatientVitals, addPatientVital, getPatientPrescriptions, getPatientDocuments, uploadDocument, registerPatient, rescheduleAppointment } = require('../controllers/patientController');
const patientRoutes = express.Router();

patientRoutes.get('/dashboard/:id', getPatientDashboard);
patientRoutes.get('/appointments/:id', getPatientAppointments);
patientRoutes.post('/book', bookAppointment);
patientRoutes.get('/payments/:id', getPatientPayments);
patientRoutes.get('/profile/:id', getPatientProfile);
patientRoutes.put('/profile/:id', updatePatientProfile);
patientRoutes.get('/notifications/:id', getPatientNotifications);
patientRoutes.put('/notifications/:id/read', markNotificationRead);
patientRoutes.delete('/notifications/:id', deleteNotification);
patientRoutes.put('/notifications/user/:id/read-all', markAllNotificationsRead);
patientRoutes.get('/vitals/:id', getPatientVitals);
patientRoutes.post('/vitals/:id', addPatientVital);

// New Routes
patientRoutes.get('/prescriptions/:id', getPatientPrescriptions);
patientRoutes.get('/documents/:id', getPatientDocuments);
patientRoutes.post('/documents/:id', uploadDocument);
patientRoutes.post('/register', registerPatient);
patientRoutes.put('/reschedule/:id', rescheduleAppointment);
patientRoutes.get('/test', (req, res) => res.json({ message: 'Patient routes are working' }));

module.exports = patientRoutes;