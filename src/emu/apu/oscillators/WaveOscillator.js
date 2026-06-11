import byte from "../../lib/byte";

const APU_SAMPLE_RATE = 44100;
const TOTAL_SAMPLES = 32;

/**
 * A custom wave generator, based on Wave RAM.
 */
export default class WaveOscillator {
  constructor(memory) {
    this._memory = memory;

    this.reset();
  }

  reset() {
    this.frequency = 0;
    this.volume = 0; // (0~1)
    this._phase = 0; // (0~1)
  }

  resetPhase() {
    this._phase = 0;
  }

  sample() {
    this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;
    const step = Math.floor(this._phase * TOTAL_SAMPLES);

    const byteIndex = Math.floor(step / 2);
    const nybbleIndex = step % 2;

    const value = this._memory.waveRam[byteIndex];
    return (
      (nybbleIndex === 0 ? byte.highNybbleOf(value) : byte.lowNybbleOf(value)) *
      this.volume
    );
  }
}
