var Loki = require ('lokijs');
var express = require('express');
var app = require('../index.js');
var router = express.Router();




function getHistory(bolloniHistory){
  return bolloniHistory ? bolloniHistory.chain().simplesort('start', true).data() : {}
}


/* GET users listing. */
router.get('/bolloni', function(req, res){
  var bolloniHistory = req.app.get('bolloniHistory');
  var bolloni = req.app.get('bolloni');
  var conf = req.app.get('conf');

  res.json(bolloni.data());
});

router.get('/history', function(req, res){
  var bolloniHistory = req.app.get('bolloniHistory');
  var bolloni = req.app.get('bolloni');
  var conf = req.app.get('conf');

  res.json(getHistory(bolloniHistory));
});

router.get('/:bollone', function(req, res){
  var bolloniHistory = req.app.get('bolloniHistory');
  var bolloni = req.app.get('bolloni');
  var conf = req.app.get('conf');

  var bolloneId = req.params.bollone;
  var bollone = bolloni.by('id', bolloneId);

  //console.log('Get ' + req.params.bollone);
  res.json(getHistory(bolloniHistory));
});

function formatResponse(currentBollone, changedBolloni, listBolloni){
  return {
      history : getHistory()
    };
}

function closeBollone(item) {
  var newItem = item;
  newItem.end = Date.now();
  newItem.duration = newItem.end - newItem.start;
  return newItem;
}

function newBollone(bolloneId) {
  return {id: bolloneId, start: Date.now()};
}

router.post('/:bollone', function(req, res){
  var bolloniHistory = req.app.get('bolloniHistory');
  var bolloni = req.app.get('bolloni');
  var conf = req.app.get('conf');

  var bolloneId = req.params.bollone;

  console.log("Bollone " + bolloneId + app + app.bolloni + app.bolloniHistory + app.conf);

  var isOpen = bolloniHistory.where(function(obj) {return obj.id === bolloneId && !obj.end});

  bolloniHistory.where(function(obj) {return !obj.end})
    .map((item) => {
      console.log("Closing " + item.id);
      return bolloniHistory.update(closeBollone(item));
    });

    if(isOpen.length==0) {
      console.log("Bollone not exists or is closed " + bolloneId);
      bolloniHistory.insertOne(newBollone(bolloneId));
    }


  res.json(getHistory(bolloniHistory));
});

module.exports = router;
