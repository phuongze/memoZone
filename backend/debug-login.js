const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://phuongzeor_db_user:yeuchiDung@phuongzeor.qvglbmp.mongodb.net/our-secret-space?appName=phuongZeor';

// Define AuthUser schema
const authUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AuthUser = mongoose.model('AuthUser', authUserSchema);

async function debugLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');

    // Get all users
    console.log('📋 All users in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const users = await AuthUser.find();

    if (users.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!');
      await mongoose.disconnect();
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n[User ${index + 1}]`);
      console.log(`  Username:     ${user.username}`);
      console.log(`  Password Hash: ${user.passwordHash}`);
      console.log(`  Created:       ${user.createdAt}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password verification
    console.log('🔐 Testing password verification:\n');

    const testUsers = [
      { username: 'Dungntt01', password: 'Dung01ntt' },
      { username: 'Phuongnc', password: 'ncPhuong' },
      { username: 'Dungntt', password: 'nttDung' }
    ];

    for (const testUser of testUsers) {
      const foundUser = await AuthUser.findOne({ username: testUser.username });

      if (!foundUser) {
        console.log(`❌ User "${testUser.username}" NOT FOUND`);
        continue;
      }

      const isMatch = await bcrypt.compare(testUser.password, foundUser.passwordHash);
      const status = isMatch ? '✅ MATCH' : '❌ NO MATCH';

      console.log(`[${testUser.username}] / [${testUser.password}]`);
      console.log(`  ${status}`);
      console.log(`  Password Hash: ${foundUser.passwordHash}`);
      console.log();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 WHAT TO CHECK:\n');
    console.log('1. Is your user in the list above?');
    console.log('2. Does password verification show ✅ MATCH?');
    console.log('3. Is password hash starting with $2a$ or $2b$?');
    console.log('\nIf NO - the issue is in the database!');
    console.log('If YES - the issue is in the backend API code!\n');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugLogin();
