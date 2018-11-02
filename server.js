const express = require('express')
const app = express()
const axios = require('axios')
const fs = require('fs')

const chat_id = process.env.CHAT_ID
const botToken = process.env.BOT_TOKEN
const port = process.env.PORT ? process.env.PORT : 3000


const telegram = `https://api.telegram.org/bot${botToken}`
const sendMapEndpoint = `${telegram}/sendLocation?live_period=43200&chat_id=${chat_id}`
const updateMapEndpoint = `${telegram}/editMessageLiveLocation?chat_id=${chat_id}` 
const sendMessageEndpoint = `${telegram}/sendMessage?chat_id=${chat_id}`
const trackingTime = 3600000; // 1 hour
let isTracking = false;
let trackingTimeout = null; // To stop the tracking
let message_id = -1
let location = {
	lat: null,
	lng: null
}
// Send location to this endpoint
app.get('/l/:lng/:lat', async (req, res) => {
	// If location received is the same, we'll just ignore,
	if(location.lat == req.params.lat && location.lng == req.params.lng) {
		res.send("Same")
		return
	}

	// If there is a change we update the location
	location = {
		lat: req.params.lat,
		lng: req.params.lng
	}

	// Check if isTracking is set, we will send an updated map
	if(isTracking) {
		try {
			await axios(`${updateMapEndpoint}&longitude=${location.lng}&latitude=${location.lat}&message_id=${message_id}`)
		} catch(err) {
			console.log(err)
		}
	}

	fs.appendFileSync(`${__dirname}/log.txt`, `${new Date().getTime()},${req.params.lng},${req.params.lat}`)
	console.log(`${new Date().getTime()}: ${req.params.lng},${req.params.lat}`)
	res.send('Received')
})

// When the tracker comes online send initial position
// Update message_id
app.get('/start', async (req, res) => {
	await axios(`${sendMessageEndpoint}&text=Tracker%20Online`)
	res.send("Online")
})

app.get('/stop', (req, res) => {
	clearTimeout(trackingTimeout)
	res.send("Stopped")
})

// Tracking will auto stop after an hour or explicitly through the /stop endpoint
// Track will just keep updating the map if the location has been updated
app.get('/track', async (req, res) => {
	isTracking = true;
	let response = (await axios(`${sendMapEndpoint}&longitude=${location.lng}&latitude=${location.lat}`)).data.result
	message_id = response.message_id

	trackingTimeout = setTimeout(() => {
		isTracking = false;
		console.log("Tracking stopped")
	}, trackingTime) 

	res.send("Tracking")
})

// Create log file upon startup
fs.closeSync(fs.openSync(`${__dirname}/log.txt`, 'a'))

app.listen(port, () => console.log(`Tracker Server listening on port ${port}!`))