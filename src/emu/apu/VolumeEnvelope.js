const MAX_VOLUME = 15;

export default class VolumeEnvelope {
  constructor() {
    this.reset();
  }

  reset(sweepPace = 0) {
    this._counter = 0;
    this._sweepPace = sweepPace;
  }

  clock(channel, sign) {
    this._counter++;

    if (this._counter >= this._sweepPace) {
      const oscillator = channel.oscillator;

      if (sign > 0 && oscillator.volume < MAX_VOLUME) {
        oscillator.volume++;
      } else if (sign < 0 && oscillator.volume > 0) {
        oscillator.volume--;
      }

      this._counter = 0;
    }
  }
}
