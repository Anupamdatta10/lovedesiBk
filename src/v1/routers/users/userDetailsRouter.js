const express = require('express');
const router = express.Router();


const { userDetailsCreateController, userDetailsListController, userDetailsUpdateController, userDetailsDeleteController } = require('../../controllers/users/userDetailsController');
router.post(['/'], userDetailsCreateController);
router.get(['/', '/:id'], userDetailsListController)
router.patch(['/', '/:id'], userDetailsUpdateController)
router.delete(['/'], userDetailsDeleteController)

module.exports = router;