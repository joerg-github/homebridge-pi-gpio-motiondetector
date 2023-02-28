import {
  AccessoryConfig,
  Logging,
} from 'homebridge';

import { MotionDetectorConfig } from './motionDetectorConfig';

export class MotionDetectorAccessoryConfig implements MotionDetectorConfig {
  name: string;
  pinMotionDetected: number;

  constructor(log: Logging, config: AccessoryConfig) {

    log.info('Initializing MotionDetectorAccessoryConfig!', config);
    this.name = config.name;

    this.pinMotionDetected = config.pinMotionDetected ? config.pinMotionDetected : 19;
  }
}