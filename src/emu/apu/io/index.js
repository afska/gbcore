import IORegisterSegment from "../../lib/IORegisterSegment";
import AUD1SWEEP from "./AUD1SWEEP";
import AUD4ENV from "./AUD4ENV";
import AUD4GO from "./AUD4GO";
import AUD4LEN from "./AUD4LEN";
import AUD4POLY from "./AUD4POLY";
import AUD12ENV from "./AUD12ENV";
import AUD12HIGH from "./AUD12HIGH";
import AUD12LEN from "./AUD12LEN";
import AUD12LOW from "./AUD12LOW";
import AUDENA from "./AUDENA";
import AUDTERM from "./AUDTERM";
import AUDVOL from "./AUDVOL";

const AUDENA_ADDR = 0xff26;

/**
 * Audio registers: $FF10 - $FF27
 */
export default class AudioRegisters extends IORegisterSegment {
  constructor(apu) {
    super();

    this.audena = new AUDENA(apu);
    this.audterm = new AUDTERM(apu);
    this.audvol = new AUDVOL(apu);

    this.pulses = [0, 1].map((it) => ({
      low: new AUD12LOW(apu, it),
      high: new AUD12HIGH(apu, it),
      len: new AUD12LEN(apu, it),
      env: new AUD12ENV(apu, it),
      sweep: it === 0 ? new AUD1SWEEP(apu) : null
    }));
    this.noise = {
      go: new AUD4GO(apu),
      poly: new AUD4POLY(apu),
      len: new AUD4LEN(apu),
      env: new AUD4ENV(apu)
    };
  }

  write(address, value) {
    if (!this.audena.enableAudio && address !== AUDENA_ADDR) return;

    super.write(address, value);
  }

  _getRegister(address) {
    switch (address) {
      case 0xff10:
        return this.pulses[0].sweep;
      case 0xff11:
        return this.pulses[0].len;
      case 0xff12:
        return this.pulses[0].env;
      case 0xff13:
        return this.pulses[0].low;
      case 0xff14:
        return this.pulses[0].high;
      case 0xff16:
        return this.pulses[1].len;
      case 0xff17:
        return this.pulses[1].env;
      case 0xff18:
        return this.pulses[1].low;
      case 0xff19:
        return this.pulses[1].high;
      case 0xff20:
        return this.noise.len;
      case 0xff21:
        return this.noise.env;
      case 0xff22:
        return this.noise.poly;
      case 0xff23:
        return this.noise.go;
      case 0xff24:
        return this.audvol;
      case 0xff25:
        return this.audterm;
      case AUDENA_ADDR:
        return this.audena;
      default:
    }
  }
}
