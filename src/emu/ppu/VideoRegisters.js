import InMemoryRegister from "../lib/InMemoryRegister";
import byte from "../lib/byte";

class PPUCtrl extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("vramAddressIncrement32", 2)
      .addField("sprite8x8PatternTableId", 3)
      .addField("backgroundPatternTableId", 4)
      .addField("spriteSize", 5)
      .addField("generateNMIOnVBlank", 7);
  }

  onWrite(value) {
    this.setValue(value);

    this.ppu.loopy.onPPUCtrlWrite(value);
  }
}

class PPUMask extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("grayscale", 0)
      .addField("showBackgroundInFirst8Pixels", 1)
      .addField("showSpritesInFirst8Pixels", 2)
      .addField("showBackground", 3)
      .addField("showSprites", 4)
      .addField("emphasizeRed", 5)
      .addField("emphasizeGreen", 6)
      .addField("emphasizeBlue", 7);
  }

  isRenderingEnabled() {
    return this.showBackground || this.showSprites;
  }

  transform(color) {
    let r = (color >> 0) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = (color >> 16) & 0xff;

    if (this.grayscale) {
      r = g = b = Math.floor((r + g + b) / 3);
    }

    if (this.emphasizeRed || this.emphasizeGreen || this.emphasizeBlue) {
      const all =
        this.emphasizeRed && this.emphasizeGreen && this.emphasizeBlue;
      if (!this.emphasizeRed || all) r = Math.floor(r * 0.75);
      if (!this.emphasizeGreen || all) g = Math.floor(g * 0.75);
      if (!this.emphasizeBlue || all) b = Math.floor(b * 0.75);
    }

    return 0xff000000 | (r << 0) | (g << 8) | (b << 16);
  }

  onWrite(value) {
    this.setValue(value);
  }
}

class PPUStatus extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("spriteOverflow", 5)
      .addWritableField("sprite0Hit", 6)
      .addWritableField("isInVBlankInterval", 7);

    this.setValue(0b10000000);
  }

  onRead() {
    if (this.ppu.isDebugging) return this.value;

    const value = this.value;

    this.isInVBlankInterval = 0;
    this.ppu.loopy.onPPUStatusRead();

    return value;
  }
}

class OAMAddr extends InMemoryRegister.PPU {
  onWrite(value) {
    this.setValue(value);
  }
}

class OAMData extends InMemoryRegister.PPU {
  onRead() {
    const oamAddress = this.ppu.registers.oamAddr;
    return this.ppu.memory.oamRam[oamAddress.value];
  }

  onWrite(value) {
    const oamAddress = this.ppu.registers.oamAddr;
    this.ppu.memory.oamRam[oamAddress.value] = value;
    this._incrementAddress();
  }

  _incrementAddress() {
    const oamAddress = this.ppu.registers.oamAddr;
    oamAddress.setValue(oamAddress.value + 1);
  }
}

class PPUScroll extends InMemoryRegister.PPU {
  onWrite(value) {
    this.ppu.loopy.onPPUScrollWrite(value);
  }
}

class PPUAddr extends InMemoryRegister.PPU {
  onWrite(value) {
    this.ppu.loopy.onPPUAddrWrite(value);
  }
}

class PPUData extends InMemoryRegister.PPU {
  onLoad() {
    this.buffer = 0;
  }

  onRead() {
    if (this.ppu.isDebugging) return this.buffer;

    let data = this.buffer;

    const ppuAddress = this.ppu.loopy.vAddress.getValue();
    this.buffer = this.ppu.memory.read(ppuAddress);

    if (ppuAddress >= 0x3f00) data = this.buffer;
    this._incrementAddress();

    return data;
  }

  onWrite(value) {
    const ppuAddress = this.ppu.loopy.vAddress.getValue();
    this.ppu.memory.write(ppuAddress, value);
    this._incrementAddress();
  }

  _incrementAddress() {
    const { ppuCtrl } = this.ppu.registers;

    const ppuAddress = this.ppu.loopy.vAddress.getValue();
    this.ppu.loopy.vAddress.setValue(
      byte.toU16(ppuAddress + (ppuCtrl.vramAddressIncrement32 ? 32 : 1))
    );
  }
}

class OAMDMA extends InMemoryRegister.PPU {
  onWrite(value) {
    for (let i = 0; i < 256; i++) {
      const address = byte.buildU16(value, i);
      const data = this.ppu.cpu.memory.read(address);
      this.ppu.memory.oamRam[i] = data;
    }

    this.ppu.cpu.extraCycles += 513;
  }
}

export default class VideoRegisters {
  constructor(ppu) {
    this.ppuCtrl = new PPUCtrl(ppu); //     $2000
    this.ppuMask = new PPUMask(ppu); //     $2001
    this.ppuStatus = new PPUStatus(ppu); // $2002
    this.oamAddr = new OAMAddr(ppu); //     $2003
    this.oamData = new OAMData(ppu); //     $2004
    this.ppuScroll = new PPUScroll(ppu); // $2005
    this.ppuAddr = new PPUAddr(ppu); //     $2006
    this.ppuData = new PPUData(ppu); //     $2007
    this.oamDma = new OAMDMA(ppu); //       $4014
  }

  read(address) {
    return this._getRegister(address)?.onRead();
  }

  write(address, value) {
    this._getRegister(address)?.onWrite(value);
  }

  _getRegister(address) {
    switch (address) {
      case 0x2000:
        return this.ppuCtrl;
      case 0x2001:
        return this.ppuMask;
      case 0x2002:
        return this.ppuStatus;
      case 0x2003:
        return this.oamAddr;
      case 0x2004:
        return this.oamData;
      case 0x2005:
        return this.ppuScroll;
      case 0x2006:
        return this.ppuAddr;
      case 0x2007:
        return this.ppuData;
      case 0x4014:
        return this.oamDma;
      default:
    }
  }
}
