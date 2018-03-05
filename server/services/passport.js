const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const { ExtractJwt } = require('passport-jwt');
const User = mongoose.model('users');
const JwtStrategy = require('passport-jwt').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

/*
passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]'
    },
    async (email, password, done) => {
      const user = await User.findOne({ email: email });
      if (!user || !user.validPassword(password)) {
        return done(null, false, {
          errors: { 'email or password': 'invalid' }
        });
      }
      done(null, user);
    }
  )
); */

const jwtOptions = {
  secretOrKey: keys.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
};

const jwt = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

passport.use(new JwtStrategy(jwtOptions, jwt));
