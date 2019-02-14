require('./lib/globals');
logger.log('Starting server');

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const express = require('express');
const https = require('https');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');

const app = express();
app.use(helmet());

const secret = crypto.randomBytes(64).toString('hex');
app.use(session({ secret: secret, resave: false, saveUninitialized: false }));
app.use(csrf());

// api routing
const routers = {
    api: require('./api/router')
};
app.use('/api', routers.api);

// // serve correct js file
// app.get('/td.js', function(req, res, next) {
//     // logger.log('GET', req.url, '-> serving ../dist/hawk.js');
//     res.sendFile(path.join(__dirname, '../dist/td.js'));
// });

// if file exists in dist, serve it
_.each(fs.readdirSync(path.resolve(__dirname, '../dist')), function(file) {
    app.get('/'+file, function(req, res, next) {
        res.sendFile(path.join(__dirname, '../dist/'+file));
    });
});

// app.get('/icons/:file', function(req, res, next) {
//     // logger.log('GET', req.url, '-> serving ../icons/' + req.params.file);
//     res.sendFile(path.join(__dirname, '../icons/' + req.params.file));
// });

// everything else gets routed to index.html
app.get('*', function(req, res, next) {
    // logger.log('GET', req.url,'-> serving ../dist/index.html');
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const port = process.env.PORT || 4000;
if (process.env.NODE_ENV === 'production') { // TODO: enable https for prod
    app.listen(port, function() {
        logger.info('Production server started successfully. Listening @' + port);
    });
} else {
    https.createServer({
        key: fs.readFileSync('config/keys/key.pem'),
        cert: fs.readFileSync('config/keys/server.crt')
    }, app).listen(port, function() {
        logger.info('Server started successfully. Listening @ 127.0.0.1:' + port);
    });
}