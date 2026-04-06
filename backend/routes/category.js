const express = require('express');
const router = express.Router();
const { getCategories, createCategory, getCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory);
router.delete('/:id', protect, admin, deleteCategory); // Add auth middleware later for admin

module.exports = router;
