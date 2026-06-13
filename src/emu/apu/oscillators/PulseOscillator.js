const APU_SAMPLE_RATE = 44100;
const DUTY_TABLE = [0.125, 0.25, 0.5, 0.75];

/**
 * A pulse wave generator.
 */
export default class PulseOscillator {
  constructor() {
    this.reset();
  }

  reset() {
    this.frequency = 0;
    this.dutyCycle = 0; // (0~3)
    this.volume = 15; // (0~5)
    this._phase = 0; // (0~1)
  }

  sample() {
    this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;

    return this._phase < DUTY_TABLE[this.dutyCycle] ? this.volume : 0;
  }

  getSaveState() {
    return {
      frequency: this.frequency,
      dutyCycle: this.dutyCycle,
      volume: this.volume,
      phase: this._phase
    };
  }

  setSaveState(saveState) {
    this.frequency = saveState.frequency;
    this.dutyCycle = saveState.dutyCycle;
    this.volume = saveState.volume;
    this._phase = saveState.phase;
  }
}
