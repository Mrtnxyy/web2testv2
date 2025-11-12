# Opera Archívum - Node.js alkalmazás

**Téma:** Opera archívum (énekesek, művek, szerepek, repertoár)

**Használt ingyenes sablon javaslat:** Start Bootstrap - Creative (ajánlott). A projekt egyszerű EJS sablonokat tartalmaz, könnyen cserélhető HTML/CSS sablonokra.

## Hol legyenek a fájlok
Az indító fájl helye (a beadáshoz):
`/home/<felhasznalonev>/feladat/indito.js`

## Telepítés (a szerveren)
1. Másold a projektet a szerverre a `/home/<felhasznalonev>/feladat` mappába.
2. Készíts `.env` fájlt a gyökérben a következő tartalommal:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=
   DB_NAME=feladatdb
   SESSION_SECRET=valami_titkos
   ```
3. Telepítsd a függőségeket:
   ```bash
   npm install
   ```
4. Inicializáld az adatbázist (példa MySQL):
   ```bash
   mysql -u root -p feladatdb < sql/init_tables.sql
   mysql -u root -p feladatdb < sql/seed_from_txt.sql
   ```
5. Futtasd az alkalmazást:
   ```bash
   node indito.js
   ```

## Admin felhasználó
A projekt tartalmaz egy `create_admin.js` scriptet, amivel létre lehet hozni egy admin felhasználót (hash-eli a jelszót és beszúrja a users táblába).

## Mit tartalmaz a projekt
- routes/: index, auth, messages, crud
- views/: egyszerű EJS sablonok
- public/: statikus fájlok (CSS/JS kézzel kiegészíthetők)
- sql/: init és seed fájlok (seed megalkotva a feltöltött TXT-ek alapján)
- data/: feltöltött TXT és DOCX fájlok

## Források / felhasznált anyagok
A projekt fájlok között megtalálod az eredeti TXT és DOCX fájlokat a `data/` mappában.
