export default class LengthCounter {
  constructor(target = 64) {
    this._target = target;

    this.counter = 0;
  }

  resetIfNeeded() {
    if (this.counter >= this._target) this.counter = 0;
  }

  clock(channel) {
    this.counter++;

    if (this.counter >= this._target) {
      this.counter = 0;
      channel.isPlaying = false;
    }
  }
}
