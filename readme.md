# Project NearMe
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)

### Hackaton 
* [Alexa Tech For Good Hackaton](https://alexatechforgood.devpost.com/)

### Links 
* [console for Alexa](https://developer.amazon.com/alexa/console/ask_)
* [AWS Lambda backend](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions)


## mapquest geolocation API Doc
* https://developer.mapquest.com/documentation/geocoding-api/

### Example call:
``` https://www.mapquestapi.com/geocoding/v1/address?key=KEY&inFormat=kvp&outFormat=json&location=Denver%2C+CO&thumbMaps=false ``` 
where key=KEY will be the actual mapquest API key


## overpass query API Doc
* https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide

### Example call:
``` http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22fuel%22](around:8046.72,39.738453,-104.984853););out;%3E; ``` 
where around(around:8046.72,39.738453,-104.984853) has a parameter of 5 miles (8046.72 meters). 
 Lat will be 8046.72,39.738453 and Lng will be -104.984853
