const express = require('express');
const router = express.Router();


const { catagoryCreateController, catagoryListController, catagoryUpdateController, catagoryDeleteController } = require('../../controllers/catagory/catagoryController');

router.post(['/'], catagoryCreateController);
router.get(['/', '/:id'], catagoryListController)
router.patch(['/', '/:id'], catagoryUpdateController)
router.delete(['/'], catagoryDeleteController)

module.exports = router;