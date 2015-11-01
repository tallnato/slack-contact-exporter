var config = require('./config.json')
var Slack = require('slack-node');
var vCard = require('vcards-js');
var request = require('request');
var fs = require('fs');

slack = new Slack(config.slackToken);
vCard = vCard();

console.log(config);

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


slack.api("users.list", function(err, response) {
	response.members.forEach(function(user) {

		download(user.profile.image_72,  user.name+'.jpg' , function () {
		    
		//set properties
		vCard.firstName = user.profile.first_name;
		vCard.lastName = user.profile.last_name;
		vCard.organization = config.organization;
		vCard.photo.embedFromFile(user.name+'.jpg');

		vCard.cellPhone = user.profile.phone;
		vCard.title = user.profile.title;
		vCard.email = user.profile.email;

		vCard.socialUrls['skype'] = user.profile.skype;

		//save to file
		vCard.saveToFile('./contacts/'+user.name+'.vcf');

		//Clean photo after save
		fs.unlink(user.name+'.jpg');
		});
	});
});



