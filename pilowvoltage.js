'use strict';
const run = require('child_process').spawnSync;
const moment = require('moment');

// HAP
var Characteristic;

// Main service
var mainService;

// Module exports
module.exports = {
    PiLowVoltage: PiLowVoltage
};


// Raspberry Pi Low Voltage Warning
function PiLowVoltage(log, config) {
    // Configuration values
    config              = config || {};
    this.log            = log || console;
    this.name           = config['name'] || 'Raspberry Pi';
    this.gpiocmdPath    = config['gpiocmdPath'] || '/usr/bin/gpio';
    this.gpioPin        = ('gpioPin' in config ? parseInt(config['gpioPin']) : 35);
    this.historyService = null;
    this.interval       = ('interval' in config ? parseInt(config['interval']) : 30);
}

PiLowVoltage.prototype = {
     // Read information about Low Voltage Warning
    getWarning: function() {
        // Low Voltage Warning
        try {
            var output = run(this.gpiocmdPath, ['-g', 'read', this.gpioPin], {encoding: 'utf-8'});
            if (output.status != 0) {
                // Error occured
                throw output.error;
            }
            // Get GPIO pin status (1 = Voltage OK, 0 = Low Voltage Warning)
            var voltageOk = output.stdout;
            var warning = (voltageOk == 0);
            this.log(this.name +" low voltage warning is: "+ (warning ? 'on' : 'off'));
            this.addHistory(warning);
            mainService
                .getCharacteristic(Characteristic.MotionDetected)
                .updateValue(!warning, undefined, undefined);
        } catch(ex) {
            this.log.error("Error occured during getting low voltage warning.");
            this.log.error(ex);
        }

        // Refresh periodically
        setTimeout(this.getWarning.bind(this), (this.interval) * 1000);
    },
    // Add voltage warning to history
    addHistory: function(warning) {
        this.historyService.addEntry({
            time: moment().unix(),
            status: warning
        });
    },
    // Add homebridge voltage service
    addService: function(mainService, hap, FakeGatoHistoryService) {
        mainService    = _mainService;
        Characteristic = hap.Characteristic;
        // Add Low Voltage Warning service
        voltageService
            .addCharacteristic(Characteristic.MotionDetected);

        // Low Voltage Warning history
        this.historyService = new FakeGatoHistoryService('motion', voltageService);

        // Initially get metrics
        this.getWarning();

        return mainService;
    },
    // Returns history service
    getHistoryService: function() {
        return this.historyService;
    }

}
