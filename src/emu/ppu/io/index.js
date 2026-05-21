import IORegisterSegment from "../../lib/IORegisterSegment";
import LCDC from "./LCDC";
import STAT from "./STAT";
import LY from "./LY";
import LYC from "./LYC";

export default class VideoRegisters extends IORegisterSegment {
  constructor(ppu) {
    super();

    this.lcdc = new LCDC(ppu);
    this.stat = new STAT(ppu);
    this.ly = new LY(ppu);
    this.lyc = new LYC(ppu);
  }

  _getRegister(address) {
    switch (address) {
      case 0xff40:
        return this.lcdc;
      case 0xff41:
        return this.stat;
      case 0xff44:
        return this.ly;
      case 0xff45:
        return this.lyc;
      default:
    }
  }
}
