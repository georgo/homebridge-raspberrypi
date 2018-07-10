'use strict';
const run = require('child_process').spawnSync;

// HAP
var Characteristic, eve;

// Main service
var mainService;

// Module exports
module.exports = {
    RaspberryPiVoltage: RaspberryPiVoltage
};


// Raspberry Pi Voltage
function RaspberryPiVoltage(log, config) {
    // Configuration values
    config            = config || {};
    this.log          = log || console;
    this.name         = config['name'] || 'Raspberry Pi';
    this.vcgencmdPath = config['vcgencmdPath'] || '/usr/bin/vcgencmd';
    this.interval     = ('interval' in config ? parseInt(config['interval']) : 3);    
}

RaspberryPiVoltage.prototype = {
     // Read information about Raspberry Pi's voltage
    getVoltage: function() {
        try {
            var output = run(this.vcgencmdPath, ['measure_volts'], {encoding: 'utf-8'});
            if (output.status != 0) {
                // Error occured
                throw output.error;
            }
            // Parse firmware version
            var stdout = output.stdout;
            var volt   = stdout.match(/volt=([^V]*)V/);
            // Voltage
            var voltage = parseFloat(volt[1]) || 0.0;
            this.log(this.name +" voltage is: "+ voltage + " V");
            mainService
                .getCharacteristic(eve.Characteristic.Voltage)
                .updateValue(voltage * 1000);
        } catch(ex) {
            this.log.error("Error occured during getting voltage.");
            this.log.error(ex);
        }
        // Refresh periodically
        setTimeout(this.getVoltage.bind(this), (this.interval) * 60 * 1000);
    },
    // Add homebridge voltage service
    addService: function(_mainService, hap, _eve) {
        mainService    = _mainService;
        eve            = _eve;
        Characteristic = hap.Characteristic;

        mainService
            .addCharacteristic(eve.Characteristic.Voltage)
            .setProps({
                unit: "mV",
                format: Characteristic.Formats.FLOAT,
                minValue: 0.0,
                maxValue: 16000.0,
                minStep: 0.001
            });

        // Initially get voltage
        this.getVoltage();

        return mainService;
    }
}
