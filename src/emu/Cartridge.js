import byte from "./lib/byte";

const KB = 1024;
const HEADER_SIZE = 16;
const PRG_PAGE_SIZE = 16 * KB;
const CHR_PAGE_SIZE = 8 * KB;

export default class Cartridge {
  constructor(bytes) {
    this.bytes = bytes;
    this._checkMagicConstant();

    this.header = this._buildHeader();
  }

  prg() {
    return this.bytes.slice(
      this._prgOffset(),
      this._prgOffset() + this._prgSize()
    );
  }

  chr() {
    if (this.header.usesChrRam) return new Uint8Array(CHR_PAGE_SIZE);

    return this.bytes.slice(
      this._chrOffset(),
      this._chrOffset() + this._chrSize()
    );
  }

  _prgOffset() {
    return HEADER_SIZE + (this.header.has512BytePadding ? 512 : 0);
  }

  _prgSize() {
    return this.header.prgRomPages * PRG_PAGE_SIZE;
  }

  _chrOffset() {
    return this._prgOffset() + this._prgSize();
  }

  _chrSize() {
    return this.header.chrRomPages * CHR_PAGE_SIZE;
  }

  _buildHeader() {
    const prgRomPages = this.bytes[4];
    const chrRomPages = this.bytes[5];
    const flags6 = this.bytes[6];
    const flags7 = this.bytes[7];

    return {
      prgRomPages,
      chrRomPages,
      usesChrRam: chrRomPages === 0,
      has512BytePadding: byte.getFlag(flags6, 2),
      hasPrgRam: byte.getFlag(flags6, 1),
      mirroringId: byte.getFlag(flags6, 3)
        ? "FOUR_SCREEN"
        : byte.getFlag(flags6, 0)
        ? "VERTICAL"
        : "HORIZONTAL",
      mapperId: byte.buildU8(
        byte.highNybbleOf(flags7),
        byte.highNybbleOf(flags6)
      )
    };
  }

  _checkMagicConstant() {
    if (
      this.bytes[0] !== 0x4e ||
      this.bytes[1] !== 0x45 ||
      this.bytes[2] !== 0x53 ||
      this.bytes[3] !== 0x1a
    ) {
      throw new Error("Invalid ROM.");
    }
  }
}
