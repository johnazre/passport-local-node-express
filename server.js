var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var knex = require('./db/knex')
var bcrypt = require('bcrypt')
const saltRounds = 10;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy(
  function(username, password, done) {

    function checkPassword(username, password) {
      knex('users').select()
                  .where('username', username)
                  .then(function(user) {
                    bcrypt.compare(password, user[0].password, function(err, res) {
                      if(err) console.log('err: ', err)
                      return res;
                    });
                    // return bcrypt.compareSync(password, user[0].password);
                  })

        return null;
    }

    knex('users').select().where('username', username).asCallback(function(err, rows) {
      if (err) {
        console.log('err')
        return done(err);
      }
      if (rows.length < 1) {
        console.log('bad username')
        return done(null, false, { message: 'Incorrect Username'})
      }
      if (!bcrypt.compareSync(password, rows[0].password)) {
        console.log('bad password')
        return done(null, false, { message: 'Incorrect password' })
      }
      console.log('all good', rows[0])
      return done(null, rows[0]);
    })
  }
));

app.get('/login', function(req, res) {
  res.render('login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

app.listen(8000, function() {
  console.log('working on 8000')
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  knex('users').select().where('id', id).then(function(user) {
    done(err, user[0]);
  })
});
