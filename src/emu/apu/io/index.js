import IORegisterSegment from "../../lib/IORegisterSegment";
import AUD1HIGH from "./AUD1HIGH";
import AUD1LOW from "./AUD1LOW";
import AUDENA from "./AUDENA";
import AUDTERM from "./AUDTERM";
import AUDVOL from "./AUDVOL";

export default class AudioRegisters extends IORegisterSegment {
  constructor(apu) {
    super();

    this.audena = new AUDENA(apu);
    this.audterm = new AUDTERM(apu);
    this.audvol = new AUDVOL(apu);
    this.aud1low = new AUD1LOW(apu);
    this.aud1high = new AUD1HIGH(apu);
  }

  _getRegister(address) {
    switch (address) {
      case 0xff13:
        return this.aud1low;
      case 0xff14:
        return this.aud1high;
      case 0xff24:
        return this.audvol;
      case 0xff25:
        return this.audterm;
      case 0xff26:
        return this.audena;
      default:
    }
  }
}
