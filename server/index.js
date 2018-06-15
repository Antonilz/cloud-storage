const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const compress = require('compression');
const bodyParser = require('body-parser');
const https = require('https');
const keys = require('./config/keys');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const routes = require('./routes');
const morgan = require('morgan');
const path = require('path');

require('./services/passport');

Promise = require('bluebird'); // eslint-disable-line no-global-assign
mongoose.connect(
  keys.mongoURI,
  { keepAlive: 1 }
);

const app = express();

app.use(cors());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));

app.use('/api', routes);

if (process.env.NODE_ENV == 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const options = {
  key: fs.readFileSync(path.resolve(__dirname, './config/private.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './config/public.crt')),
  requestCert: false,
  rejectUnauthorized: false
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const server = https.createServer(options, app);
const PORT = process.env.PORT || 5000;
server.listen(PORT);
