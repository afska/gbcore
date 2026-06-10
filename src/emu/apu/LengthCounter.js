const MAX_LENGTH = 64;

/**
 * All channels can be individually set to automatically shut themselves down after a certain amount of time.
 * If the functionality is enabled, a channel’s length timer ticks up at 256 Hz (tied to DIV-APU) from the value it’s initially set at.
 * When the length timer reaches 64 (CH1, CH2, and CH4) or 256 (CH3), the channel is turned off.
 */
export default class LengthCounter {
  constructor(target = MAX_LENGTH) {
    this._target = target;
    this.reset();
  }

  reset() {
    this.set(0);
  }

  resetIfNeeded() {
    if (this._counter >= this._target) this.reset();
  }

  set(value) {
    this._counter = value;
  }

  clock(channel) {
    this._counter++;

    if (this._counter >= this._target) {
      this.reset();
      channel.stop();
    }
  }
}
