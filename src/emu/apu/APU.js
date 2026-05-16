import AudioRegisters from "./AudioRegisters";
import FrameSequencer from "./FrameSequencer";
import PulseChannel from "./PulseChannel";
import TriangleChannel from "./TriangleChannel";
import NoiseChannel from "./NoiseChannel";
import DMCChannel from "./DMCChannel";

const FREQ_APU_HZ = 894887;
const APU_SAMPLE_RATE = 44100;
const STEPS_PER_SAMPLE = Math.floor(FREQ_APU_HZ / APU_SAMPLE_RATE);

export default class APU {
  constructor(cpu) {
    this.cpu = cpu;

    this.sampleCounter = 0;
    this.sample = 0;

    this.registers = new AudioRegisters(this);
    this.frameSequencer = new FrameSequencer(this);
    this.channels = {
      pulses: [
        new PulseChannel(this, 0, "enablePulse1"),
        new PulseChannel(this, 1, "enablePulse2")
      ],
      triangle: new TriangleChannel(this),
      noise: new NoiseChannel(this),
      dmc: new DMCChannel(this, this.cpu)
    };
  }

  step(onSample) {
    this.channels.pulses[0].step();
    this.channels.pulses[1].step();
    this.channels.noise.step();
    this.channels.dmc.step();

    this.sampleCounter++;
    this.frameSequencer.step();

    if (this.sampleCounter === STEPS_PER_SAMPLE) {
      this.sampleCounter = 0;

      const pulse1 = this.channels.pulses[0].sample();
      const pulse2 = this.channels.pulses[1].sample();
      const triangle = this.channels.triangle.sample();
      const noise = this.channels.noise.sample();
      const dmc = this.channels.dmc.sample();
      const pulseOut = 0.00752 * (pulse1 + pulse2);
      const tndOut = 0.00851 * triangle + 0.00494 * noise + 0.00335 * dmc;
      this.sample = pulseOut + tndOut;

      onSample(this.sample, pulse1, pulse2, triangle, noise, dmc);
    }
  }

  onQuarterFrameClock() {
    this.channels.pulses[0].quarterFrame();
    this.channels.pulses[1].quarterFrame();
    this.channels.triangle.quarterFrame();
    this.channels.noise.quarterFrame();
  }

  onHalfFrameClock() {
    this.channels.pulses[0].halfFrame();
    this.channels.pulses[1].halfFrame();
    this.channels.triangle.halfFrame();
    this.channels.noise.halfFrame();
  }
}
