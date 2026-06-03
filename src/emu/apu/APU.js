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

    this.oscillator1 = new PulseOscillator();
    this.oscillator2 = new PulseOscillator();
  }

  step(onSample) {
    this.sampleCounter++;

    if (this.sampleCounter >= STEPS_PER_SAMPLE) {
      const periodValue1 =
        (this.registers.aud1high.periodHigh << 8) |
        this.registers.aud1low.value;
      this.oscillator1.frequency = 131072 / (2048 - periodValue1);
      const sample1 = periodValue1 > 0 ? this.oscillator1.sample() : 0;

      const periodValue2 =
        (this.registers.aud2high.periodHigh << 8) |
        this.registers.aud2low.value;
      this.oscillator2.frequency = 131072 / (2048 - periodValue2);
      const sample2 = periodValue2 > 0 ? this.oscillator2.sample() : 0;

      this.sample = (sample1 + sample2) / 2;

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
