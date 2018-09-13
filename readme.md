# Project NearMe
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)

### About project 
Our team of 3 engineers decided on creating a skill which can help people who 
are in rush and need the nearest location, such as a hospital, all using your voice. Simply ask for the area of interest,
and an Alexa card will be sent onto your phone, containg the place name and address.

This project was created for the [Alexa Tech For Good Hackaton](https://alexatechforgood.devpost.com/)
and will be submitted in order to hopefully obtain the best use of category of open source data.

We will try and support 
hospital,
shelter,
recycling,
police (police station),
waste_disposal,
bus_station,
library,

[Other places that can be added](https://wiki.openstreetmap.org/wiki/Key:amenity)

### Links 
* [Alexa Tech For Good Hackaton](https://alexatechforgood.devpost.com/)
* [console for Alexa](https://developer.amazon.com/alexa/console/ask_)
* [AWS Lambda backend](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions)

* [mapquest Open Geocoding API Doc](https://developer.mapquest.com/documentation/open/geocoding-api/)
* [overpass query API Doc](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example)


## mapquest geolocation API Example call:
``` http://open.mapquestapi.com/geocoding/v1/address?key=XSrWCuhRGcPPEYkYWIfwjIisN2vMyGct&location=410+Terry+Ave+North,Seattle ``` 

where key=KEY will be the actual mapquest API key. 410+Terry+Ave+North will be the address1 and Seattle is the city.

The output will be in a json string.

## overpass query API Example call:
``` http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22fuel%22](around:8046.72,39.738453,-104.984853););out;%3E; ``` 

where around(around:8046.72,39.738453,-104.984853) has a parameter of 5 miles (8046.72 meters). 
Lat will be 8046.72,39.738453 and Lng will be -104.984853

The data=[out:json] will return a json string