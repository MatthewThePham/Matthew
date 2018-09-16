# Project NearMe
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)
[![region](https://img.shields.io/badge/Region-US%2C%20UK%2C%20CA-green.svg)](https://img.shields.io/badge/Region-US%2C%20UK%2C%20CA-green.svg)


## About project 
Our team of 3 engineers decided on creating a skill which can help people who 
are in rush and need the nearest location, such as a hospital, all using your voice. Simply ask for the area of interest,
and an Alexa card will be sent onto your phone, containing the place name and address.

This project was created for the [Alexa Tech For Good Hackaton](https://alexatechforgood.devpost.com/)
and will be submitted in order to hopefully obtain the best use of category of open source data.

We will try and support 
fuel,
charging station,
clinic,
hospital,
police,
waste disposal,
cafe,
library,
fire station,
restaurant,
bank,
post office

[Other places that can be added](https://wiki.openstreetmap.org/wiki/Key:amenity)

### Video Demo
Here is the [Devpost link](https://devpost.com/software/test-ja56sd) with a video demo of our skill.

### Links 
* [Alexa Tech For Good Hackaton](https://alexatechforgood.devpost.com/)
* [console for Alexa](https://developer.amazon.com/alexa/console/ask_)
* [AWS Lambda backend](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions)
* [Private policy of skill](https://sites.google.com/view/projectnearme/home)

* [Opencagedata Open Geocoding API Demo](https://opencagedata.com/demo)
* [overpass query API Wiki](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example)


## Opencagedata Open Geocoding Example call:
``` https://api.opencagedata.com/geocode/v1/json?q=410%20Terry%20Ave%20North%2CSeattle&key=KEY&language=en&pretty=1 ``` 

where key=KEY will be the actual mapquest API key. 410+Terry+Ave+North will be the address1 and Seattle is the city.
The output will be in a json string.

## overpass query API Example call:
``` http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22fuel%22](around:8046.72,39.738453,-104.984853););out;%3E; ``` 

where around(around:8046.72,39.738453,-104.984853) has a parameter of 5 miles (8046.72 meters). 
Lat will be 8046.72,39.738453 and Lng will be -104.984853

The data=[out:json] will return a json string

## Development of skill
This skill uses the [Alexa Skills Kit SDK 2.0 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) for Alexa skill libraries.
The API resources we used was [Opencagedata](https://opencagedata.com/demo), an official third party provider of OSM Nominatim, for forward/reverse geocoding.
We used the fetched user's lat and lng into an [overpass query](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example) to get selected areas in a 10 mile radius in that location.
Programming language used was Node.js. To use asyc/await in node.js, you must select Node.js version 8.10 during lambda runtime.

### Installation
1. Clone the repository.

	```bash
	$ git clone https://gitlab.com/MatthewPh/ProjectNearMe
	```

2. Navigating into the repository's root folder.

	```bash
	$ cd ProjectNearMe
	```

3. Install npm dependencies by navigating into the `lambda/custom` directory and running the npm command: `npm install --save ask-sdk` for Alexa Skills Kit SDK 2.0 for Node.js.

	```bash
	$ cd lambda/custom
	$ npm install --save ask-sdk
	```
