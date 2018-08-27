/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const PERMISSIONS = ['read::alexa:device:all:address'];


const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

    let outputSpeech = 'This is the default message.';
    var longitude ='';
    var latitude='';
    var listOfFuel= '';

    var nominalString = "https://nominatim.openstreetmap.org/search?q=";
   // + "2902+West+Diana+avenue,+phoenix" + //this is the address
    var formatTypee = "&format=jsonv2&polygon=1&addressdetails=1";

    var overpassString = "http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22fuel%22]"
    + "(around:8046.72,"    //this is roughly 5 miles
    //+ "33.562883566207,-112.121428707594" + //this is the actual lat, lon
    var overpassOut = "););out;%3E;";

    //this fetches the user address
    const consentToken = requestEnvelope.context.System.user.permissions
    && requestEnvelope.context.System.user.permissions.consentToken;

  if (!consentToken) {
    return responseBuilder
      .speak('Please enable Location permissions in the Amazon Alexa app.')
      .withAskForPermissionsConsentCard(PERMISSIONS)
      .getResponse();
  }
  try {
    const { deviceId } = requestEnvelope.context.System.device;
    const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
    const address = await deviceAddressServiceClient.getFullAddress(deviceId);

    console.log('Address successfully retrieved, now responding to user.');

    let response;
    if (address.addressLine1 === null && address.stateOrRegion === null) {
      response = responseBuilder.speak('It looks like you don\'t have an address set. You can set your address from the companion app.').getResponse();
    } else {
      const ADDRESS_MESSAGE = `${'Here is your full address:' + address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
      address.addressLine1 = address.addressLine1.replace(/\s/g, "+"); //will replace all white spaces with +

      response = responseBuilder.speak(ADDRESS_MESSAGE).getResponse();
    }
    return response;
  } catch (error) {
    if (error.name !== 'ServiceError') {
      const response = responseBuilder.speak('Uh Oh. Looks like something went wrong.').getResponse();
      return response;
    }
    throw error;
  }

    //this geocodes the user address
    await getRemoteData('https://nominatim.openstreetmap.org/search?q=2902+West+Diana+avenue,+phoenix&format=jsonv2&polygon=1&addressdetails=1')
      .then((response) => {
        const data = JSON.parse(response);
        latitude = data[0].lat;
        longitude = data[0].lon;
        //outputSpeech = "The latitude is " + data[0].lat + " The longitude is " + data[0].lon;        
      })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      });

      //this is a query to overpass api to get locations
      await getRemoteData('http://overpass-api.de/api/interpreter?data=[out:json];(node[%22amenity%22=%22fuel%22](around:8046.72,33.562883566207,-112.121428707594););out;%3E;')
      .then((response) => {
        const data = JSON.parse(response);

        for (let i = 0; i < 6; i++) {  //gets 5 nodes
          if(data.elements[i].tags.name != undefined ){
            listOfFuel = listOfFuel + ' , ' + data.elements[i].tags.name;
          }
        }

        outputSpeech = "The latitude is " + latitude + " The longitude is " + longitude + '. The list is '
        + listOfFuel; 

      })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      });


    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();

  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

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
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

//MATTHEW COMMENT refer to https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html for error codess
const getRemoteData = function (url) {
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

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler,GetAddressError)
  .lambda();

