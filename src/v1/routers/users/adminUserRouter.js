const express = require('express');
const router = express.Router();
const {
    createUser,
    listUser,
    updateUser,
    deleteUser,
    listUserById
} = require('../../controllers/users/adminUserController');

router.post('/users', createUser);
router.get(['/users/list', '/users/list/:id'], listUser);
router.get(['/users', '/users/:id'], listUserById);
router.patch('/users/:id', updateUser);
router.delete('/users', deleteUser);

module.exports = router;