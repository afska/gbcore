import IORegisterSegment from "../../lib/IORegisterSegment";
import AUDENA from "./AUDENA";
import AUDTERM from "./AUDTERM";
import AUDVOL from "./AUDVOL";

export default class AudioRegisters extends IORegisterSegment {
  constructor(apu) {
    super();

    this.audena = new AUDENA(apu);
    this.audterm = new AUDTERM(apu);
    this.audvol = new AUDVOL(apu);
  }

  _getRegister(address) {
    switch (address) {
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
