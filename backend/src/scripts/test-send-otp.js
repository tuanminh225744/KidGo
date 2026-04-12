// scripts/test-send-otp.js
import dotenv from "dotenv";
dotenv.config();
import { sendOTP } from "../services/authentication.service.js";

const email = process.argv[2];

if (!email) {
    console.log("❌ Vui lòng nhập email");
    console.log("👉 node scripts/test-send-otp.js your_email@gmail.com");
    process.exit(1);
}

(async () => {
    try {
        const result = await sendOTP(email);
        console.log("✅ Send OTP success:");
        console.log(result);
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    } finally {
        process.exit(0);
    }
})();