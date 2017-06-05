'use strict';
//a version from scratch built using Actions on Google Client Library

process.env.DEBUG = 'actions-on-google:*';
const ApiAiApp = require('actions-on-google').ApiAiApp;
const https = require('https');
const http = require('http');
const queryString = require('query-string');

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

  //let requestHeader = JSON.stringify(request.headers);
  //console.log('Request headers: ' + requestHeader);
  //let requestBody = JSON.stringify(request.body);
  //console.log('Request body: ' + requestBody);

  function unrecognised (app) {

  }

  function handler (app){

    function fetchInfo (app, service, queryStringArg){
      var PVdict = {"date":"","time":"","energy":"","power":"","efficiency":""};
      var PVmessagesDict = {};
      https.get('https://pvoutput.org/service/r2/'+service+'.jsp' + queryStringArg, function(PVres){
        PVres.setEncoding('utf8');
        PVres.on('data', function(chunk) {
          let PVoutput = chunk.split(',');
          switch (service) {
            case "getstatus":
              PVdict.date = PVoutput[0];
              PVdict.time = PVoutput[1];
              PVdict.energy = (PVoutput[2]/1000).toString();
              PVdict.power = (PVoutput[3]/1000).toString();
              PVdict.efficiency = (PVoutput[6]*100).toString();
              PVmessagesDict = {
                  "":"I am sorry please ask again but specify if you want information about power, energy or efficiency. ",
                  "date":"",
                  "time":"",
                  "energy": "As of "+ PVdict.time +" today. "+ PVdict.energy + " kilowatt hours had been produced. ",
                  "power":"The power output as of " + PVdict.time + " was " + PVdict.power + " kilowatts. ",
                  "efficiency":"The solar array is currently outputting at  " + PVdict.efficiency + " percent of capacity. "};
              break;
            case "getstatistic":
              PVdict.energy = (PVoutput[0]/1000).toString();
              PVdict.energyExported = (PVoutput[1]/1000).toString();
              PVdict.power = (PVoutput[2]/1000).toString();
              PVdict.maxPower = (PVoutput[4]/1000).toString();
              PVdict.efficiency = (PVoutput[5]*100).toString();
              PVdict.recordEfficiency = (PVoutput[9]*100).toString();
              PVdict.fromDate = PVoutput[7];
              PVdict.toDate = PVoutput[8];
              var dateString = "between " + PVdict.fromDate + " and " + PVdict.toDate;
              if (PVdict.fromDate == PVdict.toDate) {
                dateString = "on "+ PVdict.fromDate;
              }
              PVmessagesDict = {
                  "":"I am sorry please ask again but specify if you want information about power, energy or efficiency. ",
                  "date":"",
                  "time":"",
                  "energy": PVdict.energy + " kilowatt hours were produced " + dateString,
                  "power":"The average power output " + dateString + " was " + PVdict.power + " kilowatts. ",
                  "maximumPower" : "The maximum power output " + dateString + " was " + PVdict.power + " kilowatts. ",
                  "efficiency":"The average efficiency of the solar array "+ dateString +" was  " + PVdict.efficiency + " percent of capacity. "};
              break;
            default:

          }
          //makes dataIntent equal to the parameters made but removes duplicates
          let dataIntent = [...new Set(request.body.result.parameters.PVoutputParameter)];

          var speech = "";
          for (var i = 0; i < dataIntent.length; i++) {
              speech += PVmessagesDict[dataIntent[i]];
          }
          app.ask(speech);
        });
      });
    }

    var myQueryString = {
    sid : request.body.result.parameters.SID.SID,
    key : request.body.result.parameters.readOnlyAPIKey,
    };

    switch (request.body.result.parameters.time.length) {
      //no time specified
      case 0:
        let myQueryStringified0 = '?' + queryString.stringify(myQueryString);
        fetchInfo(app, 'getstatus', myQueryStringified0);
        break;
      //just time specified time: 17:30:00
      case 8:
        //pvoutput api does not handle future times very well so we need to check of the time is recent, if it is we will set t to an empty string
        var time1 = request.body.result.parameters.time.slice(0,5);

        let serverDate = new Date();
        var requestDate = new Date();
        requestDate.setHours(parseInt(time1.slice(0,2)));
        requestDate.setMinutes(parseInt(time1.slice(3)));

        let timeLag = serverDate.getTime() - requestDate.getTime()
        if (timeLag <= 600000) {
          myQueryString.t = '';
        } else {
          myQueryString.t = time1;
        }
        let myQueryStringified1 = '?' + queryString.stringify(myQueryString);
        fetchInfo(app, 'getstatus',myQueryStringified1);
        break;
      // just date specified in the format of time: 2014-08-09
      case 10:
        let formattedDate = request.body.result.parameters.time.replace(':','');
        myQueryString.dt = formattedDate;
        myQueryString.df = formattedDate;

        let myQueryStringified2 = '?' + queryString.stringify(myQueryString);
        fetchInfo(app, 'getstatistic',myQueryStringified2);
        break;
      //time periods: 13:30:00/14:30:00
      case 17:
        let myQueryString3 = {
        sid : request.body.result.parameters.SID.SID,
        key : request.body.result.parameters.readOnlyAPIKey,
        t : time1
        };
        let myQueryStringified3 = '?' + queryString.stringify(myQueryString3);
        fetchInfo(app, 'getstatistic',myQueryStringified3);
        break;
      //combined date&time: 2014-08-09T16:30:00Z
      case 20:

        break;
      //date periods: 2014-01-01/2014-12-31
      case 21:

        break;
      //combined date&time period: 2017-02-08T08:00:00Z/2017-02-08T12:00:00Z
      case 41:

        break;
      default:
        fetchInfo(app, 'getstatus');
        break;

  }

  }
  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unrecognised);
  actionMap.set(FETCH_INFO, handler);

  app.handleRequest(actionMap);

};
