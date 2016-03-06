var request = require('request');
var async = require('async');
//want to have groupTimeStamps return an array of play sessions
//full of Match IDs, sorted by timestamp
var groupTimeStamps = function(matchlist){
	//list of all playsessions
	sortedMatches=[];
	//list of all games in a play session
	playSession=[];
	//for each match except the last match (most recent ranked game)
	for (var i =0;i < 9;i++){
		console.log(matchlist[i].matchId);
		//add it to a playSession list
		playSession.push(matchlist[i].matchId);
		//if the next timestamp took place more than 1 hour prior
		if (matchlist[i].timestamp -3600000 > matchlist[i+1].timestamp){
			console.log();
			//add the playSession to the list of play sessions
			sortedMatches.push(playSession);
			//reset the playSession list
			playSession=[];
		}
	}
	return sortedMatches;
}
//function that helps convertWL by making an API Call for a single match
var getWL= function(game, callback){
	//set game to the request
	request('https://na.api.pvp.net/api/lol/na/v2.2/match/'+game+'?api_key=<API_KEY>', function (error, response, body){
		var result;
		if(!error && response.statusCode ==200){
			var one= JSON.parse(body);
			//console.log(one.participants);
			console.log(game);
			for (var i = 0; i < one.participantIdentities.length; i++) {
				if (one.participantIdentities[i].player.summonerId === 31167575){
					result = one.participants[i].stats.winner;
				}
			}

		}
		callback(result);
	});
	
}

//function that converts Match ID to W/L
function doAnalysis(playSesh){
	console.log(playSesh);
}

var convertWL = function(playSesh){
	//for each play session
	async.forEachOfSeries(playSesh, function(currentSession, i, callback){

	 
		
		console.log("Checking play session "+i);
		console.log("There are "+ playSesh[i].length +" games played");

		//Implement asynchronization so secondary API Calls return in-order
			async.forEachOfSeries(playSesh[i], function(game, j, callback2) {
				
				//playSesh[i][j]= getWL(game, callback2);
				getWL(game, function(result){
					playSesh[i][j] = result;
					callback2();
				});
		}, callback);

	}, function(){doAnalysis(playSesh);});
	
}

//original API Call for Summoner ID
request('https://na.api.pvp.net/api/lol/na/v2.2/matchlist/by-summoner/31167575?rankedQueues=RANKED_SOLO_5x5,TEAM_BUILDER_DRAFT_RANKED_5x5&seasons=PRESEASON3,SEASON3,PRESEASON2014,SEASON2014,PRESEASON2015,SEASON2015,PRESEASON2016,SEASON2016&api_key=<API_KEY>', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var jsonBody = JSON.parse(body);

    for (i in jsonBody.matches)
    {
    	console.log(jsonBody.matches[i].matchId);
    	//console.log(jsonBody.matches[i].timestamp);	
    }
    var sessions = groupTimeStamps(jsonBody.matches);

    console.log(sessions.length+ " play sessions");
    convertWL(sessions);

  }
});