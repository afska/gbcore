import IORegisterSegment from "../../lib/IORegisterSegment";
import LCDC from "./LCDC";
import STAT from "./STAT";
import LY from "./LY";
import LYC from "./LYC";
import OAMDMA from "./OAMDMA";
import SCXY from "./SCXY";
import WXY from "./WXY";

export default class VideoRegisters extends IORegisterSegment {
  constructor(ppu) {
    super();

    this.lcdc = new LCDC(ppu);
    this.stat = new STAT(ppu);
    this.ly = new LY(ppu);
    this.lyc = new LYC(ppu);
    this.oamDma = new OAMDMA(ppu);
    this.scy = new SCXY(ppu);
    this.scx = new SCXY(ppu);
    this.wy = new WXY(ppu);
    this.wx = new WXY(ppu);
  }

  _getRegister(address) {
    switch (address) {
      case 0xff40:
        return this.lcdc;
      case 0xff41:
        return this.stat;
      case 0xff42:
        return this.scy;
      case 0xff43:
        return this.scx;
      case 0xff44:
        return this.ly;
      case 0xff45:
        return this.lyc;
      case 0xff46:
        return this.oamDma;
      case 0xff4a:
        return this.wy;
      case 0xff4b:
        return this.wx;
      default:
    }
  }
}
