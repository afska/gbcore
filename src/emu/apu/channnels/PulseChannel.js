import byte from "../../lib/byte";
import PulseOscillator from "../oscillators/PulseOscillator";

const LENGTH_TIMER_TARGET = 64;

export default class PulseChannel {
  constructor(apu, id, enableFlagName) {
    this.apu = apu;

    this.id = id;
    this.enableFlagName = enableFlagName;

    this.periodValue = 0;
    this.registers = this.apu.registers.pulses[this.id];

    this.oscillator = new PulseOscillator();
    // this.volumeEnvelope = new VolumeEnvelope();
    // this.frequencySweep = new FrequencySweep(this);

    this.isPlaying = false;
    this.lengthTimer = 0;

    this.outputSample = 0;
  }

  trigger() {
    this.isPlaying = true;

    // If length timer expired it is reset.
    if (this.lengthTimer >= LENGTH_TIMER_TARGET) this.lengthTimer = 0;

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
    // TODO: trigger the channels
    // if (
    //   !this.isEnabled
    //   /* ||
    //   !this.lengthCounter.isActive() ||
    //   this.frequencySweep.mute*/
    // )
    //   return this.outputSample;

    this.oscillator.frequency = 131072 / (2048 - this.periodValue);
    this.oscillator.dutyCycle = this.registers.len.dutyCycle;
    // this.oscillator.volume = this.registers.control.constantVolume
    //   ? this.registers.control.volumeOrEnvelopePeriod
    //   : this.volumeEnvelope.volume;

    this.outputSample = this.periodValue > 0 ? this.oscillator.sample() : 0;

    return this.outputSample;
  }

  step() {}

  lengthTimerTick() {
    this.lengthTimer++;

    if (this.lengthTimer >= LENGTH_TIMER_TARGET) {
      this.lengthTimer = 0;
      this.periodValue = 0;
      this.isPlaying = false;
    }
  }

  get isEnabled() {
    return !!this.apu.registers.audena[this.enableFlagName];
  }
}
