const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, forceLogoutUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.put('/:id/role', protect, admin, updateUserRole);
router.post('/:id/logout', protect, admin, forceLogoutUser);

module.exports = router;
