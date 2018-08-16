const Alexa = require('ask-sdk');

const PERMISSIONS = ['read::alexa:device:all:address'];

const LaunchIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
       // const requestEnvelope = handlerInput.requestEnvelope;

        var outputSpeech = ' Welcome, to Gas Me. Did you know that digestion begins in the mouth? ';
        var repromptSpeech = ' Would you like me to gas you? ';

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
        


        return handlerInput.responseBuilder
            .speak(outputSpeech + address )
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
        //const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        var speechText = ' These are some commands in the app';
        const repromptSpeech = ' These are some commands in the app ';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard(speechText,repromptSpeech)
            .reprompt(repromptSpeech)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = ' Cya later';

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
           // .speak('Error handled: ' + error.message)
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};



const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(GetAddressError,ErrorHandler)
    .lambda();