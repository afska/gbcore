export default class VolumeEnvelope {
  constructor() {
    this.sweepPace = 0;
    this.reset();
  }

  reset() {
    this.counter = 0;
  }

  clock(channel, sign) {
    this.counter++;

    if (this.counter >= this.sweepPace) {
      if (sign > 0 && channel.oscillator.volume < 15) {
        channel.oscillator.volume++;
      } else if (sign < 0 && channel.oscillator.volume > 0) {
        channel.oscillator.volume--;
      }

      this.counter = 0;
    }
  }
}
