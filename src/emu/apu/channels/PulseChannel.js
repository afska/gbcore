import byte from "../../lib/byte";
import FrequencySweep from "../FrequencySweep";
import LengthCounter from "../LengthCounter";
import VolumeEnvelope from "../VolumeEnvelope";
import PulseOscillator from "../oscillators/PulseOscillator";

/**
 * Channels 1 and 2, the “pulse channels”, produce pulse width modulated waves with 4 fixed pulse width settings.
 */
export default class PulseChannel {
  constructor(apu, id) {
    this.apu = apu;

    this.id = id;
    this.registers = this.apu.registers.pulses[this.id];

    this.isPlaying = false;

    this.oscillator = new PulseOscillator();
    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();
    this.frequencySweep = new FrequencySweep(this);
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

  get volume() {
    return this.oscillator.volume;
  }

  set volume(value) {
    this.oscillator.volume = value;
  }

  reset() {
    this.registers.low.setValue(0);
    this.registers.high.setValue(0);
    this.registers.len.setValue(0);
    this.registers.env.setValue(0);
    if (this.id === 0) this.registers.sweep.setValue(0);

    this.isPlaying = false;
    this.oscillator.reset();
    this.lengthCounter.reset();
    this.volumeEnvelope.reset();
    this.frequencySweep.reset();
  }

  trigger() {
    this.isPlaying = true;

    this.volume = this.registers.env.initialVolume;
    this.lengthCounter.resetIfNeeded();
    this.volumeEnvelope.reset(this.registers.env.sweepPace);
    if (this.id === 0) this.frequencySweep.trigger();

    if (!this.registers.env.isDACEnabled) this.stop();
  }

  stop() {
    this.isPlaying = false;
  }

  sample() {
    if (!this.isPlaying) return 0;

    this.oscillator.frequency = 131072 / (2048 - this.notePeriod);
    this.oscillator.dutyCycle = this.registers.len.dutyCycle;

    return this.oscillator.sample();
  }

  step() {}

  lengthCounterTick() {
    if (this.registers.high.enableLength) this.lengthCounter.clock(this);
  }

  volumeEnvelopeTick() {
    if (this.registers.env.hasEnvelope)
      this.volumeEnvelope.clock(this, this.registers.env.increase ? 1 : -1);
  }

  frequencySweepTick() {
    if (this.id !== 0) return;

    this.frequencySweep.clock();
  }
}
