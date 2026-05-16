export default class LengthCounter {
  constructor() {
    this.reset();
  }

  reset() {
    this.counter = 0;
  }

  clock(isEnabled, isHalted) {
    if (!isEnabled) this.reset();
    else if (this.counter > 0 && !isHalted) this.counter--;
  }

  isActive() {
    return this.counter > 0;
  }
}
