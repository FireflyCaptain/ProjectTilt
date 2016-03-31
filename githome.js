var request = require('request');
var async = require('async');
var sleep = require('sleep');
var readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var summonerID;
//function that returns all-time winrate
function doTotalWinrate(Sessions){
	var wins=0;
	var total=0;
	for (var i = 0; i < Sessions.length;i++){
		for (var j =0 ; j < Sessions[i].length; j++){
			if (Sessions[i][j]===true){
				wins++;
			}
		}
	total+=Sessions[i].length;
	}
	if (total===0){
		return "No Games Found";
	}
	wins= (wins*100)/total;
	wins= wins - (wins%1);
	return wins+"%.";
}

//function that returns the average winrate for a play session with <number> games
function doSessionLengths(Sessions, number){
	//how many wins in sessions of <number> length
	var wins=0;
	//how many total sessions of <number>length
	var total=0;

	for (i in Sessions){
		if (Sessions[i].length===number){
			for (j in Sessions[i]){
				if (Sessions[i][j]===true){
					wins++;
				}
			}
			total++;
		}
	}
	if (total===0){
		return "Not Enough Data";
	}
	//total * number is the total number of games played in sessions of <number>length
	wins=(wins*100)/(total*number);
	wins= wins - (wins%1);
	return wins+"% with a sample size of "+ total+ " sessions.";
}

//function that returns winrate of the first game if the final game of the previous session was a loss
function doLastGame(Sessions){
	//tracks the number of wins after a break following a loss
	var winAfterBreak=0;
	//tracks the number of sessions that ended on a loss
	var totalAfterBreak=0;
	for (var i=0; i < Sessions.length-2; i++){
		//checks if player lost final game of play session
		if (Sessions[i][0]===false){
			totalAfterBreak++;
			if (Sessions[(i+1)][0]===true){
				winAfterBreak++;
			}
		}
	}
	//calculate winning percentage for final game of play session
	winAfterBreak=(winAfterBreak*100)/totalAfterBreak;
	//shave off decimals
	winAfterBreak=winAfterBreak-(winAfterBreak%1);
	return winAfterBreak+"%";
}
//Looks at winrate immediately following a loss
function doImmediateTwo(Sessions){
	//keeps track of the number of wins after 2-loss streaks
	var winAfterTwoL=0;
	//keeps track of the total 2-loss streaks that have at least one game after them
	var totalAfterTwoL=0;

	for (i in Sessions){
		//if there's at least three games in the session
		if (Sessions[i].length >2){
			//don't want to check after losses if they are the final game in the session
			for (var j = Sessions[i].length-1;j>=2;j--){
				//check if after a loss...
				if (Sessions[i][j]===false && Sessions[i][j-1]===false){
					//the player won the next one
					if (Sessions[i][j-2]===true){
						winAfterTwoL++;
					}
					totalAfterTwoL++;
				}
			}
		}
	}
	if (totalAfterTwoL===0){
		return "Not Enough Data";
	}
	winAfterTwoL = ((winAfterTwoL*100)/totalAfterTwoL);
	winAfterTwoL = winAfterTwoL - (winAfterTwoL%1); 
	return winAfterTwoL + '%';
}

//Looks at winrate immediately following a loss
function doImmediateOne(Sessions){
	//keeps track of the number of wins directly after a loss
	var winAfterLoss=0;
	//keeps track of the total losses that have at least one game after them
	var totalAfterLoss=0;

	for (i in Sessions){
		//if there's at least two games in the session
		if (Sessions[i].length >1){
			//don't want to check after losses if they are the final game in the session
			for (var j = Sessions[i].length-1;j>=1;j--){
				//check if after a loss...
				if (Sessions[i][j]===false){
					//the player won the next one
					if (Sessions[i][j-1]===true){
						winAfterLoss++;
					}
					totalAfterLoss++;
				}
			}
		}
	}
	if (totalAfterLoss===0){
		return "Not Enough Data";
	}
	winAfterLoss= ((winAfterLoss*100)/totalAfterLoss);
	winAfterLoss= winAfterLoss - (winAfterLoss%1); 
	return winAfterLoss + '%';
}





//STILL NEEDS WORK
//Looks to see if losing two games in the middle of a play session negatively affects winrate afterwards
function doPivotTwo(Sessions){
	for (i in Sessions){
		//we want there to be at least four games "XLLY"
		if (Sessions[i].length>3){
			
			//don't want to the first or last game to be included in our "LL" check
			for (var j = Sessions[i].length-2; j>=1;j--){
				//Looking at the first LL sequence, chronologically
				if(Sessions[i][j]===false && Sessions[i][(j-1)]===false){

				}
			}
		}
	}


}
//STILL NEEDS WORK
//Looks at a loss in the middle of the play session to compare winrate before and after the loss
function doPivotOne(Sessions){
	//total number of wins before the loss pivot
	var beforeWins=0;
	var beforeTotal=0;
	var afterWins=0;
	var afterTotal=0;
	for (i in Sessions){
		//We want there to be at least three games XLY
		if (Sessions[i].length>2){
				//if even-lengthed play session
				if (Sessions[i].length%2===0){
					//use Math.floor(Sessions[i].length/2) -1 as the pivot (length 6= pivot at 2) 
				}
				//odd play session, so Math.floor(Sessions[i].length/2) will suffice
				else{

				}
		}
	}
}


//function that returns the average winrate in play sessions after losing 2/3 first games
function doTwoThirdsLoss(Sessions){
	var twoThirds =0;
	var twoThirdsTotal=0;
	//number of times this happens
	var num=0;
	//console.log(Sessions);
	for (i in Sessions){
		//if at least four games were played in a row
		if (Sessions[i].length >3){
			//if they lost two of their first three games in the sessions
			var count=0;
			for (var j =Sessions[i].length-1; j>=Sessions[i].length-3; j--){
				
				if (Sessions[i][j]===true){
					count++;
				}
			}
			//if one win happens during the first three games
			if (count===1){
				//loop through the remaining games
				for (var j = Sessions[i].length-4; j>= 0; j--){
					if (Sessions[i][j]===true) {
						twoThirds++;
					}
					twoThirdsTotal++;
				}
				num++;
			}
			//tally the reamining wins and losses from the session
		}
	}
	//calculate winrate for the remainder of the play sessions after losing the first game
	twoThirds=((twoThirds*100)/twoThirdsTotal);
	//shave off decimals
	twoThirds= twoThirds - (twoThirds%1);
	if (twoThirdsTotal===0){
		return "Not Enough Data";
	}
	return twoThirds+ "% with a sample size of "+num+" sessions.";
}
//NOT USED currently
//function that returns the average winrate in play sessions after losing 1/3 first games
function doOneThirdsLoss(Sessions){
	var oneThirds =0;
	var oneThirdsTotal=0;
	//console.log(Sessions);
	for (i in Sessions){
		//if at least four games were played in a row
		if (Sessions[i].length >3){
			//if they lost two of their first three games in the sessions
			var count=0;
			for (var j =Sessions[i].length-1; j>=Sessions[i].length-3; j--){
				
				if (Sessions[i][j]===true){
					count++;
				}
			}
			//if one win happens during the first three games
			if (count===1){
				//loop through the remaining games
				for (var j = Sessions[i].length-4; j>= 0; j--){
					if (Sessions[i][j]===true) {
						oneThirds++;
					}
					oneThirdsTotal++;
				}
			}
			//tally the reamining wins and losses from the session
		}
	}
	//calculate winrate for the remainder of the play sessions after losing the first game
	twoThirds=((twoThirds*100)/twoThirdsTotal);
	//shave off decimals
	twoThirds= twoThirds - (twoThirds%1);
	if (twoThirdsTotal===0){
		return "Not Enough Data";
	}
	return twoThirds+ "%";
}

//function that returns the average winrate in play sessions after losing the first three games
function doThreeLoss(Sessions){
	var threeLoss =0;
	var threeTotal =0;
	//console.log(Sessions);
	for (i in Sessions){
		//if at least four games were played in a row
		if (Sessions[i].length>3){
			//if they lost the first three games of their session
			if (Sessions[i][Sessions[i].length-1]===false&&Sessions[i][Sessions[i].length-2]===false&&Sessions[i][Sessions[i].length-3]===false){
				//tally the remaining wins and losses from the session
				for (var j= Sessions[i].length-4; j >= 0; j--) {
					if (Sessions[i][j]===true){
						threeLoss++;
					}
					threeTotal++;
				}
			}
		}
	}
	//calculate winrate for the remainder of the play sessions after losing the first game
	threeLoss=((threeLoss*100)/threeTotal);
	//shave off decimals
	threeLoss= threeLoss - (threeLoss%1);
	if (threeTotal===0){
		return "Not Enough Data";
	}
	return threeLoss+ "%";
}

//function that returns the average winrate in play sessions after losing the first two games
function doTwoLoss(Sessions){
	var twoLoss =0;
	var twoTotal =0;
	//console.log(Sessions);
	for (i in Sessions){
		//if at least three games were played in a row
		if (Sessions[i].length>2){
			//if they lost the first two games of their session
			if (Sessions[i][Sessions[i].length-1]===false&&Sessions[i][Sessions[i].length-2]===false){
				//tally the remaining wins and losses from the session
				for (var j= Sessions[i].length-3; j >= 0; j--) {
					if (Sessions[i][j]===true){
						twoLoss++;
					}
					twoTotal++;
				}
			}
		}
	}
	//calculate winrate for the remainder of the play sessions after losing the first game
	twoLoss=((twoLoss*100)/twoTotal);
	//shave off decimals
	twoLoss= twoLoss - (twoLoss%1);
	if (twoTotal===0){
		return "Not Enough Data";
	}
	return twoLoss+ "%";
}

//function that returns the average winrate in play sessions after losing the first game
function doOneLoss(Sessions){
	//variable to represent average winrate after losing first game in a play session
	var oneLoss =0;
	var oneTotal =0;
	//number of times this occurs
	var num=0;
	//console.log(Sessions);
	for (i in Sessions){
		//if at least two games were played in a row
		if (Sessions[i].length>1){
			//if they lost the first game of their session
			if (Sessions[i][Sessions[i].length-1]===false){
				//tally the remaining wins and losses from the session
				for (var j= Sessions[i].length-2; j >= 0; j--) {
					if (Sessions[i][j]===true){
						oneLoss++;
					}
					oneTotal++;
				}
				num++;
			}
		}
	}
	//calculate winrate for the remainder of the play sessions after losing the first game
	oneLoss=((oneLoss*100)/oneTotal);
	//shave off decimals
	oneLoss= oneLoss - (oneLoss%1);
	if (oneTotal===0){
		return "Not Enough Data";
	}
	return oneLoss + "% with a sample size of "+num+" sessions";
}

//function that outputs the results of all analytic functions
function doAnalysis(Sessions){
console.log(Sessions);
	console.log("Total Winrate: "+ doTotalWinrate(Sessions));
	console.log("If you lose the first game of a ranked session, your average winrate is "+doOneLoss(Sessions) +" for the remaining games.");

	console.log("If you lose the first two games of a ranked session, your average winrate is "+doTwoLoss(Sessions) +" for the remaining games.");

	console.log("If you lose the first three games of a ranked session, your average winrate is "+doThreeLoss(Sessions) +" for the remaining games.");

	console.log("If you lose two of your first three games of a ranked session, your average winrate is "+doTwoThirdsLoss(Sessions)+" for the remaining games");

	console.log('You are '+doLastGame(Sessions)+' likely to end your ranked session on a loss.');
	console.log('Your winrate immediately following a loss is: '+ doImmediateOne(Sessions));
	console.log('Your winrate immediately following two losses is: '+ doImmediateTwo(Sessions));
	//gets winrates for play sessions of 1-5 games longs
	console.log("Your average winrate when playing exactly one game is "+ doSessionLengths(Sessions, 1));
	console.log("Your average winrate when playing exactly two games is "+ doSessionLengths(Sessions, 2));
	console.log("Your average winrate when playing exactly three games is "+ doSessionLengths(Sessions, 3));
	console.log("Your average winrate when playing exactly four games is "+ doSessionLengths(Sessions, 4));
	console.log("Your average winrate when playing exactly five games is "+ doSessionLengths(Sessions, 5));
	console.log("Your average winrate when playing exactly six games is "+ doSessionLengths(Sessions, 6));
	console.log("Your average winrate when playing exactly seven games is "+ doSessionLengths(Sessions, 7));
	console.log("Your average winrate when playing exactly eight games is "+ doSessionLengths(Sessions, 8));
	console.log("Your average winrate when playing exactly nine games is "+ doSessionLengths(Sessions, 9));
	console.log("Your average winrate when playing exactly ten games is "+ doSessionLengths(Sessions, 10));

}

//function that sorts the matches into play sessions via timestamp
var groupTimeStamps = function(matchlist){
	//list of all playsessions
	sortedMatches=[];
	//list of all games in a play session
	playSession=[];
	//for each match
	var length = matchlist.length-1;
	//if (length>100){
	//	length=100;
	//}
	for (var i =0; i < length; i++){
		console.log(matchlist[i].matchId);
		//add it to a playSession list
		playSession.push(matchlist[i].matchId);
		//if the previous match's timestamp is not within one hour of the current one
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

//function that converts 2D array of Match IDs to 2D array of true(wins) and false (losses)
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
		//call Analysis function
	}, function(){doAnalysis(playSesh);});
	
}

//function that helps convertWL by making an API Call for a single match
var getWL= function(game, callback){
	//set game to the request
	sleep.usleep(1200001);
	request('https://na.api.pvp.net/api/lol/na/v2.2/match/'+game+'?api_key=api_key', function (error, response, body){
		var result;
		if(!error && response.statusCode ==200){
			var one= JSON.parse(body);
			//console.log(one.participants);
			console.log(game);
			
			for (var i = 0; i < one.participantIdentities.length; i++) {
				if (one.participantIdentities[i].player.summonerId === summonerID){
					result = one.participants[i].stats.winner;
				}
			}//126237

		}
		callback(result);
	});
	
}
rl.question("summonerID: ", (answer) =>{
summonerID=answer+'';
summonerID=parseFloat(summonerID);

//original API Call for Summoner ID
request('https://na.api.pvp.net/api/lol/na/v2.2/matchlist/by-summoner/'+summonerID+'?rankedQueues=RANKED_SOLO_5x5,TEAM_BUILDER_DRAFT_RANKED_5x5&seasons=PRESEASON3,SEASON3,PRESEASON2014,SEASON2014,PRESEASON2015,SEASON2015,PRESEASON2016,SEASON2016&api_key=api_key', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var jsonBody = JSON.parse(body);
    sleep.usleep(1200001);
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
rl.close();
});