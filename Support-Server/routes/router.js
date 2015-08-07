var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('lobby', {
        title: 'KNS Support',
        description: 'KNS Support',
        sessionID: req.sessionID
    });
});

router.get('/rooms/:id', function (req, res) {
    res.render('room', {
        title: 'KNS Support',
        description: 'KNS Support',
        sessionID: req.sessionID,
        roomID: req.params.id
    });
});

module.exports = router;