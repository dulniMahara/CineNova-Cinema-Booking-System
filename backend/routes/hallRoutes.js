const express = require('express');
const router = express.Router();
const { 
  getHalls, 
  createHall, 
  updateHall, 
  deleteHall 
} = require('../controllers/hallController'); // Imports must match exports above

router.get('/', getHalls);
router.post('/', createHall);
router.put('/:id', updateHall);
router.delete('/:id', deleteHall);

module.exports = router;