var express = require('express');
var hbs = require('hbs');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var loki = require('lokijs');
var session      = require('express-session');

var LocalStrategy   = require('passport-local').Strategy;
var passport = require('passport');


var db = new loki('bolloni.json')
var bolloni = db.addCollection('bolloni', { unique: ['id'] });
var bolloniHistory = db.addCollection('history'); //, { unique: ['id'] });
var conf = db.addCollection('conf', { unique: ['userId'] });

var parts = require('./routes/service');


bolloni.insert([
  {id : 'bollone1', style : 'b1', category : { desc : 'Categoria uno', style : ''}, desc : 'Bollone uno'    , img : 'b1.jpeg'},
  {id : 'bollone2', style : 'b1', category : { desc : 'Categoria uno', style : ''}, desc : 'Bollone due'    , img : 'b2.jpeg'},
  {id : 'bollone3', style : 'b1', category : { desc : 'Categoria uno', style : ''}, desc : 'Bollone tre'    , img : 'b3.jpg' },
  {id : 'bollone4', style : 'b1', category : { desc : 'Categoria due', style : ''}, desc : 'Bollone quattro', img : 'b4.jpeg'},
  {id : 'bollone5', style : 'b1', category : { desc : 'Categoria due', style : ''}, desc : 'Bollone cinque' , img : 'b5.jpg' },
  {id : 'bollone6', style : 'b1', category : { desc : 'Categoria due', style : ''}, desc : 'Bollone sei '   , img : 'b5.jpg' }
]);

var userConf = {
                userId  : '1',
                style   : '3',
                rows    : [{ id: 'row1',
                             bolloni: [
                              { id : 'bollone1', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone2', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone3', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone3', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone4', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone5', style : 'col-xs-4 col-sm-3'},
                              { id : 'bollone6', style : 'col-xs-4 col-sm-3'}
                            ]},
                            { id: 'row2',
                              bolloni: [
                                { id : 'bollone4', style : 'col-xs-4 col-sm-3'},
                                { id : 'bollone5', style : 'col-xs-4 col-sm-3'},
                                { id : 'bollone6', style : 'col-xs-4 col-sm-3'}
                            ]},
                            { id: 'row3',
                              bolloni: [
                                { id : 'bollone4', style : 'col-xs-12 col-sm-3'},
                                { id : 'bollone5', style : 'col-xs-12 col-sm-3'},
                                { id : 'bollone6', style : 'col-xs-12 col-sm-3'}
                            ]}

                          ]
              };

conf.insert(userConf);

var app = express();


//login
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.set('port', (process.env.PORT || 5000));

app.use('/se', parts);
app.use('/pu', express.static(path.join(__dirname, 'public')));
app.use('/co', express.static(path.join(__dirname, 'bower_components')));
app.use('/pa', express.static(path.join(__dirname, 'views/partials')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));


// views is directory for all template files
//app.engine('hbs', hbs.express4({
//  partialsDir: __dirname + '/views'
//}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('json', (context) => JSON.stringify(context));

hbs.registerHelper('bolloneEnrich', function(configBollone, bolloniList, history, options) {
    return options.fn({conf : this,
                       bollone : bolloniList.filter((bollone) => bollone.id===configBollone.id)[0],
                       history : history.filter((bollone) => bollone.id===configBollone.id)
                     })
   }
);

hbs.registerHelper('currentBolloneEnrich', function(bolloniList, history, options) {
    return history[0] ? options.fn({
                       bollone : bolloniList.filter((bollone) => history[0].id === bollone.id)[0],
                       currentBollone : history[0],
                       calculatedDuration : Date.now() - history[0].start
                     }) :'';
   }
);


app.set('conf', conf);
app.set('bolloni', bolloni);
app.set('bolloniHistory', bolloniHistory);


function formatPageData(formatStyle, bolloniList, currentIndex, result){
  //col-xs-12 col-sm-6

  if(currentIndex<bolloniList.length)
    return formatPageData(formatStyle, bolloniList, currentIndex++, result)
  else
    return result;
}

function loadUserConfiguration(userId){
  return conf.by('userId', userId);
}

function getNeededBolloni(configuration){
  return configuration.rows.reduce((p, c) =>
     p.concat(c.bolloni.reduce((p, c) =>
       p.concat([c.id])
      ,[]))
  , [])
  .reduce((p, c, i, a) =>
    p.indexOf(c)<0 ? p.concat([c]) : p
  , []).map((item) => {return  bolloni.by('id',item)});
}

function getHistoryBolloni(history){
  return history.chain().simplesort('start', true).data();
}

app.get('/', isLoggedIn, function(request, response) {

  console.log(request.user);

  var userId = 1;

  var conf = loadUserConfiguration(userId);

  var neededBolloni = getNeededBolloni(conf);

  var history = getHistoryBolloni(bolloniHistory);

  var pageData = {title: 'Bolloni',
                            user : request.user,
                            configuration : conf,
                            bolloni : neededBolloni,
                            history : history,
                            layout: 'layout/default'};

  response.render('index', pageData);
});


app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login', {bolloni : {}, title: 'Bolloni login', layout: 'layout/default'});
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});





app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


process.on('SIGTERM', function () {
  server.close(function () {
    db.saveDatabase();
    process.exit(0);
  });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}


passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'inputEmail',
        passwordField : 'inputPassword',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, user, password, done) {
          done(null, { "user": user});
    })
);


passport.serializeUser(function(user, done) {
    done(null, "a");
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
     done(null, { "user": id});
});
