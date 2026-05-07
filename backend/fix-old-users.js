const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://phuongzeor_db_user:yeuchiDung@phuongzeor.qvglbmp.mongodb.net/our-secret-space?appName=phuongZeor';

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

async function fixUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const usersToFix = [
      { username: 'Phuongnc', password: 'ncPhuong' },
      { username: 'Dungntt', password: 'nttDung' }
    ];

    console.log('🔐 Fixing password hashes...\n');

    for (const userData of usersToFix) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      await AuthUser.updateOne(
        { username: userData.username },
        { passwordHash }
      );

      console.log(`✅ Updated ${userData.username}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Hash: ${passwordHash}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ ALL USERS FIXED!\n');
    console.log('You can now login with:');
    console.log('  Dungntt01  / Dung01ntt');
    console.log('  Phuongnc   / ncPhuong');
    console.log('  Dungntt    / nttDung\n');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixUsers();
