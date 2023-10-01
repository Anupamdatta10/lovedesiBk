const express = require('express');
const router = express.Router();


const { storeDetailsCreateController, storeDetailsListController, storeDetailsUpdateController, storeDetailsDeleteController } = require('../../controllers/stores/storeDetailsController');

router.post(['/'], storeDetailsCreateController);
router.get(['/', '/:id'], storeDetailsListController)
router.patch(['/', '/:id'], storeDetailsUpdateController)
router.delete(['/'], storeDetailsDeleteController)

module.exports = router;