const Hall = require('../models/Hall');

// @desc    Get all halls
// @route   GET /api/halls
// @access  Public
const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find();
    // Return standard response structure
    res.status(200).json({ success: true, data: halls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new hall
// @route   POST /api/halls
// @access  Private
const createHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json({ success: true, data: hall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update hall
// @route   PUT /api/halls/:id
// @access  Private
const updateHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedHall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete hall
// @route   DELETE /api/halls/:id
// @access  Private
const deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    await Hall.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHalls,
  createHall,
  updateHall,
  deleteHall,
};