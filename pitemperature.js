'use strict';
const run = require('child_process').spawnSync;
const moment = require('moment');

// HAP
var Characteristic, eve;

// Main service
var mainService;

// Module exports
module.exports = {
    RaspberryPiTemperature: RaspberryPiTemperature
};


// Raspberry Pi Temperature
function RaspberryPiTemperature(log, config) {
    // Configuration values
    config              = config || {};
    this.log            = log || console;
    this.name           = config['name'] || 'Raspberry Pi';
    this.vcgencmdPath   = config['vcgencmdPath'] || '/usr/bin/vcgencmd';
    this.historyService = null;
    this.interval       = ('interval' in config ? parseInt(config['interval']) : 3);
}

RaspberryPiTemperature.prototype = {
     // Read information about Raspberry Pi's temperature
    getTemperature: function(callback) {
        try {
            var output = run(this.vcgencmdPath, ['measure_temp'], {encoding: 'utf-8'});
            if (output.status != 0) {
                // Error occured
                throw output.error;
            }
            // Parse firmware version
            var stdout = output.stdout;
            var temp   = stdout.match(/temp=([^']*)'([^$]*)$/);
            // Temperature unit
            mainService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({unit: (temp[2] == 'C') ? Characteristic.Units.CELSIUS : Characteristic.Units.FAHRENHEIT });
            // Temperature
            var temperature = parseFloat(temp[1]) || 0.0;
            this.log(this.name +" temperature is: "+ temperature + " " + temp[2]);
            // Store temperature to history
            this.addHistory(temperature);
            callback(null, temperature);
        } catch(ex) {
            this.log.error("Error occured during getting temperature.");
            this.log.error(ex);
            callback(ex);
        }
    },
    // Set temperature to accessory
    setTemperature: function(ex, temp) {
        if (ex === null) {
            mainService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .updateValue(temp);
        }
    },
    // Add temperature to history
    addHistory: function(temperature) {
        this.historyService.addEntry({
            time: moment().unix(),
            temp: temperature
        });
    },
    // Add homebridge temperature service
    addService: function(_mainService, hap, FakeGatoHistoryService) {
        mainService            = _mainService;
        Characteristic         = hap.Characteristic;
        // Add temperature Service
        mainService
            .addCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                format: Characteristic.Formats.FLOAT,
                minValue: 0,
                maxValue: 120,
                minStep: 0.1
            })
            .on('get', this.getTemperature.bind(this));

        // Temperature history
        this.historyService = new FakeGatoHistoryService('weather', mainService, 4032);
        // Initially get temperature
        this.getTemperature(this.setTemperature);
        // Set interval to get temperature
        setInterval(function() {
             this.getTemperature(this.setTemperature);
        }.bind(this), this.interval * 60 * 1000);

        return mainService;
    },
    // Returns history service
    getHistoryService: function() {
        return this.historyService;
    }
}
