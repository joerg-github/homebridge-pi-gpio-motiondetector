import { MotionDetectorConfig } from './motionDetectorConfig';
import { Logging } from 'homebridge';
import { EventEmitter } from '../node_modules/hap-nodejs/dist/lib/EventEmitter';
import { Gpio, BinaryValue } from 'onoff';

enum PinLogicalState {
    OFF = 0,
    ON = 1
}

const PinLogicalStateStr: string[] = ['OFF', 'ON'];

export class MotionDetectorControl {

  private _motionDetected = false;
  private gpioSensorMotionDetected: Gpio | undefined;

  private pinChanged(pin: number, value: BinaryValue) {
    this.log.debug('pinChanged: pin: %s, state: %s', pin, PinLogicalStateStr[value]);
    switch (pin) {
      case this.config.pinMotionDetected:
        if (value === PinLogicalState.ON) {
          this.log.info('pinChanged: Motion deteced TRUE');
          this.motionDetected = true;
        } else {
          this.log.info('pinChanged: Motion deteced FALSE');
          this.motionDetected = false;
        }
        break;

      default:
        this.log.error('pinChanged: Upps. Unknown pin change detected.');
        break;
    }
  }

  public get motionDetected() {
    return this._motionDetected;
  }

  public set motionDetected(value) {
    this._motionDetected = value;
  }

  constructor(private log: Logging, private config: MotionDetectorConfig) {
    //super();

    log.info('Initializing MotionDetectorControl');

    if (Gpio.accessible) {
      if (config.pinMotionDetected === undefined) {
        log.error('Missing configuration pinMotionDetected');
      } else {
        log.debug('gpio pin %s used as pinMotionDeteced', config.pinMotionDetected);

        this.gpioSensorMotionDetected = new Gpio(config.pinMotionDetected, 'in', 'both', {debounceTimeout: 1000});
        this.gpioSensorMotionDetected.watch((err, value) => {
          this.pinChanged(config.pinMotionDetected as number, value);
        });
      }
    }
  }
}
