'use strict';
//a version from scratch built using Actions on Google Client Library

process.env.DEBUG = 'actions-on-google:*';
const ApiAiApp = require('actions-on-google').ApiAiApp;

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const FETCH_INFO = 'fetch.info';


// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

// API.AI Contexts/lifespans
const SOLAR = 'solar';
const INFORMATION_GIVEN = 'information-given'
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

const PVoutputParameter = {
  // consider adding more like 'peak'
  POWER: 'power',
  ENERGY: 'energy',
  EFFICIENCY: 'efficiency'
};

const LINK_OUT_TEXT = 'Learn more';
const PVOUTPUT_LINK = 'https://pvoutput.org/';
const NEXT_INFO_DIRECTIVE = 'Would you like to know anything else?';
const CONFIRMATION_SUGGESTIONS = ['Sure', 'No thanks'];

const NO_INPUTS = [
  'I didn\'t hear that.',
  'If you\'re still there, say that again.',
  'We can stop here. See you soon.'
];

exports.PVoutputFullfilment = (request, response) => {
  const app = new ApiAiApp({ request, response });
  
  let requestHeader = JSON.stringify(request.headers)
  console.log('Request headers: ' + requestHeader);
  let requestBody = JSON.stringify(request.body)
  console.log('Request body: ' + requestBody);
  
  function unrecognised (app) {
    
  }
  
  function fetchInfo (app){
    app.ask('Welcome to number echo! Say a number.');
  }
  
  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unrecognised);
  actionMap.set(FETCH_INFO, fetchInfo);
  
  app.handleRequest(actionMap);
}

