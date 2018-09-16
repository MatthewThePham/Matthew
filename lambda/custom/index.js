//TODO 
// MATTHEW: Tech lead, and make sure european has KM units
// MIGUEL : Optimize Reverse geocode if no address if listed
// PAROSH : Mapping calls?

// UNDECIDED : Should have cycling feature, ie if no clinics are found, cycle to hospitals and vise versa.

const Alexa = require('ask-sdk');

//used for a permissions card if the user has not enabled location permission
const PERMISSIONS = ['read::alexa:device:all:address'];

//start of the program 
const LaunchIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    },
    async handle(handlerInput) {
      var outputSpeech = ' Please say the name of the amenity'
      var repromptSpeech = ' Please say the amenity name '

      //generate a consent token for user permission to use their address
        const consentToken = handlerInput.requestEnvelope.context.System.user.permissions
          && handlerInput.requestEnvelope.context.System.user.permissions.consentToken;
          
        //actual code for address fetching  
        if (!consentToken) {
          return handlerInput.responseBuilder
            .speak('Please enable Location permissions in the Amazon Alexa app.')
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
        }

        return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt(repromptSpeech)
        .getResponse();

        
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {

        var speechText = ' Saying, clinic, will show you local clinics. Other places include'
        +' fuel,'
        +' charging station,'
        +' hospital,'
        +' police,'
        +' waste disposal'
        +' cafe,'
        +' library,'
        +' fire station,'
        +' restaurant,'
        +' bank,'
        +' post office,';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const FindIntentHandler = {
  canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;

      return request.type === 'IntentRequest' &&
          request.intent.name === 'FindIntent'
  },
  async handle(handlerInput) {
    //set necessary values to the handlerInput
      const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        //user input aka slots
        let slots = handlerInput.requestEnvelope.request.intent.slots;

        var tempData = '';

        const firstWord = (slots.amenityOne.value ? slots.amenityOne.value : '');
        const secondWord = (slots.amenityTwo.value ? slots.amenityTwo.value : '');
        
        if(secondWord === ''){
          tempData = firstWord;
        }
        else{
          tempData = firstWord + '_' + secondWord;
        }  

      //actual code for address fetching  
      try {
        //there is a consent token and we are fetching the user address
        const { deviceId } = requestEnvelope.context.System.device;
        const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
        const address = await deviceAddressServiceClient.getFullAddress(deviceId);
  
        console.log('Address successfully retrieved, now responding to user.');
  
        let response;

        //if the user has not put anything in these address text field yet
        if (address.addressLine1 === null && address.city === null) {

          response = responseBuilder
            .speak('It looks like you don\'t have an address set. You can set your address from the companion app.')
            .getResponse();

        } 
        //the user has put their address in the text field
        else {
          var arrayOfData = await Punction(address.addressLine1, address.city, tempData)
          
          var messageOut = arrayOfData[0]
          var counter = arrayOfData[1]
          var closePlace = arrayOfData[2]
          var firstNSecond = firstWord + ' ' + secondWord

          if(counter == 0){
            //no data is fetched
            var outputSpeech = ' I found ' + counter + ' ' + firstNSecond
            + ' in your area. Sorry, for the inconvenience. '
          }  
          else if(counter == 1){
            //there is only one node data fetched
            var outputSpeech = ' I found ' + counter + ' ' + firstNSecond
            + ' in your area. The closest' + firstNSecond + ' is' +  closePlace
            +  ' .I sent a display card with more details to your Alexa app.'
          }
          else{
            //there is more tha one node data fetched
            var outputSpeech = ' I found ' + counter + ' ' + firstNSecond
            + ' in your area. The closest' + firstNSecond + ' is' +  closePlace
            +  ' .I sent a display card with more locations and details to your Alexa app.'
          } 

          response = responseBuilder
            .speak(outputSpeech)
            .withStandardCard(firstNSecond,messageOut)
            .getResponse();
        }
        return response;
      
      } 
      //there is some sort of error when fetching the address
      catch (error) {
        if (error.name !== 'ServiceError') {
          const response = responseBuilder
            .speak('Uh Oh. Looks like something went wrong.')
            .getResponse();
            return response;
        }
        throw error;
      }
      
      
  },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = ' Goodbye, I hope our skill helped. ';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const GetAddressError = {
    canHandle(handlerInput, error) {
      return error.name === 'ServiceError';
    },
    handle(handlerInput, error) {
      if (error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(messages.LOCATION_FAILURE)
        .reprompt(messages.LOCATION_FAILURE)
        .getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error handled:' + error) ;

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say the name of the amenity. An example would be saying,'
              + 'clinic, to see all clinics in your area. ')
            .reprompt('Sorry, I can\'t understand the command. Please say the name of the amenity. An example would be saying,'
            + 'clinic, to see all clinics in your area. ')
            .getResponse();
    },
};

/********** MAIN FUNCTION HERE **************/

//This function parses out the whitespaces in the address and city, and calls the getRemoteData() function for geocoding
// after geocoding, the lat and lng are stored as variables. These variables are passed into the 
// overpass query and the address info is recieved. Reverse geocoding is also done, if no address is listed.
async function Punction(address, city, place)
{
  var amenity = place

  var longitude = ''
  var latitude = ''
  var listOfFuel = ''
  var newAddress = ''
  var newAddress = ''
  var counter = 0
  var listToReturn = []
  var distanceList = []
  var outputSpeak = ''

  var forwardGeocode = ''
  var overpassString = ''

    //format string algorithm
  address = address.replace(/ /g,'+')
  city = city.replace(/ /g,'+')


  //Change this to formatted string to look like "410+Terry+Ave+North,Seattle"
  newAddress = address + ',' + city
    
  //Supported by OSM nomatim, stated their wiki page, and uses OSM data
  //Opencagedata 2,500 requests/day 
  forwardGeocode = "https://api.opencagedata.com/geocode/v1/json?q="
    + newAddress
    + '&key=5207b6bca04849738781981bbab1b875&pretty=1'; 
    

    //this geocodes the user address
    await getRemoteData(forwardGeocode)                                                                        //mapQuestGeoCode getting used
      .then((response) => {
        var data = JSON.parse(response);

        //json data stored into lat and lng
        latitude = data.results[0].geometry.lat
        longitude = data.results[0].geometry.lng
        
      })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      })

    //Overpass/openstreetmap is open source data so no limit in request.
     overpassString = "http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22"
    + amenity                     //this is the place/destination you want to find
    + "%22](around:16093.4,"    //this is roughly 10 miles
    + latitude + ',' + longitude //this is the actual lat, lon
    + "););out;%3E;";
    

      //this is a query to overpass api to get locations
      await getRemoteData(overpassString)
      .then(async (response) => {
        var data = JSON.parse(response);
      
        //could optimize code with mapping
        //gets 5 nodes and stores them into a list. Checks to make sure a name is present and not undef.
        for (let i = 0; i < 5; i++) {  
          if(data.elements[i].tags.name != undefined)
          {                                                                           
            counter++;

            var tempDistance = distanceFormula(latitude, longitude, data.elements[i].lat, data.elements[i].lon);
            //---------------------------------------------------------------------------------------------------
            distanceList.push(data.elements[i].tags.name);
            distanceList.push(distanceFormula(latitude, longitude, data.elements[i].lat, data.elements[i].lon));
            //---------------------------------------------------------------------------------------------------

            //adds and formats name of amenity into the string
            //counterSignPost method is used to convert 1 to first, 2 to second, etc. for formatting
            listOfFuel = listOfFuel + counterSignPost(counter) + ' ' + amenity + ' is ' + data.elements[i].tags.name 
            + ', Located '+ tempDistance.toFixed(2) + ' miles from your area, ';

            if(data.elements[i].tags['addr:housenumber'] != undefined && data.elements[i].tags['addr:street'] != undefined && data.elements[i].tags['addr:city'] != undefined)
            {
              //if housenumber, street, and city are present, then add to the string
              listOfFuel = listOfFuel + ', Address is ' + data.elements[i].tags['addr:housenumber'] + ' ' + data.elements[i].tags['addr:street'] + ', ' + data.elements[i].tags['addr:city'];
            } else
            {
              //add lat and long to the string listoffuel instead of actual address if not present
             var tempAddress = await reverseGeocode(data.elements[i].lat,data.elements[i].lon)
             listOfFuel = listOfFuel + ', Address is ' + tempAddress

             // listOfFuel = listOfFuel + ', located at longitude ' + data.elements[i].lon + ' and latitude ' + data.elements[i].lat;
            }
            if(data.elements[i].tags.phone != undefined)
            {
              //adds phone number to the string
              listOfFuel = listOfFuel + '. Phone number is ' + data.elements[i].tags.phone;
            }

          }
        }
      })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      })
          
   let tempArray = findMin(distanceList) 
   outputSpeak = ', ' + tempArray[0] + ' , and will be ,' + tempArray[1].toFixed(2) + ', miles away'

  //adds the string and the counter to the array
   listToReturn.push(listOfFuel);
   listToReturn.push(counter);
   listToReturn.push(outputSpeak);

    //returns the array with the string and counter
   return listToReturn; 

}

function counterSignPost(counter)
{
  if(counter == 1)
  {return '  The first';}
  else if(counter == 2)
  {return '  \n The second';}
  else if(counter == 3)
  {return '  \n The third';}
  else
  {return '  \n The next';}
}

//------------------------------------------HELPER FUNCTIONS---------------------------------------------------------
function distanceFormula(lat1, lon1, lat2, lon2)
{
  var RadiusOfEarth = 6371; // in KM
  var dLat = degToRad(lat2-lat1); 
  var dLon = degToRad(lon2-lon1); 

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

  var c = RadiusOfEarth * b; // in KM

  var milesConversion =  0.621 * c // c is in kilometers
  return milesConversion
  //return c;
}

function degToRad(deg)
{
  return deg * (Math.PI/180)
}

function findMin(array){
  var returnArray = []

  var minimum = array[1];
  var nameOfmin = '';

for (let i = 0; i < array.length; i++)
  {
    //means the number odd ake lat and lng
    if(minimum > array[i] && i % 2 == 1)
    {
      minimum = array[i];
      nameOfmin = array[i-1];
    }


  }
  returnArray.push(nameOfmin)
  returnArray.push(minimum)

  return returnArray
  //return minimum;
}

async function reverseGeocode(lats, lngs){

 //Supported by OSM nomatim, stated their wiki page, and uses OSM data
 //Opencagedata 2,500 requests/day (need to do a lot of reverse geocoding compared to geocoding)
//https://api.opencagedata.com/geocode/v1/json?q=33.682028+-112.085437&key=5207b6bca04849738781981bbab1b875
var request = 'https://api.opencagedata.com/geocode/v1/json?q='
+ lats + '+' + lngs
//+ '33.682028' + '+' + '-112.085437'
+ '&key=5207b6bca04849738781981bbab1b875'; 

/*
 //Supported by OSM nomatim, stated their wiki page, and uses OSM data
// locationiq 10,000 requests/day (need to do a lot of reverse geocoding compared to geocoding)
 var request = 'https://us1.locationiq.com/v1/reverse.php?key=acf10b082a8c72&'
  +  'lat=' + lats + '&lon=' + lngs
 //+ 'lat=LATITUDE&lon=LONGITUDE'
 + '&format=json'
 */

var returnString = '';

  await getRemoteData(request)                                                                       
  .then((response) => {
    var data = JSON.parse(response);


  //json data stored into lat and lng
  let street = data.results[0].components.road
  let city = data.results[0].components.city
    if(city == undefined){ city = '' }

    returnString = street + ',' + city

 // returnString = data.display_name   //THIS IS FOR locationiq. Only 2 addresses are fetched?
    
  })
  .catch((err) => {
    //set an optional error message here
    //outputSpeech = err.message;
  })

  return returnString

}

//This will create a proper web API call using https, checking for different protocol errors
//For all the types of protocol errors, refer to https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
//R
async function getRemoteData (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {	//this says if there a problem with the request give out error 
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

//-------------------------------------HELPER FUNCTIONS--------------------------------------------------------------

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchIntentHandler,
        FindIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(GetAddressError,ErrorHandler)
    .lambda();
