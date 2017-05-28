'use strict';

const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');


    try {
        var speech = 'empty speech';



        if (false) {
            var requestBody = req.body;

            if (requestBody.result) {
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

        restService.get('https://pvoutput.org/service/r2/getstatus.jsp?sid=43392&key=solarharvey9kwapi', function (PVresponse){
            return res.json({
                speech: PVresponse,
                displayText: PVresponse,
                source: 'apiai-webhook-sample'
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
