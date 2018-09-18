const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const storageRoutes = require('./storageRoutes');
const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.use('/auth', authRoutes);
router.use('/storage', storageRoutes);
router.use('/users', userRoutes);

module.exports = router;
