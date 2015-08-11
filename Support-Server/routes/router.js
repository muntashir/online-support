var express = require('express');
var config = require('../config');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var name = config.company + " Support";
    res.render('lobby', {
        prompt: config.prompt,
        title: name,
        description: name,
        sessionID: req.sessionID
    });
});

router.get('/rooms/:id', function (req, res) {
    var name = config.company + " Support";
    res.render('room', {
        company: config.company,
        title: name,
        description: name,
        sessionID: req.sessionID,
        roomID: req.params.id
    });
});

module.exports = router;