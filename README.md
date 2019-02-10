# homebridge-raspberrypi

[![npm version](https://badge.fury.io/js/homebridge-raspberrypi.svg)](https://badge.fury.io/js/homebridge-raspberrypi)

A homebridge plugin that get RaspberryPi metrics, such a CPU temperature and CPU voltage (in mv)

## Requirements

To monitor temperature and voltage, following Raspbian packages are required:
```
libraspberrypi-bin
```

Don't forget to assign `homebridge` user to `video` group.

## Configuration
```
"accessories": [{
    "accessory": "RaspberryPi",
    "name": "Raspberry Pi"
}]
```
If you want value timing update, you can set 'interval' attribute in minutes. Default value is 3 minutes.
I recommend to use lower interval, than 10 minutes.

```
"accessories": [{
    "accessory": "RaspberryPi",
    "name": "Raspberry Pi",
    "interval": 1
}]
```

## Version Logs
### 0.0.2
Added support for temperature history
### 0.0.1
Initial release after fork of [original repository](https://github.com/YinHangCode/homebridge-raspberrypi-temperature)
