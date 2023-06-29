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
	  origins: ['http://localhost:8080']
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

app.use('/missions', missionsRoute);
app.use('/posts', postsRoute);
app.use('/manageImages', manageImagesRoute)
app.use('/managePowerUps', managePowerUpsRoute);
app.use('/badgesTable', manageBadgesRoute);
app.use('/manageShop', manageShopRoute);
app.use('/changeset', changesetRoute);
app.use('/osmCalls', osmRoute);


//here we are configuring dist to serve app files
app.use('/', serveStatic(path.join(__dirname, '/dist')))

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
		if(notSent.lengh != 0){
			console.log("NOT SENT")
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

//


var geom_files = path.join(__dirname,'/pbfFiles');
app.use('/pbfFiles',express.static(geom_files));
console.log(geom_files);

//MAGARI VA

//MIO
//app.use(express.static('public'));
app.use(express.static('public'));
app.get('/we', function(req, res) {
	res.send('hello world');
});

const indexPath = __dirname + '/dist/';
app.get('/', function (req,res) {
	res.sendFile(indexPath + "index.html");
});


 //this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

const port = process.env.PORT || 8080
//app.listen(port)
http.listen(port)
console.log(`app is listening on port: ${port}`)

