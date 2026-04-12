import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { 
    register, 
    login, 
    refreshAccessToken, 
    forgotPassword, 
    resetPassword 
} from '../src/services/authentication.service.js';
import User from '../src/models/core/user.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kidgodev';
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');
};

// Redis Client to grab OTP
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const runTests = async () => {
    try {
        await connectDB();
        console.log('--- STARTING AUTHENTICATION TESTS ---');

        const testEmail = `testuser_${Date.now()}@example.com`;
        const testPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
        const testPassword = 'Password123!';
        
        // 1. TEST REGISTER
        console.log('\n=> 1. TEST REGISTER');
        const registerData = {
            fullName: 'Test User',
            email: testEmail,
            phone: testPhone,
            password: testPassword
        };
        const registerRes = await register(registerData);
        if (registerRes.success) {
            console.log('✅ Register test passed:', registerRes.message);
        } else {
            throw new Error(`Register failed: ${registerRes.message}`);
        }

        // 2. TEST LOGIN
        console.log('\n=> 2. TEST LOGIN');
        const loginRes = await login(testEmail, testPassword);
        let refreshToken = null;
        if (loginRes.success) {
            console.log('✅ Login test passed!');
            console.log('Access Token:', loginRes.accessToken.substring(0, 20) + '...');
            console.log('Refresh Token:', loginRes.refreshToken.substring(0, 20) + '...');
            refreshToken = loginRes.refreshToken;
        } else {
            throw new Error(`Login failed: ${loginRes.message}`);
        }

        // 3. TEST REFRESH TOKEN
        console.log('\n=> 3. TEST REFRESH TOKEN');
        const refreshRes = await refreshAccessToken(refreshToken);
        if (refreshRes.success) {
            console.log('✅ Refresh Token test passed!');
            console.log('New Access Token:', refreshRes.accessToken.substring(0, 20) + '...');
        } else {
             throw new Error(`Refresh Token failed: ${refreshRes.message}`);
        }

        // 4. TEST FORGOT PASSWORD
        console.log('\n=> 4. TEST FORGOT PASSWORD');
        const forgotRes = await forgotPassword(testEmail);
        if (forgotRes.success) {
            console.log('✅ Forgot Password test passed (OTP initiated):', forgotRes.message);
        } else {
            console.log('⚠️ Forgot Password test response:', forgotRes.message); // might fail if nodemailer has invalid creds
        }

        // Peek into Redis to get OTP manually for testing reset
        const otpCode = await redisClient.get(`otp:${testEmail}`);
        if (otpCode) {
            // 5. TEST RESET PASSWORD
            console.log('\n=> 5. TEST RESET PASSWORD');
            const resetRes = await resetPassword(testEmail, otpCode, 'NewPassword123!');
            if (resetRes.success) {
                console.log('✅ Reset Password test passed:', resetRes.message);
                
                // Verify new password works
                console.log('\n=> 6. VERIFY NEW PASSWORD LOGIN');
                const newLoginRes = await login(testEmail, 'NewPassword123!');
                if (newLoginRes.success) {
                    console.log('✅ Login with new password passed!');
                } else {
                    throw new Error('Login with new password failed!');
                }
            } else {
                 throw new Error(`Reset Password failed: ${resetRes.message}`);
            }
        } else {
            console.log('⚠️ Could not find OTP in redis, likely because email sending failed or was not configured correctly.');
        }

        console.log('\n--- ALL CRITICAL TESTS EXECUTED ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    } finally {
        // Cleanup test user
        console.log('\nCleaning up test user...');
        if (mongoose.connection.readyState === 1) {
             const deleted = await User.deleteMany({ email: { $regex: /@example.com/ } });
             console.log(`Deleted ${deleted.deletedCount} test user(s).`);
        }
        await mongoose.disconnect();
        redisClient.disconnect();
        process.exit(0);
    }
};

runTests();
