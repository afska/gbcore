import PulseChannel from "./channnels/PulseChannel";
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
    this.channels = {
      pulses: [new PulseChannel(this, 0), new PulseChannel(this, 1)]
    };

    this.divApu = 0;
  }

  step(onSample) {
    this._processTicks();
    this.channels.pulses[0].step();
    this.channels.pulses[1].step();

    this.sampleCounter++;

    if (this.sampleCounter >= STEPS_PER_SAMPLE) {
      const pulse1 = this.channels.pulses[0].sample();
      const pulse2 = this.channels.pulses[1].sample();

      this.sample = (pulse1 + pulse2) * 0.01;

      this.sampleCounter = 0;
      onSample(this.sample);
    }
  }

  get isEnabled() {
    return !!this.registers.audena.enableAudio;
  }

  reset() {
    for (let i = 0; i < 2; i++) {
      this.registers.pulses[i].low.setValue(0);
      this.registers.pulses[i].high.setValue(0);
      this.registers.pulses[i].len.setValue(0);
      this.registers.pulses[i].env.setValue(0);
    }
    this.registers.pulses[0].sweep.setValue(0);
  }

  _processTicks() {
    const currentDivApu = this.cpu.memory.timer.div;
    for (; this.divApu < currentDivApu; this.divApu++) {
      if (this.divApu % 8 === 0) {
        // Envelope sweep
      }

      if (this.divApu % 2 === 0) {
        // Sound length
        this.channels.pulses[0].lengthTimerTick();
        this.channels.pulses[1].lengthTimerTick();
      }

      if (this.divApu % 4 === 0) {
        // CH1 freq sweep
      }
      // TODO: IMPLEMENT
    }
  }
}
