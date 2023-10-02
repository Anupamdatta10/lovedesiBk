const express = require('express');
const router = express.Router();


const { cuponsCreateController, cuponsListController, cuponsUpdateController, cuponsDeleteController } = require('../../controllers/cupons/cuponsController');

router.post(['/'], cuponsCreateController);
router.get(['/', '/:id'], cuponsListController)
router.patch(['/', '/:id'], cuponsUpdateController)
router.delete(['/'], cuponsDeleteController)

module.exports = router;