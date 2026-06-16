import byte from "../../lib/byte";
import { APU_RATE } from "../APU";
import LengthCounter from "../LengthCounter";
import VolumeEnvelope from "../VolumeEnvelope";

/**
 * Channel 4 is the “noise” channel, producing a pseudo-random wave.
 */
export default class NoiseChannel {
  constructor(apu) {
    this.apu = apu;

    this.registers = this.apu.registers.noise;

    this.isPlaying = false;

    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();

    this.volume = 0;
    this.lfsr = 0;
    this.dividerCount = 0;
  }

  reset() {
    this.registers.go.setValue(0);
    this.registers.poly.setValue(0);
    this.registers.len.setValue(0);
    this.registers.env.setValue(0);

    this.isPlaying = false;
    this.lengthCounter.reset();
    this.volumeEnvelope.reset();

    this.volume = 0;
    this.lfsr = 0;
    this.dividerCount = 0;
  }

  trigger() {
    this.isPlaying = true;

    this.volume = this.registers.env.initialVolume;
    this.lengthCounter.resetIfNeeded();
    this.volumeEnvelope.reset(this.registers.env.sweepPace);

    this.lfsr = 0;
    this.dividerCount = 0;

    if (!this.registers.env.isDACEnabled) this.stop();
  }

  stop() {
    this.isPlaying = false;
  }

  sample() {
    if (!this.isPlaying) return 0;

    // bit 0 selects between 0 and the chosen volume
    return byte.getBit(this.lfsr, 0) * this.volume;
  }

  step() {
    // shift being equal to 14 or 15 stops the channel from being clocked entirely
    const clockShift = this.registers.poly.clockShift;
    if (clockShift >= 14) return;

    // divider = 0 is treated as divider = 0.5 instead.
    let clockDivider = this.registers.poly.clockDivider;
    if (clockDivider === 0) clockDivider = 0.5;

    // the frequency at which the LFSR is clocked is (262144 / (divider*(2^shift))) Hz
    const frequencyHz = 262144 / (clockDivider * Math.pow(2, clockShift));
    const frequencySteps = frequencyHz / APU_RATE;
    const periodSteps = Math.floor(1 / frequencySteps);

    // do we need to clock the LFSR?
    this.dividerCount++;
    if (this.dividerCount >= periodSteps) this.dividerCount = 0;
    else return;

    // yes we do!
    const shortMode = this.registers.poly.shortMode;

    const bit0 = this.lfsr & 1;
    const bit1 = (this.lfsr >> 1) & 1;
    const feedback = +(bit0 === bit1);

    // The result of LFSR0 ⊙ LFSR1 (1 if bit 0 and bit 1 are identical, 0 otherwise) is written to bit 15.
    this.lfsr = byte.setBit(this.lfsr, 15, feedback);

    // If “short mode” was selected in NR43, then bit 15 is copied to bit 7 as well.
    if (shortMode) this.lfsr = byte.setBit(this.lfsr, 7, feedback);

    // Finally, the entire LFSR is shifted right
    this.lfsr = this.lfsr >> 1;
  }

  lengthCounterTick() {
    if (this.registers.go.enableLength) this.lengthCounter.clock(this);
  }

  volumeEnvelopeTick() {
    if (this.registers.env.hasEnvelope)
      this.volumeEnvelope.clock(this, this.registers.env.increase ? 1 : -1);
  }

  getSaveState() {
    return {
      isPlaying: this.isPlaying,
      lengthCounter: this.lengthCounter.getSaveState(),
      volumeEnvelope: this.volumeEnvelope.getSaveState(),
      volume: this.volume,
      lfsr: this.lfsr,
      dividerCount: this.dividerCount
    };
  }

  setSaveState(saveState) {
    this.isPlaying = saveState.isPlaying;
    this.lengthCounter.setSaveState(saveState.lengthCounter);
    this.volumeEnvelope.setSaveState(saveState.volumeEnvelope);
    this.volume = saveState.volume;
    this.lfsr = saveState.lfsr;
    this.dividerCount = saveState.dividerCount;
  }
}
