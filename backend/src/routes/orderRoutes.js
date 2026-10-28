import { Router } from 'express';
import { getUserOrders, getOrderByReference, getOrderInvoice } from '../controllers/orderController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, getUserOrders);
router.get('/:reference/invoice.pdf', authenticate, getOrderInvoice);
router.get('/:reference', authenticate, getOrderByReference);

export default router;
