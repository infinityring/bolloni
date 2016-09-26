var Loki = require ('lokijs');
var express = require('express');
var router = express.Router();




/* GET users listing. */
router.get('/:bollone', function(req, res){
  var bolloni = req.app.get('bolloni');
  var bolloneId = req.params.bollone;

  var results = bolloni.where(function(obj) {
    console.log(JSON.stringify(obj));
    return obj.id === bolloneId;
  });

  console.log('Get ' + req.params.bollone);
  res.json(results);
});


router.post('/:bollone', function(req, res){
  var bolloni = req.app.get('bolloni');
  var bolloneId = req.params.bollone;

  var results = bolloni.where(function(obj) {
    console.log(JSON.stringify(obj));
    return obj.id === bolloneId;
  });

  var obj;
  if(results.length>0){
    obj = results[0];
    obj.end = Date.now();
    obj.duration = obj.end - obj.start;
    bolloni.update(obj)
  }
  else {
    obj = {id: bolloneId, start: Date.now()};
    bolloni.insert(obj);
  }
  console.log('Post ' + req.params.bollone + " = " + JSON.stringify(obj));

  res.json(obj);
});

module.exports = router;
