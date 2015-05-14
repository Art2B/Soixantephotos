var config = require('../config');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mail.mandrill.apiKey);
var colors = require('colors');
var mongoose = require('mongoose');
var imagesSchema = require('../database/image');
var Image = mongoose.model('Image', imagesSchema);

var message = {
  "html": "<p>You have new images to verify</p>",
  "text": "You have new images to verify",
  "subject": "Soixante photos: New images !",
  "from_email": config.mail.sender,
  "from_name": config.mail.senderName,
  "to": [{
          "email": config.mail.verifyMail,
          "name": config.mail.verifyName,
          "type": "to"
      }]
};

function sendVerifyMail(message){
  console.log('VERIFY: Sending message'.grey);
  mandrill_client.messages.send({"message": message}, function(result) {
    console.log('Mandrill result: ',result);
  }, function(e) {
    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
  });
}
function getTargetTime(hour,minute) {
  var t = new Date();
  t.setHours(hour);
  t.setMinutes(minute);
  t.setSeconds(0);
  t.setMilliseconds(0);
  t.setDate(t.getDate() + 1);
  return t;
}

function verifyInterval(message){
  var timetarget = getTargetTime(20,00).getTime();
  var timenow =  new Date().getTime();
  var offsetmilliseconds = timetarget - timenow;

  if (offsetmilliseconds >= 0){
    setTimeout(function(){
      Image.find({verified: false}, function(err, result){
        if(result.length > 0) {
          console.log('There is images to verify'.cyan);
          sendVerifyMail(message);
        }
        verifyInterval(message);
      });
    }, offsetmilliseconds);
  } 
}

verifyInterval(message);