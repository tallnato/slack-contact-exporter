var config = require('./config.json')
var Slack = require('slack-node');
var vCard = require('vcards-js');
var fs = require('fs');

slack = new Slack(config.slackToken);
vCard = vCard();

var vFile = config.organization + '.vcf';

//Check if file already exists
if (fs.existsSync(vFile)){
	fs.unlinkSync(vFile);
}

slack.api("users.list", function(err, response) {
	response.members.forEach(function(user) {

		//set properties
		vCard.firstName = user.profile.first_name;
		vCard.lastName = user.profile.last_name;
		vCard.organization = config.organization;
		vCard.photo.attachFromUrl(user.profile.image_72, 'JPEG');

		vCard.cellPhone = user.profile.phone;
		vCard.title = user.profile.title;
		vCard.email = user.profile.email;

		vCard.socialUrls['skype'] = user.profile.skype;

		//save vCard
		fs.appendFile(vFile, vCard.getFormattedString());
	});
});



