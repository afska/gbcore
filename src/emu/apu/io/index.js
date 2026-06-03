import IORegisterSegment from "../../lib/IORegisterSegment";
import AUDENA from "./AUDENA";

export default class AudioRegisters extends IORegisterSegment {
  constructor(apu) {
    super();

    this.audena = new AUDENA(apu);
  }

  _getRegister(address) {
    switch (address) {
      case 0xff26:
        return this.audena;
      default:
    }
  }
}
