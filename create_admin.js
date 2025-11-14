const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User'); 

(async () => {
  if (!process.env.MONGO_URI) {
      console.error('KRITIKUS HIBA: MONGO_URI környezeti változó hiányzik a .env fájlból!');
      process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const name = 'Admin';
    const email = process.argv[2] || 'admin@pelda.hu';
    const password = process.argv[3] || 'admin123';
    let user = await User.findOne({ email: email });

    if (user) {
        console.log(`Admin user már létezik ezzel az email címmel: ${email}. Nem hoztunk létre újat.`);
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    
    await User.create({
        name: name,
        email: email,
        password: hash,
        role: 'admin'
    });

    console.log('Admin user LÉTREHOZVA:', email, 'Jelszó:', password);
    process.exit(0);
    
  } catch (err) {
    console.error('Hiba az admin user létrehozásakor:', err);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
})();