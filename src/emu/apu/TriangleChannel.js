import TriangleOscillator from "../lib/apu/TriangleOscillator";
import LengthCounter from "./LengthCounter";
import LinearLengthCounter from "./LinearLengthCounter";
import byte from "../lib/byte";

export default class TriangleChannel {
  constructor(apu) {
    this.apu = apu;

    this.registers = this.apu.registers.triangle;

    this.oscillator = new TriangleOscillator();
    this.lengthCounter = new LengthCounter();
    this.linearLengthCounter = new LinearLengthCounter();

    this.outputSample = 0;
  }

  sample() {
    if (
      !this.isEnabled() ||
      !this.lengthCounter.isActive() ||
      !this.linearLengthCounter.isActive()
    )
      return this.outputSample;

    const timer = byte.buildU16(
      this.registers.timerHighLCL.timerHigh,
      this.registers.timerLow.value
    );

    // this channel only outputs a sample if the timer is between [2, 0x7ff]
    if (!(timer >= 2 && timer <= 0x7ff)) return 0;

    this.oscillator.frequency = 1789773 / (16 * (timer + 1)) / 2;
    // from nesdev: f = fCPU / (16 * (t + 1))
    // (the pitch is one octave below the pulse channels with an equivalent timer value)
    // (i.e. use the formula above but divide the resulting frequency by two).

    this.outputSample = this.oscillator.sample();

    return this.outputSample;
  }

  quarterFrame() {
    this.linearLengthCounter.clock(
      this.isEnabled(),
      this.registers.lengthControl.halt
    );
  }

  halfFrame() {
    this.lengthCounter.clock(this.isEnabled, this.registers.lengthControl.halt);
  }

  isEnabled() {
    return !!this.apu.registers.apuControl.enableTriangle;
  }
}
