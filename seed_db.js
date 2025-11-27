const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Enekes = require('./models/Enekes');
const Mu = require('./models/Mu');
const Szerep = require('./models/Szerep');
const Repertoar = require('./models/Repertoar');

const dataFiles = [
    { file: 'enekes.txt', model: Enekes, fields: ['id', 'nev', 'szulev'] },
    { file: 'mu.txt', model: Mu, fields: ['id', 'szerzo', 'cim'] },
    { file: 'szerep.txt', model: Szerep, fields: ['id', 'szerepnev', 'muid', 'hang'] },
    { file: 'repertoar.txt', model: Repertoar, fields: ['enekesid', 'szerepid', 'utoljara'] }
];

function parseFile(filePath, fields) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').slice(1).filter(l => l.trim() !== '' && !l.includes('[source'));
        
        return lines.map(line => {
            const values = line.split(';').map(v => v.trim().replace('\r', ''));
            const doc = {};
            
            fields.forEach((field, index) => {
                let val = values[index];

                const docField = field; 

                if (docField === 'id' || docField.endsWith('id') || docField === 'szulev' || docField === 'utoljara' || docField === 'muid') {
                    doc[docField] = parseInt(val) || 0;
                } else {
                    doc[docField] = val;
                }
            });
            return doc;
        });
    } catch (err) {
        console.error(`Hiba a fájl olvasásakor (${filePath}):`, err.message);
        return [];
    }
}

async function seedDatabase() {
    const connectionString = process.env.MONGO_URI;

    if (!connectionString) {
        console.error('KRITIKUS HIBA: Nincs megadva adatbázis elérési útvonal (MONGO_URI)!');
        console.error('Ha helyben futtatod, ellenőrizd a .env fájlt.');
        process.exit(1);
    }
    
    try {
        console.log('Csatlakozás a MongoDB-hez...');
        await mongoose.connect(connectionString);
        console.log('✅ Sikeres csatlakozás!');
    
        console.log('Régi adatok törlése...');
        await Promise.all([
            Enekes.deleteMany({}),
            Mu.deleteMany({}),
            Szerep.deleteMany({}),
            Repertoar.deleteMany({}),
        ]);
        console.log('Adatbázis kitakarítva.');

        console.log('Új adatok betöltése...');
        for (const data of dataFiles) {
            const filePath = path.join(__dirname, 'data', data.file);
            
            if (fs.existsSync(filePath)) {
                const documents = parseFile(filePath, data.fields);

                if (documents.length > 0) {
                    await data.model.insertMany(documents);
                    console.log(`   -> [Sikeres]: ${data.file} (${documents.length} db sor)`);
                } else {
                    console.log(`   -> [Figyelem]: ${data.file} üres vagy nem olvasható.`);
                }
            } else {
                console.error(`   -> [HIBA]: A fájl nem található: ${filePath}`);
            }
        }

        console.log('\n=========================================');
        console.log('   🎉 ADATBÁZIS SIKERESEN FRISSÍTVE!');
        console.log('=========================================');

    } catch (error) {
        console.error('\n!!! KRITIKUS HIBA A FELTÖLTÉS SORÁN !!!');
        console.error(error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}

seedDatabase();