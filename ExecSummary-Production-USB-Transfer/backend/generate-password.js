// Quick script to generate bcrypt password hash
// Usage: node generate-password.js your-password-here

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('\n❌ Error: Please provide a password');
  console.log('\nUsage: node generate-password.js your-password-here\n');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Password hash generated successfully!\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopy this hash and paste it into cms-admin/src/data/users.json');
console.log('Replace the "passwordHash" value for your admin user.\n');
