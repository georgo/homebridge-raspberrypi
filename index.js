'use strict';
const fs = require('fs');
const homebridgeLib = require('homebridge-lib');
// Internal dependencies
const PiHardware    = require('./pihardware').RaspberryPiHardware;
const PiTemperature = require('./pitemperature').RaspberryPiTemperature;
const PiVoltage     = require('./pivoltage').RaspberryPiVoltage;

// Homebridge HAP
var hap, Accessory, UUIDGen, eve, myhomekit;


// Module exports
module.exports = function(homebridge) {
    if(!isConfig(homebridge.user.configPath(), "accessories", "RaspberryPi")) {
        return;
    }
    
    hap       = homebridge.hap;
    Accessory = homebridge.platformAccessory;
    UUIDGen   = homebridge.hap.uuid;

    // EVE Definitions
    eve = new homebridgeLib.EveHomeKitTypes(homebridge);
    myhomekit = new homebridgeLib.MyHomeKitTypes(homebridge)

    homebridge.registerAccessory('homebridge-raspberrypi', 'RaspberryPi', RaspberryPi);
}

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    }
    return false;
}

function RaspberryPi(log, config) {
    this.log    = log || console;
    this.config = config || {};
    this.name   = config['name'] || 'Raspberry Pi';
}

RaspberryPi.prototype = {
    getServices: function() {
        var raspberryPiHardware = new PiHardware(this.log, this.config);
        var infoService         = raspberryPiHardware.getService(hap);

        var mainService = new myhomekit.Service.Resource(this.name);

        var raspberryPiTemperature = new PiTemperature(this.log, this.config);
        mainService = raspberryPiTemperature.addService(mainService, hap);

        var raspberryPiVoltage = new PiVoltage(this.log, this.config);
        mainService = raspberryPiVoltage.addService(mainService, hap, eve);

        return [
            infoService,
            mainService
        ];
    }
}
