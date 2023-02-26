import { MotionDetectorConfig } from './motionDetectorConfig';
import { Logging } from 'homebridge';
import { Gpio, BinaryValue } from 'onoff';
import EventEmitter from 'events';

enum PinLogicalState {
    OFF = 0,
    ON = 1
}

const PinLogicalStateStr: string[] = ['OFF', 'ON'];


export declare const enum MotionDetectorControlEventTypes {
  CHANGE = 'change'
}

export class MotionDetectorControl extends EventEmitter {

  private _motionDetected = false;
  private gpioSensorMotionDetected: Gpio | undefined;
  private gpioSupplyGND: Gpio | undefined;
  private gpioSupplyVCC: Gpio | undefined;

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
    if (this._motionDetected !== value) {
      this._motionDetected = value;
      this.emit(MotionDetectorControlEventTypes.CHANGE);
    }
  }

  constructor(private log: Logging, private config: MotionDetectorConfig) {
    super();

    log.info('Initializing MotionDetectorControl');

    if (Gpio.accessible) {
      if (config.pinMotionDetected === undefined) {
        log.error('Missing configuration pinMotionDetected');
      } else {
        log.debug('gpio pin %s used as pinMotionDeteced', config.pinMotionDetected);

        this.gpioSensorMotionDetected = new Gpio(config.pinMotionDetected, 'in', 'both', {debounceTimeout: 1000});
        this.gpioSensorMotionDetected.setActiveLow(true);
        this.gpioSensorMotionDetected.watch((err, value) => {
          this.pinChanged(config.pinMotionDetected as number, value);
        });

        this.gpioSupplyGND = new Gpio(config.pinSupplyGND, 'out');
        this.gpioSupplyGND.writeSync(PinLogicalState.OFF);

        this.gpioSupplyVCC = new Gpio(config.pinSupplyVCC, 'out');
        this.gpioSupplyVCC.writeSync(PinLogicalState.ON);
      }
    }
  }
}
