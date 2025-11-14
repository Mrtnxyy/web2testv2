const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Enekes = require('./models/Enekes');
const Mu = require('./models/Mu');
const Szerep = require('./models/Szerep');
const Repertoar = require('./models/Repertoar');
const User = require('./models/User');

const dataFiles = [
    { file: 'enekes.txt', model: Enekes, fields: ['id', 'nev', 'szulev'] },
    { file: 'mu.txt', model: Mu, fields: ['id', 'szerzo', 'cim'] },
    { file: 'szerep.txt', model: Szerep, fields: ['id', 'szerepnev', 'muid', 'hang'] },
    { file: 'repertoar.txt', model: Repertoar, fields: ['enekesid', 'szerepid', 'utoljara'] }
];

function parseFile(filePath, fields) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n').slice(1);
    
    return lines.map(line => {
        const values = line.split(';').map(v => v.trim());
        const doc = {};
        
        fields.forEach((field, index) => {
            let val = values[index];
            
            const docField = (field === 'id') ? 'originalId' : field;
            
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
        console.log('Régi adatok törlése...');
        await Promise.all([
            Enekes.deleteMany({}),
            Mu.deleteMany({}),
            Szerep.deleteMany({}),
            Repertoar.deleteMany({}),
        ]);

        for (const data of dataFiles) {
            const filePath = path.join(__dirname, 'data', data.file);
            console.log(`Feltöltés indítása: ${data.file}`);
            
            const documents = parseFile(filePath, data.fields);

            await data.model.insertMany(documents);
            
            console.log(`[Sikeres]: ${data.model.collection.collectionName} - ${documents.length} dokumentum beszúrva.`);
        }

    } catch (error) {
        console.error('\n!!! KRITIKUS HIBA A FELTÖLTÉS SORÁN !!!');
        console.error('Ennek oka lehet duplikált originalId, érvénytelen adat, vagy hiba a modellekben.');
        console.error(error.message);
    } finally {
        mongoose.connection.close();
        console.log('Adatbázis feltöltési szkript befejeződött.');
    }
}

seedDatabase();