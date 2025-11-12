// /home/<felhasznalonev>/feladat/indito.js
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Alkalmazás fut: http://localhost:${PORT} (port ${PORT})`);
});
