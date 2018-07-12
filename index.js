'use strict';
const fs = require('fs');
const homebridgeLib = require('homebridge-lib');
// Internal dependencies
const RaspberryPi = require('./raspberrypi').RaspberryPi;
const RaspberryPiLowVoltage = require('./raspberrypi').RaspberryPiLowVoltage;

// Homebridge HAP
var hap, Accessory, UUIDGen, FakeGatoHistoryService, eve, myhomekit;


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

    // FakeGato History Service
    FakeGatoHistoryService = require('fakegato-history')(homebridge);

    homebridge.registerAccessory('homebridge-raspberrypi', 'RaspberryPi', RaspberryPi);
    homebridge.registerAccessory('homebridge-raspberrypi-lowvoltage', 'RaspberryPiLowVoltage', RaspberryPiLowVoltage);
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

