import byte from "../../lib/byte";
import LengthCounter from "../LengthCounter";
import VolumeEnvelope from "../VolumeEnvelope";
import PulseOscillator from "../oscillators/PulseOscillator";

export default class PulseChannel {
  constructor(apu, id) {
    this.apu = apu;

    this.id = id;
    this.registers = this.apu.registers.pulses[this.id];

    this.isPlaying = false;
    this.notePeriod = 0;
    this.outputSample = 0;

    this.oscillator = new PulseOscillator();
    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();
    // this.frequencySweep = new FrequencySweep(this);
  }

  trigger() {
    this.isPlaying = true;

    // If length timer expired it is reset.
    this.lengthCounter.resetIfNeeded();

    // The period divider is set to the contents of NR13 and NR14.
    this.notePeriod = byte.buildU16(
      this.registers.high.periodHigh,
      this.registers.low.value
    );

    // Envelope timer is reset.
    this.volumeEnvelope.reset();
    this.volumeEnvelope.sweepPace = this.registers.env.sweepPace;

    // Volume is set to contents of NR12 initial volume.
    this.oscillator.volume = this.registers.env.initialVolume;

    // Sweep does several things.
    // TODO: IMPLEMENT

    // TODO: Use AUDVOL for left/right volume
  }

  stop() {
    this.isPlaying = false;
  }

  sample() {
    if (!this.isPlaying) return this.outputSample;

    this.oscillator.frequency = 131072 / (2048 - this.notePeriod);
    this.oscillator.dutyCycle = this.registers.len.dutyCycle;

    this.outputSample = this.oscillator.sample();

    return this.outputSample;
  }

  step() {}

  lengthTimerTick() {
    if (this.registers.high.enableLength) this.lengthCounter.clock(this);
  }

  envelopeTick() {
    if (this.registers.env.hasEnvelope)
      this.volumeEnvelope.clock(this, this.registers.env.negative ? -1 : 1);
  }
}
