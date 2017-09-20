// Packages
const express = require('express');
const colors = require('colors/safe');
const moment = require('moment');
const console = require('console');

// Shared Functions
function log(msg, color) {
    if (!color) color = colors.green;
    console.log(color('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] ') + msg);
}

// Configurations
var app = express();
app.set('view engine', 'pug');
app.use(express.static('static'));

// Views
app.get('*', function (req, res) {
    var v = req.path.replace(/\//g, '');
    log('Processing view request: ' + v);
    if (v === '') v = 'index';
    res.render(v, null, function (err, html) {
        if (err) {
            res.render('404');
            log('View not found: ' + v, colors.red);
        } else {
            res.send(html);
        }
    });
});

// Start
app.listen(9111, function () {
    log('Server started.');
});