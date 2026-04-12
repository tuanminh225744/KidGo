// scripts/test-verify-otp.js
import dotenv from "dotenv";
dotenv.config();

import { verifyOTP } from "../services/otp.service.js";

const email = process.argv[2];
const otp = process.argv[3];

if (!email || !otp) {
    console.log("❌ Thiếu email hoặc OTP");
    console.log("👉 node scripts/test-verify-otp.js your_email@gmail.com 123456");
    process.exit(1);
}

(async () => {
    try {
        const result = await verifyOTP(email, otp);
        console.log("✅ Verify result:");
        console.log(result);
    } catch (error) {
        console.error("❌ Verify failed:", error.message);
    } finally {
        process.exit(0);
    }
})();