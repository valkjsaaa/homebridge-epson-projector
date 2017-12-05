const request = require("request");

const command_path = "/cgi-bin/directsend?";

const query_path = "/cgi-bin/json_query?jsoncallback=";

const timeout = 5000;

const debug = false;

var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-epson-projector", "EpsonProjector", EpsonProjector);
};


function EpsonProjector(log, config) {
    this.log = log;
    this.ip = config["ip"];
    this.model = config["model"] === undefined ? "" : config["model"];
    this.serial = config["serial"] === undefined ? "" : config["serial"];
    this.name = config["name"];
}

EpsonProjector.prototype = {

    getPowerState: function (callback) {
        if (debug) {
            console.log(error);
        }
        request.get({
            uri: "http://" + this.ip + query_path + "PWR?",
            headers: {
                "Referer": "http://" + this.ip + "/cgi-bin/webconf",
            },
            timeout: timeout
        }, function (error, response, body) {
            if (error !== null) {
                callback(error);
                return;
            }
            try {
                callback(null, JSON.parse(body)["projector"]["feature"]["reply"] === "01")
            } catch (error) {
                callback(error);
            }
        });
    },

    setPowerState: function(powerOn, callback) {
        let command;
        if (powerOn) {
            command = "PWR=ON";
        } else {
            command = "PWR=OFF";
        }
        if (debug) {
            console.log(error);
        }
        request.get({
            uri: "http://" + this.ip + command_path + command,
            headers: {
                "Referer": "http://" + this.ip + "/cgi-bin/webconf",
            },
            timeout: timeout
        }, function (error, response, body) {
            if (debug) {
                console.log(error);
            }
            callback();
        });
    },

    getServices: function () {
        const informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "EPSON")
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);

        switchService = new Service.Switch(this.name);
        switchService
            .getCharacteristic(Characteristic.On)
                .on('get', this.getPowerState.bind(this))
                .on('set', this.setPowerState.bind(this));

        this.informationService = informationService;
        this.switchService = switchService;
        return [informationService, switchService];
    }
};