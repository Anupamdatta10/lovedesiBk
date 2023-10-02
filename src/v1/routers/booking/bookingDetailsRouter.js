const express = require('express');
const router = express.Router();


const { bookingDetailsCreateController, bookingDetailsListController, bookingDetailsUpdateController, bookingDetailsDeleteController } = require('../../controllers/booking/bookingDetailsController');

router.post(['/'], bookingDetailsCreateController);
router.get(['/', '/:id'], bookingDetailsListController)
router.patch(['/', '/:id'], bookingDetailsUpdateController)
router.delete(['/'], bookingDetailsDeleteController)

module.exports = router;