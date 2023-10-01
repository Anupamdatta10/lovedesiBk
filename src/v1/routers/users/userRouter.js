const express = require('express');
const router = express.Router();
const {
    loginUser,
    globalSignOut,
    userChangePassword,
    userForcePasswordChange,
    forgotPassword,
    confirmForgotPassword,
    refreshToken,
    currentuser
} = require('../../controllers/users/userController');

const { authenticate } = require('../../controllers/middlewares/middlewareController');

router.post('/login', loginUser);
router.delete('/signout', globalSignOut);
router.patch('/changepassword', userChangePassword);
router.post('/userforcepasswordchange', userForcePasswordChange);
router.put('/forgotpassword', forgotPassword);
router.put('/confirmforgotpassword', confirmForgotPassword);
router.patch('/refreshtoken', refreshToken);
router.get('/currentuser', authenticate, currentuser);

module.exports = router;