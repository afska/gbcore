const MAX_VOLUME = 15;

/**
 * The volume can be controlled in two ways: there is a “master volume” control (which has separate settings for the left and right outputs), and each channel’s volume can be individually set as well (CH3’s less precisely than the others).
 * Additionally, an envelope can be configured for CH1, CH2 and CH4, which allows automatically adjusting the volume over time. The parameters that can be controlled are the initial volume, the envelope’s direction (but not its slope), and its duration.
 * Internally, all envelopes are ticked at 64 Hz, and every 1–7 of those ticks, the volume will be increased or decreased.
 */
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
