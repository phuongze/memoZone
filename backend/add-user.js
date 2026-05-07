const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://phuongzeor_db_user:yeuchiDung@phuongzeor.qvglbmp.mongodb.net/our-secret-space?appName=phuongZeor';

// Define AuthUser schema inline
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

async function addUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const username = 'Dungntt01';
    const password = 'Dung01ntt';

    // Hash password
    console.log('\n🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(`✅ Password hashed`);

    // Check if user exists
    const existingUser = await AuthUser.findOne({ username });
    if (existingUser) {
      console.log(`\n⚠️  User "${username}" already exists!`);
      console.log(`✅ Email: ${existingUser.username}`);
      console.log(`✅ Created: ${existingUser.createdAt}`);
      await mongoose.disconnect();
      return;
    }

    // Create new user
    const newUser = new AuthUser({
      username,
      passwordHash,
    });

    await newUser.save();

    console.log(`\n✅ SUCCESS! User created:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Username:  ${newUser.username}`);
    console.log(`Password:  ${password}`);
    console.log(`Created:   ${newUser.createdAt}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUser();
