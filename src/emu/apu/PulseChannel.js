import PulseOscillator from "../lib/apu/PulseOscillator";
import LengthCounter from "./LengthCounter";
import VolumeEnvelope from "./VolumeEnvelope";
import FrequencySweep from "./FrequencySweep";
import byte from "../lib/byte";

export default class PulseChannel {
  constructor(apu, id, enableFlagName) {
    this.apu = apu;

    this.id = id;
    this.enableFlagName = enableFlagName;

    this.timer = 0;
    this.registers = this.apu.registers.pulses[this.id];

    this.oscillator = new PulseOscillator();
    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();
    this.frequencySweep = new FrequencySweep(this);

    this.outputSample = 0;
  }

  sample() {
    if (
      !this.isEnabled() ||
      !this.lengthCounter.isActive() ||
      this.frequencySweep.mute
    )
      return this.outputSample;

    // from nesdev: f = fCPU / (16 * (t + 1))
    this.oscillator.frequency = 1789773 / (16 * (this.timer + 1));
    this.oscillator.dutyCycle = this.registers.control.dutyCycleId;
    this.oscillator.volume = this.registers.control.constantVolume
      ? this.registers.control.volumeOrEnvelopePeriod
      : this.volumeEnvelope.volume;

    this.outputSample = this.oscillator.sample();

    return this.outputSample;
  }

  updateTimer() {
    this.timer = byte.buildU16(
      this.registers.timerHighLCL.timerHigh,
      this.registers.timerLow.value
    );
  }

  step() {
    this.frequencySweep.muteIfNeeded();
    if (!this.registers.sweep.enabledFlag) this.updateTimer();
  }

  quarterFrame() {
    this.volumeEnvelope.clock(
      this.registers.control.volumeOrEnvelopePeriod,
      this.registers.control.envelopeLoopOrLengthCounterHalt
    );
  }

  halfFrame() {
    this.lengthCounter.clock(
      this.isEnabled(),
      this.registers.control.envelopeLoopOrLengthCounterHalt
    );
    this.frequencySweep.clock();
  }

  isEnabled() {
    return !!this.apu.registers.apuControl[this.enableFlagName];
  }
}
