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

router.get('/movie/:movieId', getShowtimesByMovie);

router.route('/')
  .post(addShowtime)
  .get(getAllShowtimes);

router.route('/:id')
  .get(getShowtimeById)   
  .put(updateShowtime)   
  .delete(deleteShowtime);

module.exports = router;