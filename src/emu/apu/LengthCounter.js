const MAX_LENGTH = 64;

export default class LengthCounter {
  constructor(target = MAX_LENGTH) {
    this._target = target;
    this._counter = 0;
  }

  set(value) {
    this._counter = value;
  }

  resetIfNeeded() {
    if (this._counter >= this._target) this._counter = 0;
  }

  clock(channel) {
    this._counter++;

    if (this._counter >= this._target) {
      this._counter = 0;
      channel.stop();
    }
  }
}
