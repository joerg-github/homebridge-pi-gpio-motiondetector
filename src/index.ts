import { API, HAP } from 'homebridge';

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('homebridge-pi-gpio-motiondetector', 'MotionDetector', MotionDetector);
};
