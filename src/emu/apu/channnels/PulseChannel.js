import byte from "../../lib/byte";
import FrequencySweep from "../FrequencySweep";
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

    this.oscillator = new PulseOscillator();
    this.lengthCounter = new LengthCounter();
    this.volumeEnvelope = new VolumeEnvelope();
    this.frequencySweep = new FrequencySweep(this);
  }

  trigger() {
    this.isPlaying = true;

    // If length counter expired it is reset.
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
    if (this.id === 0) {
      // TODO: REFACTOR
      this.frequencySweep.sweepPace = this.registers.sweep.pace;
      this.frequencySweep.sweepStep = this.registers.sweep.individualStep;
      this.frequencySweep.negative = this.registers.sweep.negative;

      // CH1 period value is copied to the “shadow register”.
      this.frequencySweep.notePeriod = this.notePeriod;

      // The “sweep timer” is reset.
      this.frequencySweep.reset();

      // The “enabled flag” is set if either the sweep pace or individual step are non-zero, cleared otherwise.
      this.frequencySweep.enabled =
        this.registers.sweep.pace > 0 ||
        this.registers.sweep.individualStep > 0;

      // If the individual step is non-zero, frequency calculation and overflow check are performed immediately.
      if (this.registers.sweep.individualStep > 0)
        this.frequencySweep.frequencyCalculationAndOverflowCheck();
    }

    // TODO: Use AUDVOL for left/right volume

    if (!this.registers.env.isDACEnabled) this.isPlaying = false;
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
      this.volumeEnvelope.clock(this, this.registers.env.negative ? -1 : 1);
  }

  frequencySweepTick() {
    if (this.id !== 0) return;

    if (this.registers.sweep.hasSweep && this.frequencySweep.enabled)
      this.frequencySweep.clock();
  }
}
