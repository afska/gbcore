import AudioRegisters from "./io";

const APU_RATE = 4194304;
const SAMPLE_RATE = 44100;
const STEPS_PER_SAMPLE = APU_RATE / SAMPLE_RATE;

export default class APU {
  constructor(cpu) {
    this.cpu = cpu;

    this.sampleCounter = 0;
    this.sample = 0;

    this.registers = new AudioRegisters(this);
  }

  step(onSample) {
    this.sampleCounter++;

    if (this.sampleCounter === STEPS_PER_SAMPLE) {
      this.sampleCounter = 0;
      onSample(this.sample);
    }
  }
}
