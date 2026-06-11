import byte from "../../lib/byte";
import LengthCounter from "../LengthCounter";
import WaveOscillator from "../oscillators/WaveOscillator";

/**
 * Channel 3, the “wave” channel, produces arbitrary user-supplied waves.
 */
export default class WaveChannel {
  constructor(apu) {
    this.apu = apu;

    this.registers = this.apu.registers.wave;

    this.isPlaying = false;

    this.oscillator = new WaveOscillator(this.apu.memory);
    this.lengthCounter = new LengthCounter(256);
  }

  get notePeriod() {
    return byte.buildU16(
      this.registers.high.periodHigh,
      this.registers.low.value
    );
  }

  set notePeriod(value) {
    this.registers.high.periodHigh = (value & 0b11100000000) >> 8;
    this.registers.low.setValue(value & 0b00011111111);
  }

  reset() {
    this.registers.ena.setValue(0);
    this.registers.low.setValue(0);
    this.registers.high.setValue(0);
    this.registers.len.setValue(0);
    this.registers.level.setValue(0);

    this.isPlaying = false;
    this.oscillator.reset();
    this.lengthCounter.reset();
  }

  trigger() {
    this.isPlaying = true;

    this.oscillator.resetPhase();
    this.lengthCounter.resetIfNeeded();

    if (!this.registers.ena.isDACEnabled) this.stop();
  }

  stop() {
    this.isPlaying = false;
  }

  sample() {
    if (!this.isPlaying) return 0;

    this.oscillator.frequency = 65536 / (2048 - this.notePeriod);
    this.oscillator.volume = this.registers.level.volumeFactor;

    return this.oscillator.sample();
  }

  step() {}

  lengthCounterTick() {
    if (this.registers.high.enableLength) this.lengthCounter.clock(this);
  }
}
