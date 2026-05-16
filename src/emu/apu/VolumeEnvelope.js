const APU_MAX_VOLUME = 15;

export default class VolumeEnvelope {
  constructor() {
    // input
    this.startFlag = false;

    // output
    this.dividerCount = 0;
    this.volume = 0;
  }

  clock(period, loop) {
    // start if needed
    if (this.startFlag) {
      this.startFlag = false;
      this.volume = APU_MAX_VOLUME;
      this.dividerCount = period;
      return;
    }

    // wait until dividerCount == 0
    if (this.dividerCount > 0) {
      this.dividerCount--;
      return;
    }

    // change volume
    this.dividerCount = period;
    if (this.volume === 0) {
      if (loop) this.volume = APU_MAX_VOLUME;
    } else {
      this.volume--;
    }
  }
}
