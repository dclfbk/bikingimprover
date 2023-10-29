const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')
const bodyParser = require('body-parser');
const cors=require("cors");
require('dotenv').config()

const app = express()
app.use(bodyParser.json());
app.use(cors());

//FUNCTIONS CALLED AFTER CERTAIN TIME
const {CheckCompleted, UpdateCompleted, GetCompletedQuestions, UpdateOrImport, HandleNotSentData, SendWithMyAccount, UpdateTime} = require("./changesetLogic.js")


//SOCKET
const http = require('http').createServer(app);
const io = require('socket.io')(http,{
	cors: {
	  origins: [process.env.CORS_ORIGIN]
	}
});
//

//AGGIUNGO LE COSE DELL?ALtro sito
const postsRoute = require('./routes/posts');
const changesetRoute = require('./routes/changeset');
const missionsRoute = require('./routes/missions');
const manageImagesRoute = require('./routes/manageImages');
const managePowerUpsRoute = require("./routes/managePowerUps");
const manageBadgesRoute = require("./routes/manageBadges");
const manageShopRoute = require("./routes/manageShop");
const osmRoute = require("./routes/osmCalls")

app.use('/api/missions', missionsRoute);
app.use('/api/posts', postsRoute);
app.use('/api/manageImages', manageImagesRoute)
app.use('/api/managePowerUps', managePowerUpsRoute);
app.use('/api/badgesTable', manageBadgesRoute);
app.use('/api/manageShop', manageShopRoute);
app.use('/api/changeset', changesetRoute);
app.use('/api/osmCalls', osmRoute);

//SOCKET
io.on('connection', (socket) => {
	console.log('A client connected.');
	socket.userSignedUpName = ""
  
	socket.on('disconnect', () => {
	  console.log('A client disconnected.');
	});

	socket.on('setAuthenticatedUsername', (username) => {
		console.log("USERNAMEEEEEEE");
		console.log(username);
		socket.userSignedUpName = username
	});

	socket.on('checkUserOnline', (userId, callback) => {
		const isUserOnline = io.sockets.sockets.has(userId);
		callback(isUserOnline);
	});
});

app.set('io', io);
//

//FUNCTIONS CALLED AFTER A CERTAIN TIME HAS PASSED
async function handleCompleted(route){
	const ids = await CheckCompleted(route);
	if(ids.length!=0){
		console.log(ids)
		await UpdateCompleted(route, ids);
	}
}

async function handleChangesets(route){
	const answers = await GetCompletedQuestions(route);
	if(answers.length!=0){
		console.log(answers)
		const notSent = await UpdateOrImport(route, answers);
		if(notSent.length != 0){
			const data = HandleNotSentData(notSent)
			//console.log(data.toUpdate);
			await SendWithMyAccount(route, data.sendWithMyAccount)
			await UpdateTime(route, data.toUpdate);
		}
	}
}

handleCompleted(process.env.API_URL)
handleChangesets(process.env.API_URL)

//call handleCompleted every 40 minutes
setInterval(() =>{handleCompleted(process.env.API_URL); handleChangesets(process.env.API_URL)}, 40*60*1000);

const port = process.env.PORT || 8080
//app.listen(port)
http.listen(port)
console.log(`app is listening on port: ${port}`)

