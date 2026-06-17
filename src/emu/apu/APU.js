import NoiseChannel from "./channels/NoiseChannel";
import PulseChannel from "./channels/PulseChannel";
import WaveChannel from "./channels/WaveChannel";
import AudioRegisters from "./io";

export const APU_RATE = 4194304;
const SAMPLE_RATE = 44100;
const STEPS_PER_SAMPLE = APU_RATE / SAMPLE_RATE;
const MAX_VOLUME = 15;
const NUM_CHANNELS = 4;

/**
 * The Game Boy’s sound chip is called the APU.
 */
export default class APU {
  constructor(memory) {
    this.memory = memory;

    this.sampleCounter = 0;
    this.sample = [0, 0];

    this.registers = new AudioRegisters(this);
    this.channels = {
      pulses: [new PulseChannel(this, 0), new PulseChannel(this, 1)],
      wave: new WaveChannel(this),
      noise: new NoiseChannel(this)
    };

    this.divApu = 0;
  }

  reset() {
    for (let i = 0; i < 2; i++) this.channels.pulses[i].reset();
    this.channels.wave.reset();
    this.channels.noise.reset();
  }

  step(onSample) {
    if (!this.isEnabled) return;

    this._processTicks();
    this.channels.pulses[0].step();
    this.channels.pulses[1].step();
    this.channels.wave.step();
    this.channels.noise.step();

    this.sampleCounter++;

    if (this.sampleCounter >= STEPS_PER_SAMPLE) {
      const pulse1 = this._normalizeSample(this.channels.pulses[0]);
      const pulse2 = this._normalizeSample(this.channels.pulses[1]);
      const wave = this._normalizeSample(this.channels.wave);
      const noise = this._normalizeSample(this.channels.noise);

      this._mix(pulse1, pulse2, wave, noise);

      this.sampleCounter -= STEPS_PER_SAMPLE;
      onSample(this.sample[0], this.sample[1]);
    }
  }

  get isEnabled() {
    return !!this.registers.audena.enableAudio;
  }

  getSaveState() {
    return {
      sampleCounter: this.sampleCounter,
      divApu: this.divApu,
      registers: this.registers.getSaveState(),
      channels: {
        pulses: this.channels.pulses.map((it) => it.getSaveState()),
        wave: this.channels.wave.getSaveState(),
        noise: this.channels.noise.getSaveState()
      }
    };
  }

  setSaveState(saveState) {
    this.sampleCounter = saveState.sampleCounter;
    this.divApu = saveState.divApu;
    this.registers.setSaveState(saveState.registers);

    this.channels.pulses.forEach((it, i) =>
      it.setSaveState(saveState.channels.pulses[i])
    );
    this.channels.wave.setSaveState(saveState.channels.wave);
    this.channels.noise.setSaveState(saveState.channels.noise);
  }

  _processTicks() {
    const currentDivApu = this.memory.timer.div.divApu;
    for (; this.divApu < currentDivApu; this.divApu++) {
      if (this.divApu % 8 === 0) {
        // Envelope sweep
        this.channels.pulses[0].volumeEnvelopeTick();
        this.channels.pulses[1].volumeEnvelopeTick();
        this.channels.noise.volumeEnvelopeTick();
      }

      if (this.divApu % 2 === 0) {
        // Sound length
        this.channels.pulses[0].lengthCounterTick();
        this.channels.pulses[1].lengthCounterTick();
        this.channels.wave.lengthCounterTick();
        this.channels.noise.lengthCounterTick();
      }

      if (this.divApu % 4 === 0) {
        // CH1 freq sweep
        this.channels.pulses[0].frequencySweepTick();
      }
    }
  }

  _mix(pulse1, pulse2, wave, noise) {
    const term = this.registers.audterm;
    const vol = this.registers.audvol;

    let left = 0;
    let right = 0;

    if (term.channel1Left) left += pulse1;
    if (term.channel2Left) left += pulse2;
    if (term.channel3Left) left += wave;
    if (term.channel4Left) left += noise;

    if (term.channel1Right) right += pulse1;
    if (term.channel2Right) right += pulse2;
    if (term.channel3Right) right += wave;
    if (term.channel4Right) right += noise;

    left /= NUM_CHANNELS;
    right /= NUM_CHANNELS;

    // Master volume
    // A value of 0 is treated as a volume of 1 (very quiet), and a value of 7 is treated as a volume of 8 (no volume reduction).
    // Importantly, the amplifier never mutes a non-silent input.
    left *= (vol.leftVolume + 1) / 8;
    right *= (vol.rightVolume + 1) / 8;

    this.sample[0] = left;
    this.sample[1] = right;
  }

  _normalizeSample(channel) {
    const sample = channel.sample();

    // conversion from (0 .. volume) to a zero-centered range:
    //   e.g. (0 .. 15) to (-1 .. 1)
    // starting from (0 .. volume), if we multiply by 2 we get a (0 .. volume*2) range
    // so we shift everything by volume to get a (-volume .. volume) range
    // then, we divide by MAX_VOLUME, so (-15 .. 15) becomes (-1 .. 1) and (-7.5 .. 7.5) becomes (-0.5 .. 0.5)
    return (sample * 2 - channel.volume) / MAX_VOLUME;
  }
}
