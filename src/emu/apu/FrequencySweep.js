export default class FrequencySweep {
  constructor(channel) {
    this.channel = channel;

    this.enabled = false;
    this.notePeriod = 0;
    this.sweepPace = 0;
    this.sweepStep = 0;
    this.negative = false;
    this.reset();
  }

  reset() {
    this.counter = 0;
  }

  frequencyCalculationAndOverflowCheck(write = false) {
    const sign = this.negative ? -1 : 1;
    const newNotePeriod =
      this.notePeriod +
      sign * Math.floor(this.notePeriod / Math.pow(2, this.sweepStep));
    if (newNotePeriod > 0b11111111111) this.channel.isPlaying = false;
    else if (write) {
      this.notePeriod = newNotePeriod;
      this.channel.notePeriod = newNotePeriod;
      this.channel.registers.low.setValue(
        this.channel.notePeriod & 0b00011111111
      );
      this.channel.registers.high.periodHigh =
        (this.channel.notePeriod & 0b11100000000) >> 8;
    }
  }

  clock() {
    this.counter++;

    if (this.counter >= this.sweepPace) {
      if (this.sweepStep > 0) {
        this.frequencyCalculationAndOverflowCheck(true);
        this.frequencyCalculationAndOverflowCheck();
      }

      this.counter = 0;
    }
  }
}
