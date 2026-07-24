const mongoose = require('mongoose');
const Seat = require('../../models/Seat'); 

describe('Seat Model Unit Test', () => {
  
  // Test 1: Should fail if Row is missing
  test('Should validate that Row is required', async () => {
    const seat = new Seat({ 
      number: 1, 
      price: 1000,
      showtimeId: new mongoose.Types.ObjectId() // ✅ Fake ID added
    }); 
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.row).toBeDefined(); 
  });

  // Test 2: Should fail if Number is missing
  test('Should validate that Seat Number is required', async () => {
    const seat = new Seat({ 
      row: 'A', 
      price: 1000,
      showtimeId: new mongoose.Types.ObjectId() // ✅ Fake ID added
    }); 
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.number).toBeDefined();
  });

  // Test 3: Should PASS if everything is correct
  test('Should accept a valid seat', async () => {
    const seat = new Seat({ 
      row: 'A', 
      number: 1, 
      price: 1500, 
      status: 'available', // ✅ This is now allowed in the Model
      showtimeId: new mongoose.Types.ObjectId() // ✅ Fake ID makes it valid
    });
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeUndefined(); // Success!
  });
});