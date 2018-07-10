# homebridge-raspberrypi

A homebridge plugin that get RaspberryPi metrics, such a CPU temperature and CPU voltage (in mv)

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
### 0.0.1
Initial release after fork of [original repository](https://github.com/YinHangCode/homebridge-raspberrypi-temperature)
