import PulseChannel from "./channnels/PulseChannel";
import AudioRegisters from "./io";

const APU_RATE = 4194304;
const SAMPLE_RATE = 44100;
const STEPS_PER_SAMPLE = APU_RATE / SAMPLE_RATE;
const MAX_VOLUME = 15;

/**
 * The Game Boy’s sound chip is called the APU.
 */
export default class APU {
  constructor(cpu) {
    this.cpu = cpu;

    this.sampleCounter = 0;
    this.sample = [0, 0];

    this.registers = new AudioRegisters(this);
    this.channels = {
      pulses: [new PulseChannel(this, 0), new PulseChannel(this, 1)]
    };

    this.divApu = 0;
  }

  reset() {
    for (let i = 0; i < 2; i++) this.channels.pulses[i].reset();
  }

  step(onSample) {
    this._processTicks();
    this.channels.pulses[0].step();
    this.channels.pulses[1].step();

    this.sampleCounter++;

    if (this.sampleCounter >= STEPS_PER_SAMPLE) {
      const pulse1 = this.channels.pulses[0].sample();
      const pulse2 = this.channels.pulses[1].sample();

      this._mix(pulse1, pulse2);

      this.sampleCounter -= STEPS_PER_SAMPLE;
      onSample(this.sample[0], this.sample[1]);
    }
  }

  get isEnabled() {
    return !!this.registers.audena.enableAudio;
  }

  _processTicks() {
    const currentDivApu = this.cpu.memory.timer.div.divApu;
    for (; this.divApu < currentDivApu; this.divApu++) {
      if (this.divApu % 8 === 0) {
        // Envelope sweep
        this.channels.pulses[0].volumeEnvelopeTick();
        this.channels.pulses[1].volumeEnvelopeTick();
      }

      if (this.divApu % 2 === 0) {
        // Sound length
        this.channels.pulses[0].lengthCounterTick();
        this.channels.pulses[1].lengthCounterTick();
      }

      if (this.divApu % 4 === 0) {
        // CH1 freq sweep
        this.channels.pulses[0].frequencySweepTick();
      }
    }
  }

  _mix(pulse1, pulse2) {
    const term = this.registers.audterm;
    const vol = this.registers.audvol;

    let left = 0;
    let right = 0;
    let leftChannels = 0;
    let rightChannels = 0;

    if (this.channels.pulses[0].isPlaying && term.channel1Left) {
      left += pulse1;
      leftChannels++;
    }
    if (this.channels.pulses[1].isPlaying && term.channel2Left) {
      left += pulse2;
      leftChannels++;
    }
    if (this.channels.pulses[0].isPlaying && term.channel1Right) {
      right += pulse1;
      rightChannels++;
    }
    if (this.channels.pulses[1].isPlaying && term.channel2Right) {
      right += pulse2;
      rightChannels++;
    }

    // Centering
    // We move the signal from 0..15 to -1..1
    if (leftChannels) left = (left / (MAX_VOLUME * leftChannels)) * 2 - 1;
    if (rightChannels) right = (right / (MAX_VOLUME * rightChannels)) * 2 - 1;

    // Master volume
    // A value of 0 is treated as a volume of 1 (very quiet), and a value of 7 is treated as a volume of 8 (no volume reduction).
    // Importantly, the amplifier never mutes a non-silent input.
    left *= (vol.leftVolume + 1) / 8;
    right *= (vol.rightVolume + 1) / 8;

    this.sample[0] = left;
    this.sample[1] = right;
  }
}
