const QUARTERS_4_STEP = [3729, 7457, 11186, 14916];
const QUARTERS_5_STEP = [3729, 7457, 11186, 18641];

export default class FrameSequencer {
  constructor(apu) {
    this.apu = apu;

    this.reset();
  }

  reset() {
    this.counter = 0;
  }

  step() {
    this.counter++;

    const quarters = this.apu.registers.apuFrameCounter.use5StepSequencer
      ? QUARTERS_5_STEP
      : QUARTERS_4_STEP;

    const isQuarter =
      this.counter === quarters[0] ||
      this.counter === quarters[1] ||
      this.counter === quarters[2] ||
      this.counter === quarters[3];
    const isHalf = this.counter === quarters[1] || this.counter === quarters[3];
    const isEnd = this.counter === quarters[3];

    if (isQuarter) this.apu.onQuarterFrameClock();
    if (isHalf) this.apu.onHalfFrameClock();

    if (isEnd) this.reset();
  }
}
