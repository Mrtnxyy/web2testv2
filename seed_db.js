// seed_db.js - MongoDB feltöltő szkript
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Modellek importálása (Ezeknek a fájloknak létezniük kell a models/ mappában!)
const Enekes = require('./models/Enekes');
const Mu = require('./models/Mu');
const Szerep = require('./models/Szerep');
const Repertoar = require('./models/Repertoar');
const User = require('./models/User'); // User modell is szükséges a korábbi lépésekből

// Adatfájl konfiguráció
// A 'fields' itt a Mongoose Model mezőneveire utal.
const dataFiles = [
    // TXT-ben: id, nev, szulev -> Mongoose-ban: originalId, nev, szulev
    { file: 'enekes.txt', model: Enekes, fields: ['id', 'nev', 'szulev'] },
    // TXT-ben: id, szerzo, cim -> Mongoose-ban: originalId, szerzo, cim
    { file: 'mu.txt', model: Mu, fields: ['id', 'szerzo', 'cim'] },
    // TXT-ben: id, szerepnev, muid, hang -> Mongoose-ban: originalId, szerepnev, muid, hang
    { file: 'szerep.txt', model: Szerep, fields: ['id', 'szerepnev', 'muid', 'hang'] },
    // TXT-ben: enekesid, szerepid, utoljara -> Mongoose-ban: enekesid, szerepid, utoljara
    { file: 'repertoar.txt', model: Repertoar, fields: ['enekesid', 'szerepid', 'utoljara'] }
];

// Fájlok beolvasása és dokumentumokká alakítása
function parseFile(filePath, fields) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n').slice(1); // Fejléc sor kihagyása
    
    return lines.map(line => {
        const values = line.split(';').map(v => v.trim());
        const doc = {};
        
        fields.forEach((field, index) => {
            let val = values[index];
            
            // Ha a mező az 'id', akkor 'originalId' néven mentjük a Mongoose modellekben
            const docField = (field === 'id') ? 'originalId' : field;
            
            // Számok konvertálása
            if (docField.endsWith('id') || docField === 'szulev' || docField === 'utoljara' || docField === 'muid') {
                doc[docField] = parseInt(val) || 0;
            } else {
                doc[docField] = val;
            }
        });
        return doc;
    });
}

async function seedDatabase() {
    if (!process.env.MONGO_URI) {
        console.error('KRITIKUS HIBA: MONGO_URI környezeti változó hiányzik!');
        process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Csatlakozás sikeres, feltöltés indul...');
    
    try {
        // Gyűjtemények törlése az újra feltöltéshez
        console.log('Régi adatok törlése...');
        await Promise.all([
            Enekes.deleteMany({}),
            Mu.deleteMany({}),
            Szerep.deleteMany({}),
            Repertoar.deleteMany({}),
            // A users táblát itt nem töröljük, hogy az admin user megmaradjon!
        ]);

        for (const data of dataFiles) {
            const filePath = path.join(__dirname, 'data', data.file);
            console.log(`Feltöltés indítása: ${data.file}`);
            
            // Adatok beolvasása és átalakítása
            const documents = parseFile(filePath, data.fields);
            
            // Adatok beszúrása a MongoDB-be
            await data.model.insertMany(documents);
            
            console.log(`[Sikeres]: ${data.model.collection.collectionName} - ${documents.length} dokumentum beszúrva.`);
        }

    } catch (error) {
        console.error('\n!!! KRITIKUS HIBA A FELTÖLTÉS SORÁN !!!');
        console.error('Ennek oka lehet duplikált originalId, érvénytelen adat, vagy hiba a modellekben.');
        console.error(error.message);
    } finally {
        // Kapcsolat bezárása a szkript végén
        mongoose.connection.close();
        console.log('Adatbázis feltöltési szkript befejeződött.');
    }
}

seedDatabase();