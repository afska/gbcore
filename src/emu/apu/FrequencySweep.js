/**
 * The first square channel has a frequency sweep unit, controlled by NR10.
 */
export default class FrequencySweep {
  constructor(channel) {
    this.channel = channel;

    this.reset();
  }

  reset() {
    this._enabled = false;

    this._notePeriod = 0;
    this._sweepPace = 0;

    this._counter = 0;
  }

  trigger() {
    const sweep = this.channel.registers.sweep;
    this._sweepPace = sweep.pace;

    this._notePeriod = this.channel.notePeriod;
    this._counter = 0;
    this._enabled = this._sweepPace > 0 || this._sweepStep > 0;
    if (this._sweepStep > 0) this._updateNote();
  }

  clock() {
    if (!this._enabled || this._sweepPace === 0) return;

    this._counter++;

    if (this._counter >= this._sweepPace) {
      if (this._sweepStep > 0) {
        if (this._updateNote(true)) this._updateNote();
      }

      this._counter = 0;
    }
  }

  _updateNote(write = false) {
    const sign = this._negative ? -1 : 1;
    const newNotePeriod =
      this._notePeriod +
      sign * Math.floor(this._notePeriod / Math.pow(2, this._sweepStep));

    if (newNotePeriod > 0b11111111111) {
      this.channel.isPlaying = false;
      return false;
    } else if (write) {
      this._notePeriod = newNotePeriod;
      this.channel.notePeriod = newNotePeriod;
    }

    return true;
  }

  get _sweepStep() {
    return this.channel.registers.sweep.individualStep;
  }

  get _negative() {
    return this.channel.registers.sweep.negative;
  }

  getSaveState() {
    return {
      enabled: this._enabled,
      notePeriod: this._notePeriod,
      sweepPace: this._sweepPace,
      counter: this._counter
    };
  }

  setSaveState(saveState) {
    this._enabled = saveState.enabled;
    this._notePeriod = saveState.notePeriod;
    this._sweepPace = saveState.sweepPace;
    this._counter = saveState.counter;
  }
}
