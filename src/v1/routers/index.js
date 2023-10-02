const express = require('express');
const router = express.Router();

const userRouter = require('./users/userRouter');
const userDetailsRouter = require('./users/userDetailsRouter');
const storeDetailsRouter = require('./stores/storeDetails');
const { authenticate } = require('../controllers/middlewares/middlewareController');

const adminUserRouter = require('./users/adminUserRouter');

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Session');
    res.header('Access-Control-Allow-Headers', 'Authorization');
    res.header('Access-Control-Allow-Headers', 'Accesstoken');
    res.header('Access-Control-Allow-Headers', 'language');
    res.header('Access-Control-Allow-Headers', 'qlanguage');
    next();
});

router.use('/users', userRouter);
router.use('/admin', authenticate, adminUserRouter);
router.use('/users_details', userDetailsRouter);
router.use('/store', authenticate, storeDetailsRouter);


module.exports = router;