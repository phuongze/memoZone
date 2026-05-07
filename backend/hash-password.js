const bcrypt = require('bcryptjs');

const users = [
  { username: 'Phuongnc', password: 'ncPhuong' },
  { username: 'Dungntt', password: 'nttDung' }
];

console.log('\n🔐 PASSWORD HASHING UTILITY\n');
console.log('Copy the hashed passwords below:\n');

users.forEach(user => {
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(user.password, salt);

  console.log(`Username: ${user.username}`);
  console.log(`Password: ${user.password}`);
  console.log(`Hashed:   ${hashed}`);
  console.log('---');
});

console.log('\n✅ Copy hashed passwords into MongoDB\n');
