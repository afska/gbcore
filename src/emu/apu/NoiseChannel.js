import LengthCounter from "./LengthCounter";
import VolumeEnvelope from "./VolumeEnvelope";
import noisePeriods from "../lib/apu/noisePeriods";
import byte from "../lib/byte";

export default class NoiseChannel {
  constructor(apu) {
    this.apu = apu;

    this.registers = this.apu.registers.noise;

    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();

    this.shift = 0b1; // (the shift register is 15 bits wide)
    this.dividerCount = 0;
  }

  sample() {
    if (!this.isEnabled() || !this.lengthCounter.isActive() || this.isMuted())
      return 0;

    return this.registers.control.constantVolume
      ? this.registers.control.volumeOrEnvelopePeriod
      : this.volumeEnvelope.volume;
  }

  step() {
    this.dividerCount++;
    if (this.dividerCount >= noisePeriods[this.registers.form.periodId])
      this.dividerCount = 0;
    else return;

    const bitPosition = this.registers.form.mode ? 6 : 1;

    const bit = byte.getBit(this.shift, bitPosition);
    const feedback = byte.getBit(this.shift, 0) ^ bit;

    this.shift = (this.shift >> 1) | (feedback << 14);
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
  }

  isEnabled() {
    return !!this.apu.registers.apuControl.enableNoise;
  }

  isMuted() {
    return byte.getBit(this.shift, 0);
  }
}
