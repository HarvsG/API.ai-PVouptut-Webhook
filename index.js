'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {
    var PVdict = {"date":"","time":"","energy":"","power":"","effeciency":""};
    console.log('hook request');


    try {
        var speech = 'empty speech';



        if (req.body) {
            var requestBody = req.body;

            if (false) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);

        https.get('https://pvoutput.org/service/r2/getstatus.jsp?sid=43392&key=solarharvey9kwapi', function(PVres) {
          PVres.setEncoding('utf8');
          PVres.on('data', function(chunk) {
            var PVoutput = chunk.split(',');
            PVdict.date = PVoutput[0];
            PVdict.time = PVoutput[1];
            PVdict.energy = PVoutput[2];
            PVdict.power = PVoutput[3];
            PVdict.effeciency = PVoutput[6];

            var dataIntent = requestBody.result.paramenters.PVoutputParamenter;
            return res.json({
                speech: "The current " + dataIntent + " output is " + PVdict[dataIntent] + " kilowatts",
                displayText: PVdict.power + "kW, " + PVdict.energy + "kWh today,",
                source: 'apiai-webhook-sample'
        });
          });
        })

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
