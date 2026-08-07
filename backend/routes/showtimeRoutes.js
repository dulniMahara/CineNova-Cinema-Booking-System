const express = require('express');
const router = express.Router();
const { 
  addShowtime, 
  getAllShowtimes, 
  deleteShowtime,
  updateShowtime,   
  getShowtimeById,  
  getShowtimesByMovie
} = require('../controllers/showtimeController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.get('/movie/:movieId', getShowtimesByMovie);

router.route('/')
  .post(protect, isAdmin, addShowtime)
  .get(getAllShowtimes);

router.route('/:id')
  .get(getShowtimeById)   
  .put(protect, isAdmin, updateShowtime)   
  .delete(protect, isAdmin, deleteShowtime);

module.exports = router;