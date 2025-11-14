// create_admin.js (MongoDB Logic)
// Script to create an admin user. Run: node create_admin.js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

// Mongoose Modell importálása
// Mivel a User.js a models/ mappában van:
const User = require('./models/User'); 

(async () => {
  if (!process.env.MONGO_URI) {
      console.error('KRITIKUS HIBA: MONGO_URI környezeti változó hiányzik a .env fájlból!');
      process.exit(1);
  }

  // MongoDB csatlakozás
  await mongoose.connect(process.env.MONGO_URI);

  try {
    const name = 'Admin';
    // Argumentumok a parancssorból vagy alapértelmezett értékek
    const email = process.argv[2] || 'admin@pelda.hu';
    const password = process.argv[3] || 'admin123';
    
    // Admin felhasználó keresése Mongoose-zal
    let user = await User.findOne({ email: email });

    if (user) {
        console.log(`Admin user már létezik ezzel az email címmel: ${email}. Nem hoztunk létre újat.`);
        // Törölheted a sort, ha frissíteni akarod a jelszót: const hash = await bcrypt.hash(password, 10);
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Mongoose: Admin user létrehozása (az SQL INSERT helyett)
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
    // Kapcsolat bezárása a szkript végén
    mongoose.connection.close();
  }
})();