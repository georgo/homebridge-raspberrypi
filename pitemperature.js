'use strict';
const run = require('child_process').spawnSync;

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
    config            = config || {};
    this.log          = log || console;
    this.name         = config['name'] || 'Raspberry Pi';
    this.vcgencmdPath = config['vcgencmdPath'] || '/usr/bin/vcgencmd';
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
            callback(null, temperature);
        } catch(ex) {
            this.log.error("Error occured during getting temperature.");
            this.log.error(ex);
            callback(ex);
        }
    },
    // Add homebridge temperature service
    addService: function(_mainService, hap) {
        mainService    = _mainService;
        Characteristic = hap.Characteristic;
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

        // Initially get temperature
        this.getTemperature(function (ex, temp) {
            if (ex === null) {
                mainService
                    .getCharacteristic(Characteristic.CurrentTemperature)
                    .updateValue(temp);
            }
        }.bind(this));

        return mainService;
    }
}
