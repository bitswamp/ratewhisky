var express = require('express'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    redis = require('redis').createClient();

var routes = require('./routes');
var unsorted = require('./whisky.json').whiskies;
var whiskies = {
    "Scotland": [],
    "USA": [],
    "Canada": [],
    "Ireland": [],
    "Australia": [],
    "France": [],
    "India": []
};
var whiskiesById = {};

for(var i = 0; i < unsorted.length; i++) {
    whiskies[unsorted[i].country].push(unsorted[i]);
    whiskiesById[unsorted[i].id] = unsorted[i];
}

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('title', 'Rate Whisky');
app.set('whiskies', whiskies);
app.set('whiskiesById', whiskiesById);
app.set('redis', redis);

app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.logger('short'));
app.use(express.cookieParser());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.session({ secret: "scotchyscotchscotch" }));

// passport
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var auth = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.redirectUrl = req.url;
  res.redirect('/');
};

app.get('/', routes.index("full"));
app.get('/try', auth, routes.index("trylist"));
app.get('/reviews', auth, routes.index("reviews"));
app.get('/logout', routes.logout);

app.get('/whisky/:id', auth, routes.whisky);
app.get('/review/:id', auth, routes.review);
app.post('/save/:id', auth, routes.save);

app.post('/add/:id', auth, routes.add);
app.post('/remove/:id', auth, routes.remove);

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', passport.authenticate('google', { 
    successRedirect: '/',
    failureRedirect: '/login' 
}));

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

passport.use(new GoogleStrategy({
        returnURL: 'http://ratewhisky.bitswamp.com/auth/google/return',
        realm: 'http://ratewhisky.bitswamp.com/'
    }, function(identifier, profile, done) {
        process.nextTick(function () {
            profile.id = identifier;
            profile.email = profile.emails[0].value;
            //console.log(profile);
            redis.sadd("users", profile.email);
            done(null, profile);
        });
    }
));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
