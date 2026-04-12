import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import models
import User from '../src/models/core/user.model.js';
import Kid from '../src/models/core/kid.model.js';
import Driver from '../src/models/core/driver.model.js';

// Import services
import * as userService from '../src/services/user.service.js';
import * as kidService from '../src/services/kid.service.js';
import * as driverService from '../src/services/driver.service.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kidgo');
    console.log('MongoDB connected for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runTests = async () => {
  await connectDB();

  let testUserId = null;
  let testKidId = null;
  let testDriverId = null;

  try {
    console.log('--- STARTING CRUD TESTS ---');

    console.log('\n[1] Clean up old test data');
    await User.deleteMany({ email: 'testcrud@example.com' });
    await User.deleteMany({ email: 'testdriver@example.com' });
    await Kid.deleteMany({ fullName: 'Test Kid' });
    await Driver.deleteMany({ licenseNumber: 'LICENSE_TEST_123' });

    console.log('\n[2] Testing User Creation (using model directly as auth service handles this in reality)');
    const parentUser = new User({
      phone: '0999999999',
      email: 'testcrud@example.com',
      password: 'password123',
      fullName: 'Test Parent',
      role: 'parent'
    });
    await parentUser.save();
    testUserId = parentUser._id;
    console.log('Created User ID:', testUserId);

    console.log('\n[3] Testing getUserById (User Service)');
    const fetchedUser = await userService.getUserById(testUserId);
    console.log('Fetched User Name:', fetchedUser.fullName);

    console.log('\n[4] Testing updateUser (User Service)');
    const updatedUser = await userService.updateUser(testUserId, { fullName: 'Test Parent Updated' });
    console.log('Updated User Name:', updatedUser.fullName);

    console.log('\n[5] Testing createKid (Kid Service)');
    const createdKid = await kidService.createKid({
      parentId: testUserId,
      fullName: 'Test Kid',
      dateOfBirth: new Date('2015-05-05')
    });
    testKidId = createdKid._id;
    console.log('Created Kid ID:', testKidId);

    console.log('\n[6] Testing getKidById with Populate (Kid Service)');
    const fetchedKid = await kidService.getKidById(testKidId);
    console.log(`Fetched Kid: ${fetchedKid.fullName}, Parent: ${fetchedKid.parentId.fullName}`);

    console.log('\n[7] Testing updateKid (Kid Service)');
    const updatedKid = await kidService.updateKid(testKidId, { school: 'Primary School 1' });
    console.log('Updated Kid School:', updatedKid.school);

    console.log('\n[8] Testing createDriver (Driver Service)');
    const driverUser = new User({
      phone: '0888888888',
      email: 'testdriver@example.com',
      password: 'password123',
      fullName: 'Test Driver User',
      role: 'parent' // Service should upgrade this to driver
    });
    await driverUser.save();
    
    const createdDriver = await driverService.createDriver({
      user: driverUser._id,
      licenseNumber: 'LICENSE_TEST_123'
    });
    testDriverId = createdDriver._id;
    console.log('Created Driver ID:', testDriverId);

    console.log('\n[9] Checking if User Driver ID is populated');
    const updatedDriverUser = await userService.getUserById(driverUser._id);
    console.log('Driver User ID ref in User role:', updatedDriverUser.role, '- Ref ID:', updatedDriverUser.driverId?._id);

    console.log('\n[10] Testing getDriverById with Populate (Driver Service)');
    const fetchedDriver = await driverService.getDriverById(testDriverId);
    console.log(`Fetched Driver License: ${fetchedDriver.licenseNumber}, User Email: ${fetchedDriver.user.email}`);

    console.log('\n[11] Testing updateDriver (Driver Service)');
    const updatedDriver = await driverService.updateDriver(testDriverId, { rating: 4.5 });
    console.log('Updated Driver Rating:', updatedDriver.rating);

    console.log('\n[12] Testing Soft Deletes');
    await kidService.softDeleteKid(testKidId);
    console.log('Kid soft deleted');
    await driverService.softDeleteDriver(testDriverId);
    console.log('Driver soft deleted');
    await userService.softDeleteUser(testUserId);
    console.log('User soft deleted');
    
    // Test get after soft delete
    try {
      await kidService.getKidById(testKidId);
    } catch(e) {
      console.log('Expected error on inactive Kid:', e.message);
    }

    console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');

  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    console.error(error);
  } finally {
    // Clean up test data again just in case (optional, we might want to keep it to see in DB, but better clean up)
    console.log('\n[13] Final Clean up');
    await User.deleteMany({ email: 'testcrud@example.com' });
    await User.deleteMany({ email: 'testdriver@example.com' });
    await Kid.deleteMany({ fullName: 'Test Kid' });
    await Driver.deleteMany({ licenseNumber: 'LICENSE_TEST_123' });

    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

runTests();
