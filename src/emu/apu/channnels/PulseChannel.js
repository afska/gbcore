import PulseOscillator from "../oscillators/PulseOscillator";
import byte from "../../lib/byte";

export default class PulseChannel {
  constructor(apu, id, enableFlagName) {
    this.apu = apu;

    this.id = id;
    this.enableFlagName = enableFlagName;

    this.periodValue = 0;
    this.registers = this.apu.registers.pulses[this.id];

    this.oscillator = new PulseOscillator();
    // this.lengthCounter = new LengthCounter();
    // this.volumeEnvelope = new VolumeEnvelope();
    // this.frequencySweep = new FrequencySweep(this);

    this.outputSample = 0;
  }

  sample() {
    // TODO: trigger the channels
    // if (
    //   !this.isEnabled
    //   /* ||
    //   !this.lengthCounter.isActive() ||
    //   this.frequencySweep.mute*/
    // )
    //   return this.outputSample;

    this.oscillator.frequency = 131072 / (2048 - this.periodValue);
    // this.oscillator.dutyCycle = this.registers.control.dutyCycleId;
    // this.oscillator.volume = this.registers.control.constantVolume
    //   ? this.registers.control.volumeOrEnvelopePeriod
    //   : this.volumeEnvelope.volume;

    this.outputSample = this.periodValue > 0 ? this.oscillator.sample() : 0;

    return this.outputSample;
  }

  step() {
    this.periodValue = byte.buildU16(
      this.registers.high.periodHigh,
      this.registers.low.value
    );
  }

  get isEnabled() {
    return !!this.apu.registers.audena[this.enableFlagName];
  }
}
