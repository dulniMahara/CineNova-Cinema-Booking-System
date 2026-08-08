const express = require('express');
const router = express.Router();
const { 
  getHalls, 
  createHall, 
  updateHall, 
  deleteHall 
} = require('../controllers/hallController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', getHalls);
router.post('/', protect, isAdmin, createHall);
router.put('/:id', protect, isAdmin, updateHall);
router.delete('/:id', protect, isAdmin, deleteHall);

module.exports = router;