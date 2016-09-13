import requests
import time

api_key = 'deff85ac-e3f6-4510-9c17-de9a1320bdfe'
region = 'na'

#not implemented yet
def doAnalysis(playSessions):
	return 0

def groupPlaySessions(matches):
	playSessions = []
	oneSession = []
	for i in matches:
		if len(oneSession)==0:
			oneSession.append(i)
		elif (oneSession[-1]['timestamp']-3600000 > i['timestamp'] ):
			playSessions.append(oneSession)
			oneSession=[]
		else:
			oneSession.append(i)
	return playSessions

#Looks up whether the player 
def addResults(allSessions, sum_id):
	for session in allSessions:
		for match in session:
			game=getResult(match)
			for i in range (len(game['participantIdentities'])-1):
				if str(game['participantIdentities'][i]['player']['summonerId'])==sum_id:
					print game['participants'][i]['stats']['winner'], game['participantIdentities'][i]['player']['summonerId']
					match['winner']=game['participants'][i]['stats']['winner']
					print match['winner']
	return allSessions

#Returns a JSON Object from the Riot API containing the result of a single match
def getResult(match):
	response = requests.get('https://na.api.pvp.net/api/lol/na/v2.2/match/'+str(match['matchId'])+'?api_key='+api_key)
	time.sleep(1.21)
	status = response.status_code
	while response.status_code == 429:
		time.sleep(4)
		print "still trying", response.status_code
		response = requests.get('https://na.api.pvp.net/api/lol/na/v2.2/match/'+str(match['matchId'])+'?api_key='+api_key)	
		status= response.status_code
	#print response.status_code 
	if response.status_code == 429:
		print 'bad data'
	#need to add win/loss to match here
	return response.json()

#returns JSON Object from the Riot API containing a full list of the player's ranked history
def getRankedHistory(sid):
	response = requests.get('https://'+region+'.api.pvp.net/api/lol/na/v2.2/matchlist/by-summoner/'+sid+'?rankedQueues=RANKED_SOLO_5x5,TEAM_BUILDER_DRAFT_RANKED_5x5&seasons=PRESEASON3,SEASON3,PRESEASON2014,SEASON2014,PRESEASON2015,SEASON2015,PRESEASON2016,SEASON2016&api_key='+api_key)
	time.sleep(1.21)
	return response.json()

#returns JSON Object with the Summoner's ID. Uses their summoner name for the look-up
def getSumID(name):
	response = requests.get('https://'+region+".api.pvp.net/api/lol/na/v1.4/summoner/by-name/"+name+"?api_key="+api_key)
	time.sleep(1.21)
	return response.json()

def main():
	sum_name= str(raw_input("Input your summoner name: "))
	sum_name=sum_name.replace(" ","").lower()
	
	profile=getSumID(sum_name)
	sum_id= str(profile[sum_name]['id'])

	history = getRankedHistory(sum_id)
	groupedSessions=groupPlaySessions(history['matches'])
	groupedSessions=addResults(groupedSessions,sum_id)
	print groupedSessions
	#doAnalysis(groupedSessions)

	
if __name__=="__main__":
	main()