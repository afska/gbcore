import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * LYC: LY compare
 * The Game Boy constantly compares the value of the LYC and LY registers. When both values are identical, the "LYC=LY" flag in the STAT register is set, and (if enabled) a STAT interrupt is requested.
 */
export default class LYC extends InMemoryRegister.PPU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);

    this.ppu.syncSTAT();
  }
}
