var express = require('express');
var hbs = require('express-hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var loki = require('lokijs');


var db = new loki('bolloni.json')
var bolloni = db.addCollection('bolloni')


var parts = require('./routes/service');

var bolloniConf = {
  rows: [
    {bolloni: [
      {id : 'bollone1', style : 'col-xs-12 col-sm-6'},
      {id : 'bollone2', style : 'col-xs-12 col-sm-6'}
    ]},
    {bolloni: [
      {id : 'bollone3', style : 'col-xs-6 col-sm-3'},
      {id : 'bollone4', style : 'col-xs-6 col-sm-3'},
      {id : 'bollone5', style : 'col-xs-6 col-sm-3'},
      {id : 'bollone6', style : 'col-xs-6 col-sm-3'}
    ]}
  ]
}


var app = express();


app.use('/se', parts);

app.set('port', (process.env.PORT || 5000));

app.use('/pu', express.static(path.join(__dirname, 'public')));
app.use('/co', express.static(path.join(__dirname, 'bower_components')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));


// views is directory for all template files
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views'
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


app.set('bolloni', bolloni);

app.get('/', function(request, response) {
  response.render('index', {title: 'Bolloni',
                            bolloni : {
                              rows: [
                                {bolloni: [
                                  {id : 'bollone3', img: 'b4.jpeg' , style : 'col-xs-6 col-sm-3'},
                                  {id : 'bollone4', img: 'b5.jpg' , style : 'col-xs-6 col-sm-3'},
                                  {id : 'bollone5', img: 'b6.jpg' , style : 'col-xs-6 col-sm-3'},
                                  {id : 'bollone6', img: 'b1.jpeg' , style : 'col-xs-6 col-sm-3'}
                                ]},
                                {bolloni: [
                                  {id : 'bollone7', img: 'b1.jpeg' , style : 'col-xs-4 col-sm-2'},
                                  {id : 'bollone8', img: 'b2.jpeg' , style : 'col-xs-4 col-sm-2'},
                                  {id : 'bollone9', img: 'b3.jpg' , style : 'col-xs-4 col-sm-2'},
                                  {id : 'bollone0', img: 'b1.jpeg' , style : 'col-xs-4 col-sm-2'},
                                  {id : 'bollone1', img: 'b6.jpg' , style : 'col-xs-4 col-sm-2'},
                                  {id : 'bollone2', img: 'b1.jpeg' , style : 'col-xs-4 col-sm-2'}
                                ]},
                              ]
                            },
                            layout: 'layout/default'});
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
