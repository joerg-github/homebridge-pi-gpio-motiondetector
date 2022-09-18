import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service } from 'homebridge';
import { MotionDetectorAccessoryConfig } from './motionDetectorAccessoryConfig';
import { MotionDetectorConfig } from './motionDetectorConfig';
import { MotionDetectorControl, MotionDetectorControlEventTypes } from './motionDetectorControl';

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('homebridge-pi-gpio-motiondetector', 'MotionDetector', MotionDetector);
};

class MotionDetector implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private motionDetectorConfig: MotionDetectorConfig;
  private motionDetectorControl: MotionDetectorControl;

  private readonly motionDetectorService: Service;
  private readonly informationService: Service;
  private characteristicMotionDetected: Characteristic;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;
    this.motionDetectorConfig = new MotionDetectorAccessoryConfig(log, config);

    this.motionDetectorService = new hap.Service.MotionSensor(this.name);
    this.characteristicMotionDetected = this.motionDetectorService
      .getCharacteristic(hap.Characteristic.MotionDetected)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.motionDetectorControl.motionDetected);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.motionDetectorControl.motionDetected = value as boolean;
        callback();
      });

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Jörg Mika')
      .setCharacteristic(hap.Characteristic.Model, 'Raspberry Pi GPIO Motion Senser');


    this.motionDetectorControl = new MotionDetectorControl(log, this.motionDetectorConfig);
    this.motionDetectorControl.on(MotionDetectorControlEventTypes.CHANGE, () => {
      this.characteristicMotionDetected.setValue(this.motionDetectorControl.motionDetected);
    });

    log.info('MotionDetector finished initializing!');
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log('Identify!');
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.motionDetectorService,
    ];
  }
}