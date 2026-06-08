import byte from "../../lib/byte";
import LengthCounter from "../LengthCounter";
import PulseOscillator from "../oscillators/PulseOscillator";

export default class PulseChannel {
  constructor(apu, id) {
    this.apu = apu;

    this.id = id;
    this.registers = this.apu.registers.pulses[this.id];

    this.isPlaying = false;
    this.periodValue = 0;
    this.outputSample = 0;

    this.oscillator = new PulseOscillator();
    this.lengthCounter = new LengthCounter();
    // this.volumeEnvelope = new VolumeEnvelope();
    // this.frequencySweep = new FrequencySweep(this);
  }

  trigger() {
    this.isPlaying = true;

    // If length timer expired it is reset.
    this.lengthCounter.resetIfNeeded();

    // The period divider is set to the contents of NR13 and NR14.
    this.periodValue = byte.buildU16(
      this.registers.high.periodHigh,
      this.registers.low.value
    );

    // Envelope timer is reset.
    // TODO: IMPLEMENT

    // Volume is set to contents of NR12 initial volume.
    this.oscillator.volume = this.registers.env.initialVolume;

    // Sweep does several things.
    // TODO: IMPLEMENT
  }

  sample() {
    if (!this.isPlaying) return this.outputSample;

    this.oscillator.frequency = 131072 / (2048 - this.periodValue);
    this.oscillator.dutyCycle = this.registers.len.dutyCycle;

    this.outputSample = this.oscillator.sample();

    return this.outputSample;
  }

  step() {}

  lengthTimerTick() {
    if (this.registers.high.enableLength) this.lengthCounter.clock(this);
  }
}
