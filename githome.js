var request = require('request');
var async = require('async');
var sleep = require('sleep');
var readline = require('readline');
var excelbuilder = require('msexcel-builder');


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
	console.log(total);
	wins= (wins*100)/total;
	wins= wins - (wins%1);
	var answer = [wins+"%", total];
	return answer;
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
	var answer=[wins, total];
	return answer;//" with a sample size of "+ total+ " sessions.";
}

//distill doWinAfterOne,Two,Three into one function 

//function that returns winrate following the first three losses in any play session
function doWinAfterThree(Sessions){
	//tracks number of wins in play sessions after losing three games 
	var winAfterThree=0;
	//tracks total number of games in play sessions after the third loss
	var totalAfterThree=0;
	//tracks how many losses the player has experienced in the current session
	var loss;
	//sample size
	var size=0;
	for (i in Sessions){
		//reset loss number to 0 for the next session
		loss=0;
		for (var j = Sessions[i].length-1; j >0; j--){
			//if the game is a loss and we haven't seen a loss yet in the current session
			if (Sessions[i][j]===false && loss===0){
				loss=1;
			}
			//else if we've already seen a loss in the current session
			else if (Sessions[i][j]===false && loss===1){
				loss=2;
			}
			else if (Sessions[i][j]===false && loss===2){
				loss=3;
				size++;
			}
			//else if we've already seen two losses in the current session
			else if(loss===3){
				//increment winAfterTwo if the player wins
				if (Sessions[i][j]===true){
					winAfterThree++;
				}
				//always increment this after the second loss
				totalAfterThree++;
			}
		}
	}
	var answer = [winAfterThree,totalAfterThree];
	return answer;
}

//function that returns winrate following the two losses in any play session
function doWinAfterTwo(Sessions){
	//tracks number of wins in play sessions after first two losses
	var winAfterTwo=0;
	//tracks total number of games in play sessions after two losses
	var totalAfterTwo=0;
	//tracks how many losses already experienced in the current play session
	var loss;
	//sample size
	var size=0;
	for (i in Sessions){
		//reset loss number to 0 for the next session
		loss=0;
		for (var j = Sessions[i].length-1; j >0; j--){
			//if the game is a loss and we haven't seen a loss yet in the current session
			if (Sessions[i][j]===false && loss===0){
				loss=1;
			}
			//else if we've already seen a loss in the current session
			else if (Sessions[i][j]===false && loss===1){
				loss=2;
				size++;
			}
			//else if we've already seen two losses in the current session
			else if(loss===2){
				//increment winAfterTwo if the player wins
				if (Sessions[i][j]===true){
					winAfterTwo++;
				}
				//always increment this after the second loss
				totalAfterTwo++;
			}
		}
	}
	var answer = [winAfterTwo,totalAfterTwo];
	return answer;
}

//function that returns winrate following the first loss in any play session
function doWinAfterOne(Sessions){
	//tracks number of wins in play sessions after first loss
	var winAfterOne=0;
	//tracks total number of games in play sessions after a loss
	var totalAfterOne=0;
	//boolean to track if we've already seen a loss in the current play session
	var loss;
	//sample size
	var size=0;
	for (i in Sessions){
		loss=0;
		for (var j = Sessions[i].length-1; j >0; j--){
			//if the game is a loss and we haven't seen a loss yet in the current session
			if (Sessions[i][j]===false&&loss===0){
				loss=1;
				size++;
			}
			//else if we've already seen a loss in the current session
			else if(loss===1){
				//increment winAfterOne if the player wins
				if (Sessions[i][j]===true){
					winAfterOne++;
				}
				//always increment this after the first loss
				totalAfterOne++;
			}
		}
	}
	var answer = [winAfterOne,totalAfterOne];
	return answer;
}
//function that returns winrate of the first game if the final game of the previous session was a loss
function doWinAfterBreak(Sessions){
	//tracks the number of wins after a break following a loss
	var winAfterBreak=0;
	//tracks the number of sessions that ended on a loss
	var totalAfterBreak=0;
	for (var i=Sessions.length-1; i >0 ; i--){
		//checks if player lost final game of play session
		if (Sessions[i][0]===false){
			totalAfterBreak++;
			if (Sessions[(i-1)][(Sessions[(i-1)].length-1)]===true){
				winAfterBreak++;
			}
		}
	}
	if (totalAfterBreak===0){
		return "Not Enough Data";
	}
	var answer = [0,winAfterBreak];
	//calculate winning percentage for final game of play session
	winAfterBreak=(winAfterBreak*100)/totalAfterBreak;
	//shave off decimals
	winAfterBreak=winAfterBreak-(winAfterBreak%1);
	answer[0]=winAfterBreak;
	return answer;
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
	var answer =[0,winAfterLoss];
	winAfterLoss= ((winAfterLoss*100)/totalAfterLoss);
	winAfterLoss= winAfterLoss - (winAfterLoss%1); 
	answer[0]=winAfterLoss;
	return answer;
}

//NOT USED YET
//Looks at winrate of next three games following a loss across all play Sessions
function doClusterOne (Sessions){
	var total;
	for (i in Sessions){
		//need at least 4 games to analyze a loss and the three cluster games after that.
		if (Sessions[i].length>3){
			for (var j = Sessions[i].length-1; j >0; j--){
				if (Sessions[i][j]===false){

					total++;
				}
			}
		}
	}
}



//NOT USED YET
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
//NOT USED YET
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
	return twoThirds+ "% (sample size "+num+" sessions)";
}

//function that returns the average winrate in play sessions after losing the first three games
function doThreeLoss(Sessions){
	var threeLoss =0;
	var threeTotal =0;
	//console.log(Sessions);
	var num=0;
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
				num++;
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
	var answer = [threeLoss,num];
	return answer;
}

//function that returns the average winrate in play sessions after losing the first two games
function doTwoLoss(Sessions){
	var twoLoss =0;
	var twoTotal =0;
	//console.log(Sessions);
	var num=0;
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
				num++;
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
	var answer = [twoLoss,num];
	return answer;
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
	var answer = [oneLoss,num];
	return answer;
}
//function that outputs the results of all analytic functions to the Terminal and to an Excel doc
function doAnalysis(Sessions){
	var answer;
	console.log(Sessions);
	var workbook = excelbuilder.createWorkbook('./', summonerID+'.xlsx');
	var sheet1 = workbook.createSheet('sheet1', 20, 20);
	sheet1.set(1,1, "SummonerID");
	sheet1.set(2,1, "Total win-rate");
	sheet1.set(3,1, "Winrate after losing first game");
	sheet1.set(4,1, "Winrate after losing first two games");
	sheet1.set(5,1, "Winrate after losing first three games");
	sheet1.set(6,1, "Winrate following a break after a loss");
	sheet1.set(7,1, "Winrate immediately after a loss");
	sheet1.set(8,1, "Winrate over one-game sessions");
	sheet1.set(9,1, "Winrate over two-game sessions");
	sheet1.set(10,1, "Winrate over three-game sessions");
	sheet1.set(11,1, "Winrate over four-game sessions");
	sheet1.set(12,1, "Winrate over five-game sessions");
	sheet1.set(13,1, "Winrate over six-game sessions");
	sheet1.set(14,1, "Winrate over seven-game sessions");
	sheet1.set(15,1, "Winrate over eight-game sessions");
	sheet1.set(16,1, "Winrate over nine-game sessions");
	sheet1.set(17,1, "Winrate over ten-game sessions");
	sheet1.set(1,3, "Sample Size");

	sheet1.set(1,2,summonerID+'');
	answer = doTotalWinrate(Sessions);
	sheet1.set(2,2, answer[0];
	sheet1.set(2,3, answer[1]);

	answer = doOneLoss(Sessions);
	sheet1.set(3,2,answer[0]+'%');
	sheet1.set(3,3,answer[1]);

	answer = doTwoLoss(Sessions);
	sheet1.set(4,2, answer[0]+'%');
	sheet1.set(4,3, answer[1]);

	answer = doThreeLoss(Sessions);
	sheet1.set(5,2, answer[0]+'%');
	sheet1.set(5,3, answer[1]);

	answer = doWinAfterBreak(Sessions);
	sheet1.set(6,2, answer[0]+'%');
	sheet1.set(6,3, answer[1]);

	answer = doImmediateOne(Sessions);
	sheet1.set(7,2, answer[0]+'%');
	sheet1.set(7,3, answer[1]);
	
	answer=doSessionLengths(Sessions,1);
	sheet1.set(8,2, answer[0]+'%');
	sheet1.set(8,3, answer[1]);

	answer=doSessionLengths(Sessions,2);
	sheet1.set(9,2,answer[0]+'%');
	sheet1.set(9,3,answer[1]);

	answer=doSessionLengths(Sessions,3);
	sheet1.set(10,2,answer[0]+'%');
	sheet1.set(10,3,answer[1]);

	answer=doSessionLengths(Sessions,4);
	sheet1.set(11,2,answer[0]+'%');
	sheet1.set(11,3,answer[1]);

	answer=doSessionLengths(Sessions,5);
	sheet1.set(12,2,answer[0]+'%');
	sheet1.set(12,3,answer[1]);

	answer=doSessionLengths(Sessions,6);
	sheet1.set(13,2,answer[0]+'%');
	sheet1.set(13,3,answer[1]);

	answer=doSessionLengths(Sessions,7);
	sheet1.set(14,2,answer[0]+'%');
	sheet1.set(14,3,answer[1]);

	answer=doSessionLengths(Sessions,8);
	sheet1.set(15,2,answer[0]+'%');
	sheet1.set(15,3,answer[1]);

	answer=doSessionLengths(Sessions,9);
	sheet1.set(16,2,answer[0]+'%');
	sheet1.set(16,3,answer[1]);

	answer=doSessionLengths(Sessions,10);
	sheet1.set(17,2,answer[0]+'%');
	sheet1.set(17,3,answer[1]);
	


	
	//console log
	answer= doTotalWinrate(Sessions);
	console.log("Total Winrate: "+ answer);

	answer=doOneLoss(Sessions);
	console.log("If you lose the first game of a ranked session, your average winrate is "+ doOneLoss(Sessions) + "% for the remaining games.");

	console.log("If you lose the first two games of a ranked session, your average winrate is "+doTwoLoss(Sessions) +" for the remaining games.");

	console.log("If you lose the first three games of a ranked session, your average winrate is "+doThreeLoss(Sessions) +" for the remaining games.");

	//console.log("If you lose two of your first three games of a ranked session, your average winrate is "+doTwoThirdsLoss(Sessions)+" for the remaining games");

	console.log('Following a break after ending a ranked session on a loss, your winrate is '+doWinAfterBreak(Sessions));
	console.log('Your winrate immediately following a loss is: '+ doImmediateOne(Sessions));
	//console.log('Your winrate immediately following two or more losses is: '+ doImmediateTwo(Sessions));
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
	
	console.log(doWinAfterOne(Sessions));
	console.log(doWinAfterTwo(Sessions));
	console.log(doWinAfterThree(Sessions));
	
	//saves Excel spreadsheet
	workbook.save(function(ok){
    	if (!ok) 
    		workbook.cancel();
   		else
    		console.log('congratulations, your workbook created');
	})
};

//function that sorts the matches into play sessions via timestamp
var groupTimeStamps = function(matchlist, time){
	//list of all playsessions
	sortedMatches=[];
	//list of all games in a play session
	playSession=[];
	//for each match
	var length = matchlist.length-1;
	//length=10;
	//variable that stores the split interval between two games
	var split = time*1000;
	//if (length>4000){
	//	length=40;
	//}
	for (var i =0; i < length; i++){
	//	if (matchlist[i].timestamp >1468872000000){
		console.log(matchlist[i].matchId);
		//add it to a playSession list
		playSession.push(matchlist[i].matchId);
		//if the previous match's timestamp is not within one hour of the current one
		if (matchlist[i].timestamp -split > matchlist[i+1].timestamp){
			
			//add the playSession to the list of play sessions
			sortedMatches.push(playSession);
			//reset the playSession list
			playSession=[];
		}
	//}
	}
	return sortedMatches;
}

//function that converts 2D array of Match IDs to 2D array of true(wins) and false (losses)
var convertWL = function(playSesh){
	//for each play session
	async.forEachOfSeries(playSesh, function(currentSession, i, callback){

	 
		
		console.log("Checking play session "+(i+1));
		console.log("There are "+ playSesh[i].length +" games played");

		//Implement asynchronization so secondary API Calls return in-order
			async.forEachOfSeries(playSesh[i], function(game, j, callback2) {
				
				//playSesh[i][j]= getWL(game, callback2);
				getWL(game, function(result){
					//convert into array of results+timestamp. Want to eventually be able to re-group based on different time separations
					playSesh[i][j] = result;
					callback2();
				});
		}, callback);
		//Call Analysis function. Actually want to groupTimeStamps again based on average time for the player
	}, function(){doAnalysis(playSesh);});
	
}

//function that helps convertWL by making an API Call for a single matchID
var getWL= function(game, callback){
	//set game to the request
	
	request('https://na.api.pvp.net/api/lol/na/v2.2/match/'+game+'?api_key=', function (error, response, body){
		sleep.usleep(2000001);
		var result;
		if(!error && response.statusCode ==200){
			var one= JSON.parse(body);
			//console.log(one.participants);
			console.log(game);
			
			for (var i = 0; i < one.participantIdentities.length; i++) {
				if (one.participantIdentities[i].player.summonerId === summonerID){
					result = one.participants[i].stats.winner;
				}

			}
				
		}
		else{
			console.log(response.statusCode, "error", game);
		}
		callback(result);
	});
	
}

//get SummonerID from terminal prompt
rl.question("summonerID: ", (answer) =>{
summonerID=answer+'';
summonerID=parseFloat(summonerID);

//original API Call for Summoner ID
request('https://na.api.pvp.net/api/lol/na/v2.2/matchlist/by-summoner/'+summonerID+'?rankedQueues=RANKED_SOLO_5x5,TEAM_BUILDER_DRAFT_RANKED_5x5&seasons=PRESEASON3,SEASON3,PRESEASON2014,SEASON2014,PRESEASON2015,SEASON2015,PRESEASON2016,SEASON2016&api_key=', function (error, response, body) {
  if (!error && response.statusCode == 200 && body !=undefined) {
    var jsonBody = JSON.parse(body);
    sleep.usleep(2000001);
    
    if (jsonBody.matches!=undefined){
    	if (jsonBody.matches.length <10){
    		console.log("under 100 games played: "+jsonBody.matches.length);
    	}
    
    	else{
   			var sessions = groupTimeStamps(jsonBody.matches, 5400);
    		console.log(sessions.length+ " play sessions");
    		convertWL(sessions);

		}
	}
	else{
		console.log("error, ranked history is undefined");
	}
  }
});
	

rl.close();
});
//}

