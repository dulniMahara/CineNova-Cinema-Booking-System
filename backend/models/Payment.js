const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: { // We link the payment to a specific booking
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    cardLast4: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Completed'
    }
}, {
    timestamps: true // <--- THIS IS THE MAGIC FIX. It creates 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Payment', paymentSchema);