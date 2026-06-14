import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

const PALETTE_RAM_SIZE = 64;

/**
 * BGPD/OBPD (CGB Mode only): Background/OBJ palette data
 */
export default class PD extends InMemoryRegister.PPU {
  constructor(ppu, indexRegister, bankName) {
    super(ppu);

    this.indexRegister = indexRegister;
    this.bankName = bankName;
  }

  onRead() {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return 0;

    const address = this.ppu.registers[this.indexRegister].address;
    return this.ppu.memory[this.bankName][address];
  }

  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    const address = this.ppu.registers[this.indexRegister].address;
    this.ppu.memory[this.bankName][address] = value;

    if (this.ppu.registers[this.indexRegister].autoIncrement)
      this.ppu.registers[this.indexRegister].address =
        (address + 1) % PALETTE_RAM_SIZE;
  }
}
