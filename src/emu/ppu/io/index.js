import IORegisterSegment from "../../lib/IORegisterSegment";
import GrayscalePalette from "./GrayscalePalette";
import LCDC from "./LCDC";
import LY from "./LY";
import LYC from "./LYC";
import OAMDMA from "./OAMDMA";
import SCXY from "./SCXY";
import STAT from "./STAT";
import WXY from "./WXY";
import PD from "./cgb/PD";
import PI from "./cgb/PI";
import VBK from "./cgb/VBK";

/**
 * Video registers: $FF40 - $FF4C
 */
export default class VideoRegisters extends IORegisterSegment {
  constructor(ppu) {
    super();

    this.lcdc = new LCDC(ppu);
    this.stat = new STAT(ppu);
    this.ly = new LY(ppu);
    this.lyc = new LYC(ppu);
    this.oamDma = new OAMDMA(ppu);
    this.bgp = new GrayscalePalette(ppu, 0xfc);
    this.obp0 = new GrayscalePalette(ppu, 0xff);
    this.obp1 = new GrayscalePalette(ppu, 0xff);
    this.scy = new SCXY(ppu);
    this.scx = new SCXY(ppu);
    this.wy = new WXY(ppu);
    this.wx = new WXY(ppu);

    this.vbk = new VBK(ppu);
    this.bgpi = new PI(ppu);
    this.bgpd = new PD(ppu, "bgpi", "paletteRamBackground");
    this.obpi = new PI(ppu);
    this.obpd = new PD(ppu, "obpi", "paletteRamSprites");
  }

  getSaveState() {
    return {
      lcdc: this.lcdc.getSaveState(),
      stat: this.stat.getSaveState(),
      ly: this.ly.getSaveState(),
      lyc: this.lyc.getSaveState(),
      oamDma: this.oamDma.getSaveState(),
      bgp: this.bgp.getSaveState(),
      obp0: this.obp0.getSaveState(),
      obp1: this.obp1.getSaveState(),
      scy: this.scy.getSaveState(),
      scx: this.scx.getSaveState(),
      wy: this.wy.getSaveState(),
      wx: this.wx.getSaveState(),

      vbk: this.vbk.getSaveState(),
      bgpi: this.bgpi.getSaveState(),
      bgpd: this.bgpd.getSaveState(),
      obpi: this.obpi.getSaveState(),
      obpd: this.obpd.getSaveState()
    };
  }

  setSaveState(saveState) {
    this.lcdc.setSaveState(saveState.lcdc);
    this.stat.setSaveState(saveState.stat);
    this.ly.setSaveState(saveState.ly);
    this.lyc.setSaveState(saveState.lyc);
    this.oamDma.setSaveState(saveState.oamDma);
    this.bgp.setSaveState(saveState.bgp);
    this.obp0.setSaveState(saveState.obp0);
    this.obp1.setSaveState(saveState.obp1);
    this.scy.setSaveState(saveState.scy);
    this.scx.setSaveState(saveState.scx);
    this.wy.setSaveState(saveState.wy);
    this.wx.setSaveState(saveState.wx);

    this.vbk.setSaveState(saveState.vbk);
    this.bgpi.setSaveState(saveState.bgpi);
    this.bgpd.setSaveState(saveState.bgpd);
    this.obpi.setSaveState(saveState.obpi);
    this.obpd.setSaveState(saveState.obpd);
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
      case 0xff47:
        return this.bgp;
      case 0xff48:
        return this.obp0;
      case 0xff49:
        return this.obp1;
      case 0xff4a:
        return this.wy;
      case 0xff4b:
        return this.wx;
      case 0xff4f:
        return this.vbk;
      case 0xff68:
        return this.bgpi;
      case 0xff69:
        return this.bgpd;
      case 0xff6a:
        return this.obpi;
      case 0xff6b:
        return this.obpd;
      default:
    }
  }
}
