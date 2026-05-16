const APU_MIN_TIMER = 8;
const APU_MAX_TIMER = 0x7ff;

export default class FrequencySweep {
  constructor(channel) {
    this.channel = channel;

    // input
    this.startFlag = false;

    // output
    this.dividerCount = 0;
    this.mute = false;
  }

  clock() {
    const register = this.channel.registers.sweep;

    if (
      register.enabledFlag &&
      register.shiftCount > 0 &&
      this.dividerCount === 0 &&
      !this.mute
    ) {
      const sweepDelta = this.channel.timer >> register.shiftCount;
      this.channel.timer += sweepDelta * (register.negateFlag ? -1 : 1);
    }

    if (this.dividerCount === 0 || this.startFlag) {
      this.dividerCount = register.dividerPeriodMinusOne;
      this.startFlag = false;
    } else this.dividerCount--;
  }

  muteIfNeeded() {
    this.mute =
      this.channel.timer < APU_MIN_TIMER || this.channel.timer > APU_MAX_TIMER;
  }
}
