import AudioRegisters from "./io";
import PulseOscillator from "./oscillators/PulseOscillator";

const APU_RATE = 4194304;
const SAMPLE_RATE = 44100;
const STEPS_PER_SAMPLE = APU_RATE / SAMPLE_RATE;

export default class APU {
  constructor(cpu) {
    this.cpu = cpu;

    this.sampleCounter = 0;
    this.sample = 0;

    this.registers = new AudioRegisters(this);

    this.oscillator = new PulseOscillator();
  }

  step(onSample) {
    this.sampleCounter++;

    if (this.sampleCounter >= STEPS_PER_SAMPLE) {
      const periodValue =
        (this.registers.aud1high.periodHigh << 8) |
        this.registers.aud1low.value;
      this.oscillator.frequency = 131072 / (2048 - periodValue);
      this.sample = periodValue > 0 ? this.oscillator.sample() : 0;

      this.sampleCounter = 0;
      onSample(this.sample);
    }
  }

  get isEnabled() {
    return !!this.registers.audena.enableAudio;
  }

  reset() {
    // TODO: IMPLEMENT
  }
}
