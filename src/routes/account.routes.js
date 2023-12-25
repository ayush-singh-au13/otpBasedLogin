const express = require('express');
const ctrl = require('../controllers/account.controller');
const checkAuth = require('../middlewares/checkAuth');
const checkIfAccountIsValid = require('../middlewares/checkIfAccountIsValid');
const router = express.Router();
// const isValid = require('./../middlewares/isValid');
// const checkAuth = require('../middlewares/checkAuth');
// const checkAdmin = require('../middlewares/checkAdmin');

router.get('/listUserAccountDetail',checkAuth, ctrl.listUserAccountDetail);

router.post('/addAmount',checkAuth, checkIfAccountIsValid,ctrl.addAmount);

module.exports = router;

