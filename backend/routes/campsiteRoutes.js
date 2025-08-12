const express = require('express');
const router = express.Router();
const {testRoute} = require('../controllers/campsiteController');

router.get('/test', testRoute);

module.exports = router;