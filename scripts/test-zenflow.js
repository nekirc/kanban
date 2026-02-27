const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting ZenFlow core verification...");

  // 1. Test Password Hashing
  const pass = "test-password";
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(pass, salt);
  const isValid = await bcrypt.compare(pass, hashed);
  console.log(`✅ Password hashing works: ${isValid}`);

  // 2. Test 2FA logic
  const secret = authenticator.generateSecret();
  console.log(`✅ TOTP secret generation works: ${!!secret}`);

  // 3. Test Database Models
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Database connection successful. Current user count: ${userCount}`);
  } catch (err) {
    console.error("❌ Database test failed:", err);
    process.exit(1);
  }

  console.log("🏁 Core verification complete.");
  await prisma.$disconnect();
}

main();
