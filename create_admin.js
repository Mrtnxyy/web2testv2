// Script to create an admin user. Run: node create_admin.js
const bcrypt = require('bcrypt');
const db = require('./config/db');
(async () => {
  try {
    const name = 'Admin';
    const email = process.argv[2] || 'admin@pelda.hu';
    const password = process.argv[3] || 'admin123';
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())', [name, email, hash, 'admin']);
    console.log('Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
