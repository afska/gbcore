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
  }

  trigger() {
    this.isPlaying = true;

    this.volume = this.registers.env.initialVolume;
    this.lengthCounter.resetIfNeeded();
    this.volumeEnvelope.reset(this.registers.env.sweepPace);

    // TODO: reset LFSR bits

    if (!this.registers.env.isDACEnabled) this.stop();
  }

  stop() {
    this.isPlaying = false;
  }

  sample() {
    if (!this.isPlaying) return 0;

    return Math.random() * this.volume;
  }

  step() {}

  lengthCounterTick() {
    if (this.registers.go.enableLength) this.lengthCounter.clock(this);
  }

  volumeEnvelopeTick() {
    if (this.registers.env.hasEnvelope)
      this.volumeEnvelope.clock(this, this.registers.env.increase ? 1 : -1);
  }
}
