// routes/index.js

// Ne tartalmazzon semmilyen HTML vagy EJS taget (<, %>)!

const express = require('express');
const router = express.Router();

// GET kérés a főoldalra ("/")
router.get('/', (req, res) => {
    // res.render('index') hívja meg a views/index.ejs fájlt, 
    // amit az indito.js-ben beállított layout.ejs fog körbevenni.
    res.render('index'); 
});

module.exports = router;
