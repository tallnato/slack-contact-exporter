var yaml_config = require('node-yaml-config');
var Slack = require('slack-node');
var vCardJS = require('vcards-js');
var fs = require('fs');
var config = yaml_config.load('./config.yml');


slack = new Slack(config.slackToken);

//get the team info
slack.api("team.info", function(err, response){
	if(err) throw err;
	if(!response.ok) throw new Error(response.error);

	var organization = response.team.name;
	var vFile = organization + '.vcf';


	//Check if file already exists
	if (fs.existsSync(vFile)){
		fs.unlinkSync(vFile);
	}

	console.log("Getting users for organization '" + organization + "'.");

	//Get the team user list
	slack.api("users.list", function(err, response) {
		if(err){ throw err; }
		if(!response.ok) throw new Error(response.error);

		response.members.forEach(function(user) {
			var vCard = vCardJS();	
			//set properties
			if(user.profile.first_name)
				vCard.firstName = user.profile.first_name;
			if(user.profile.last_name)
				vCard.lastName = user.profile.last_name;
			vCard.organization = organization;
			vCard.photo.attachFromUrl(user.profile.image_72, 'JPEG');

			vCard.cellPhone = user.profile.phone;
			vCard.title = user.profile.title;
			vCard.workEmail = user.profile.email;

			vCard.socialUrls['skype'] = user.profile.skype;

			//Append vCard to file
			fs.appendFile(vFile, vCard.getFormattedString());
		});

		console.log("vCard '" + vFile + "' created.");
	});
});



