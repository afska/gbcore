import mirroringTypes from "../lib/ppu/mirroringTypes";

const VRAM_SIZE = 4096;
const PALETTE_RAM_SIZE = 32;
const OAM_RAM_SIZE = 256;

export default class PPUMemory {
  constructor() {
    this.vram = new Uint8Array(VRAM_SIZE);
    this.paletteRam = new Uint8Array(PALETTE_RAM_SIZE);
    this.oamRam = new Uint8Array(OAM_RAM_SIZE);
    this.mirroringId = null;
  }

  onLoad(cartridge, mapper) {
    this.cartridge = cartridge;
    this.mapper = mapper;

    this.changeNameTableMirroringTo(cartridge.header.mirroringId);
  }

  changeNameTableMirroringTo(mirroringId) {
    if (this.cartridge.header.mirroringId === "FOUR_SCREEN")
      mirroringId = "FOUR_SCREEN";

    this.mirroringId = mirroringId;
    this._mirroring = mirroringTypes[mirroringId];
  }

  read(address) {
    // Pattern tables 0 and 1 (mapper)
    if (address <= 0x1fff) return this.mapper.ppuRead(address);

    // Name tables 0 to 3 (VRAM + mirror)
    if (address >= 0x2000 && address <= 0x2fff) {
      if (address >= 0x2000 && address < 0x2400)
        return this.vram[this._mirroring.$2000 + address - 0x2000];
      if (address >= 0x2400 && address < 0x2800)
        return this.vram[this._mirroring.$2400 + address - 0x2400];
      if (address >= 0x2800 && address < 0x2c00)
        return this.vram[this._mirroring.$2800 + address - 0x2800];
      if (address >= 0x2c00 && address < 0x3000)
        return this.vram[this._mirroring.$2C00 + address - 0x2c00];
    }

    // Mirrors of $2000-$2EFF
    if (address >= 0x3000 && address <= 0x3eff)
      return this.read(0x2000 + ((address - 0x3000) % 0x1000));

    // Palette RAM indexes
    if (address >= 0x3f00 && address <= 0x3f1f) {
      if (address === 0x3f10) return this.read(0x3f00);
      if (address === 0x3f14) return this.read(0x3f04);
      if (address === 0x3f18) return this.read(0x3f08);
      if (address === 0x3f1c) return this.read(0x3f0c);
      return this.paletteRam[address - 0x3f00];
    }

    // Mirrors of $3F00-$3F1F
    if (address >= 0x3f20 && address <= 0x3fff)
      return this.read(0x3f00 + ((address - 0x3f20) % 0x0020));

    return 0;
  }

  write(address, value) {
    // Pattern tables 0 and 1 (mapper)
    if (address <= 0x1fff) return this.mapper.ppuWrite(address, value);

    // Name tables 0 to 3 (VRAM + mirror)
    if (address >= 0x2000 && address <= 0x2fff) {
      if (address >= 0x2000 && address < 0x2400)
        return (this.vram[this._mirroring.$2000 + address - 0x2000] = value);
      if (address >= 0x2400 && address < 0x2800)
        return (this.vram[this._mirroring.$2400 + address - 0x2400] = value);
      if (address >= 0x2800 && address < 0x2c00)
        return (this.vram[this._mirroring.$2800 + address - 0x2800] = value);
      if (address >= 0x2c00 && address < 0x3000)
        return (this.vram[this._mirroring.$2C00 + address - 0x2c00] = value);
    }

    // Mirrors of $2000-$2EFF
    if (address >= 0x3000 && address <= 0x3eff)
      return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

    // Palette RAM indexes
    if (address >= 0x3f00 && address <= 0x3f1f) {
      if (address === 0x3f10) return this.write(0x3f00, value);
      if (address === 0x3f14) return this.write(0x3f04, value);
      if (address === 0x3f18) return this.write(0x3f08, value);
      if (address === 0x3f1c) return this.write(0x3f0c, value);
      return (this.paletteRam[address - 0x3f00] = value);
    }

    // Mirrors of $3F00-$3F1F
    if (address >= 0x3f20 && address <= 0x3fff)
      return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
  }
}
