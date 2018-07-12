'use strict';
const fs = require('fs');
const packageFile = require("./package.json");
const run = require('child_process').spawnSync;

// HAP
var Service, Characteristic;

// Module exports
module.exports = {
    PiHardware: PiHardware
};

// Raspberry Pi Hardware
function PiHardware(log, config) {
    // Package version
    this.version     = packageFile.version;
    // Configuration values
    config            = config || {};
    this.log          = log || console;
    this.cpuInfoPath  = config['cpuInfoPath'] || '/proc/cpuinfo';
    this.vcgencmdPath = config['vcgencmdPath'] || '/usr/bin/vcgencmd';
    // Dummy values
    this.manufacturer = 'Default-Manufacturer';
    this.model        = 'Default-Model';
    this.serial       = 'Default-Serial';
    this.firmware     = 'Default-Firmware';
}

PiHardware.prototype = {
     // Read information about Raspberry Pi's hardware
    getInfo: function() {
        var cpuInfoData = fs.readFileSync(this.cpuInfoPath, 'utf-8');
        try {
            let hardware      = cpuInfoData.match(/Hardware\s*:\s*(.*)/);
            this.manufacturer = hardware[1];
        } catch(pass) { }
        try {
            let revision = cpuInfoData.match(/Revision\s*:\s*(.*)/);
            this.model   = revision[1];
        } catch(pass) { }
        try {
            var serial  = cpuInfoData.match(/Serial\s*:\s*(.*)/);
            this.serial = serial[1];
        } catch(pass) { }

        try {
            var output = run(this.vcgencmdPath, ['version'], {encoding: 'utf-8'});
            if (output.status != 0) {
                // Error occured
                throw output.error;
            }
            // Parse firmware version
            var stdout    = output.stdout;
            var firmware  = stdout.match(/version\s*([^\s]*)/);
            this.firmware = firmware[1];
        } catch(ex) {
            this.log.warn("Error occured during getting firmware version.");
            this.log.debug(ex);
            this.firmware = 'Default-Firmware';
        }
    },
    // Get Homebridge Info service
    getService: function(hap, subtype) {
        Service        = hap.Service;
        Characteristic = hap.Characteristic;
        // Load hardware information
        this.getInfo();
        // Create infoservice
        var infoService = new Service.AccessoryInformation();
        // Set infoservice characteristics
        infoService
            .setCharacteristic(Characteristic.Manufacturer    , this.manufacturer)
            .setCharacteristic(Characteristic.Model           , this.model)
            .setCharacteristic(Characteristic.SerialNumber    , this.serial + (subtype ? '.'+ subtype : ''))
            .setCharacteristic(Characteristic.HardwareRevision, this.firmware)
            .setCharacteristic(Characteristic.FirmwareRevision, this.version);
        return infoService;
    }
}
