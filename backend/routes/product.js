const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.array('images', 5), protect, admin, createProduct);
router.put('/:id', upload.array('images', 5), protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
