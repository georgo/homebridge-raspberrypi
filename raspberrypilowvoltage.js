'use strict';
const fs = require('fs');
const homebridgeLib = require('homebridge-lib');
// Internal dependencies
const PiHardware   = require('./pihardware').PiHardware;
const PiLowVoltage = require('./pilwovoltage').PiLowVoltage;

// Module exports
module.exports = {
    RaspberryPiLowVoltage: RaspberryPiLowVoltage
};


function RaspberryPiLowVoltage(log, config) {
    this.log    = log || console;
    this.config = config || {};
    this.name   = config['name'] || 'Raspberry Pi Low Voltage';
}

RaspberryPiLowVoltage.prototype = {
    getServices: function() {
        var piHardware  = new PiHardware(this.log, this.config);
        var infoService = piHardware.getService(hap, 'lowVoltage');

        var mainService = new hap.Service.MotionSensor(this.name);
        mainService.log = this.log;

        var piLowVoltage = new PiLowVoltage(this.log, this.config);
        mainService = piLowVoltage.addService(mainService, hap, FakeGatoHistoryService);
        var lowVoltageHistoryService = piLowVoltage.getHistoryService();

        return [
            infoService,
            mainService,
            lowVoltageHistoryService
        ];
    }
}
