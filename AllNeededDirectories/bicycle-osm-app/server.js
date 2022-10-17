const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')
const bodyParser = require('body-parser');
const cors=require("cors");
require('dotenv').config()

const app = express()
app.use(bodyParser.json());
app.use(cors());

//AGGIUNGO LE COSE DELL?ALtro sito
const postsRoute = require('./routes/posts');
const missionsRoute = require('./routes/missions');
const manageImagesRoute = require('./routes/manageImages');
const managePowerUpsRoute = require("./routes/managePowerUps");
const manageBadgesRoute = require("./routes/manageBadges");
const manageShopRoute = require("./routes/manageShop");

app.use('/missions', missionsRoute);
app.use('/posts', postsRoute);
app.use('/manageImages', manageImagesRoute)
app.use('/managePowerUps', managePowerUpsRoute);
app.use('/badgesTable', manageBadgesRoute);
app.use('/manageShop', manageShopRoute);


//here we are configuring dist to serve app files
app.use('/', serveStatic(path.join(__dirname, '/dist')))

//ROBA MIA A CASO

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
//ANCORA MA PIù NUOVO
const indexPath = __dirname + '/dist/';
app.get('/', function (req,res) {
	res.sendFile(indexPath + "index.html");
});
//FIN QUA

 //this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

const port = process.env.PORT || 8080
app.listen(port)
console.log(`app is listening on port: ${port}`)