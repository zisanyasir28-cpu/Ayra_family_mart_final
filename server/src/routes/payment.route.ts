import { Router } from 'express';
import { handleIpn, handleSuccess, handleFail, handleCancel } from '../controllers/payment.controller';

const router = Router();

// All four endpoints receive POST from SSLCommerz (browser redirect or server IPN).
// No auth middleware — these are called by SSLCommerz, not by logged-in users.

router.post('/ipn',     handleIpn);
router.post('/success', handleSuccess);
router.post('/fail',    handleFail);
router.post('/cancel',  handleCancel);

export default router;
