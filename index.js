'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {
    var PVdict = {"date":"","time":"","energy":"","power":"","effeciency":""};
    var PVmessagesDict = {};
    console.log('hook request');


    try {

        if (req.body) {
            var requestBody = req.body;
        }

        https.get('https://pvoutput.org/service/r2/getstatus.jsp?sid=43392&key=solarharvey9kwapi', function(PVres) {
          PVres.setEncoding('utf8');
          PVres.on('data', function(chunk) {
            var PVoutput = chunk.split(',');
            PVdict.date = PVoutput[0];
            PVdict.time = PVoutput[1];
            PVdict.energy = PVoutput[2];
            PVdict.power = PVoutput[3];
            PVdict.effeciency = (PVoutput[6]*100).toString();

            PVmessagesDict = {
                "date":"",
                "time":"",
                "energy": PVdict.energy + " watt hours have been produced so far today",
                "power":"The current power output is " + PVdict.power + " watts",
                "effeciency":"The solar array is currently outputting at  " + PVdict.effeciency + " percent of capacity"};

            var dataIntent = requestBody.result.parameters.PVoutputParameter;
            return res.json({
                speech: PVmessagesDict[dataIntent],
                displayText: PVdict.power + "kW, " + PVdict.energy + " kWh today",
                source: 'pvoutput-via-apiai-webhook-sample'
            });
          });
      });

    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
