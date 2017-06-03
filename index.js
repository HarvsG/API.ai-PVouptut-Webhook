'use strict';
//a version from scratch built using Actions on Google Client Library

process.env.DEBUG = 'actions-on-google:*';
const ApiAiApp = require('actions-on-google').ApiAiApp;
const https = require('https');

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const FETCH_INFO = 'fetch.info';


// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

// API.AI Contexts/lifespans
const SOLAR = 'solar';
const INFORMATION_GIVEN = 'information-given';
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

  let requestHeader = JSON.stringify(request.headers);
  console.log('Request headers: ' + requestHeader);
  let requestBody = JSON.stringify(request.body);
  console.log('Request body: ' + requestBody);

  function unrecognised (app) {

  }

  function fetchInfo (app){
    var PVdict = {"date":"","time":"","energy":"","power":"","efficiency":""};
    var PVmessagesDict = {};
    https.get('https://pvoutput.org/service/r2/getstatus.jsp?sid=43392&key=solarharvey9kwapi', function(PVres){
      PVres.setEncoding('utf8');
      PVres.on('data', function(chunk) {
        let PVoutput = chunk.split(',');
        PVdict.date = PVoutput[0];
        PVdict.time = PVoutput[1];
        PVdict.energy = (PVoutput[2]/1000).toString();
        PVdict.power = (PVoutput[3]/1000).toString();
        PVdict.efficiency = (PVoutput[6]*100).toString();

        PVmessagesDict = {
            "":"I am sorry please ask again but specify if you want information about power, energy or efficiency. ",
            "date":"",
            "time":"",
            "energy": PVdict.energy + " kilowatt hours have been produced so far today. ",
            "power":"The current power output is " + PVdict.power + " kilowatts. ",
            "efficiency":"The solar array is currently outputting at  " + PVdict.efficiency + " percent of capacity. "};

        var dataIntent = requestBody.result.parameters.PVoutputParameter;
        var speech = "";
        for (var i = 0; i < dataIntent.length; i++) {
            speech += PVmessagesDict[dataIntent[i]];
        }
        app.ask(speech);
      })
    })
  }
  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unrecognised);
  actionMap.set(FETCH_INFO, fetchInfo);

  app.handleRequest(actionMap);

}
