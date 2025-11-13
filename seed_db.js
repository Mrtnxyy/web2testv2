// seed_db.js

const fs = require('fs');
const path = require('path');
// Feltételezzük, hogy van egy db modulod a kapcsolat kezelésére (pl. require('./config/db'))
const db = require('./config/db'); // Cseréld le a valós DB modulodra!

const dataFiles = [
    { file: 'mu.txt', table: 'mu', fields: ['id', 'szerzo', 'cim'] },
    { file: 'enekes.txt', table: 'enekes', fields: ['id', 'nev', 'szulev'] },
    { file: 'szerep.txt', table: 'szerep', fields: ['id', 'szerepnev', 'muid', 'hang'] },
    { file: 'repertoar.txt', table: 'repertoar', fields: ['enekesid', 'szerepid', 'utoljara'] }
];

async function seedDatabase() {
    console.log('Adatbázis feltöltése TXT fájlokból...');
    
    for (const data of dataFiles) {
        const filePath = path.join(__dirname, 'data', data.file); // Feltételezve, hogy a 'data/' mappában vannak
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').slice(1); // Fejléc sor kihagyása
        
        let successCount = 0;
        
        for (const line of lines) {
            const values = line.split(';');
            
            // Értékek tisztítása (például a stringek körül lévő szóközök eltávolítása)
            const cleanValues = values.map(v => v.trim());
            
            // SQL parancs összeállítása
            const sql = `INSERT INTO ${data.table} (${data.fields.join(', ')}) 
                         VALUES ('${cleanValues.join("', '")}')`;
            
            try {
                // Ezt a részt a te adatbázis kezelőd kódjával kell helyettesíteni!
                // Példa (PostgreSQL 'pg' csomaggal): await db.query(sql); 
                // Példa (MySQL 'mysql' csomaggal): await db.execute(sql);

                console.log(`  -> Sikeresen beszúrva ${data.table} (ID: ${cleanValues[0]})`);
                successCount++;

            } catch (error) {
                console.error(`Hiba a(z) ${data.table} beszúrásakor: ${error.message}`);
                // További hibakereséshez érdemes a hibás sort is kiírni
            }
        }
        console.log(`[Sikeres]: ${data.table} - ${successCount} sor beszúrva.`);
    }

    // Lehet, hogy le kell zárni a DB kapcsolatot, ha a db modul megköveteli
    // db.end();
}

seedDatabase().catch(err => {
    console.error('Kritikus hiba a feltöltés során:', err);
    process.exit(1);
});
