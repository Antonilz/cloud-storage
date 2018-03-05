const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const compress = require('compression');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes');

require('./services/passport');

Promise = require('bluebird'); // eslint-disable-line no-global-assign
mongoose.connect(keys.mongoURI, { keepAlive: 1, useMongoClient: true });

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', routes);

if (process.env.NODE_ENV == 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
