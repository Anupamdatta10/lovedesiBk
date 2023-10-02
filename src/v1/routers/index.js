const express = require('express');
const router = express.Router();

const userRouter = require('./users/userRouter');
const storeDetailsRouter = require('./stores/storeDetails');
const catagoryRouter = require('./catagory/catagoryRouter');
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
router.use('/store_details', storeDetailsRouter);
router.use('/catagory', catagoryRouter);


module.exports = router;