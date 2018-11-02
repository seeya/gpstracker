# GPSTracker
Keep track of GPS module current location. Uses telegram's bot live location to have an updated view of current location of GPS module

# Introduction
This project uses a GPS module (Beitian BN-220 in my case) and a python script to constantly send its location to a server. 
The idea is to send the location to the server and let the server do the processing. 

# Server
Currently the server receives the location at the endpoint `l/:lng/:lat`. The flag `isTracking` is also used to send an updated location to `Telegram` bot api. This allows a live view of the module's current location.

In order to start the tracking, the endpoint `/track` has to be called. The tracking has a timeout of `1 hour` and can be stopped calling the `/stop` endpoint at any time.

# Logging
Upon every new location received, an entry will be appened to the `log.txt` file in the project directory.
