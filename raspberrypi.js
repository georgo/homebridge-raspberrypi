'use strict';
const fs = require('fs');
const homebridgeLib = require('homebridge-lib');
// Internal dependencies
const PiHardware    = require('./pihardware').PiHardware;
const PiTemperature = require('./pitemperature').PiTemperature;
const PiVoltage     = require('./pivoltage').PiVoltage;

// Module exports
module.exports = {
    RaspberryPi: RaspberryPi
};


function RaspberryPi(log, config) {
    this.log    = log || console;
    this.config = config || {};
    this.name   = config['name'] || 'Raspberry Pi';
}

RaspberryPi.prototype = {
    getServices: function() {
        var piHardware  = new PiHardware(this.log, this.config);
        var infoService = piHardware.getService(hap);

        var mainService = new myhomekit.Service.Resource(this.name);
        mainService.log = this.log;

        var piTemperature = new PiTemperature(this.log, this.config);
        mainService = piTemperature.addService(mainService, hap, FakeGatoHistoryService);
        var temperatureHistoryService = piTemperature.getHistoryService();

        var piVoltage = new PiVoltage(this.log, this.config);
        mainService = piVoltage.addService(mainService, hap, eve);

        return [
            infoService,
            mainService,
            temperatureHistoryService
        ];
    }
}
