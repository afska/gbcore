import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * STAT: LCD status
 */
export default class STAT extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("ppuMode", 0, 2)
      .addWritableField("lycEqualsLy", 2)
      .addField("mode0InterruptSelect", 3)
      .addField("mode1InterruptSelect", 4)
      .addField("mode2InterruptSelect", 5)
      .addField("lycInterruptSelect", 6);

    this.interruptLine = false;
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    // ppuMode and lycEqualsLy are read-only
    const ppuMode = this.ppuMode;
    const lycEqualsLy = this.lycEqualsLy;

    this.setValue(value);

    this.ppuMode = ppuMode;
    this.lycEqualsLy = lycEqualsLy;

    this.ppu.syncSTAT();
  }
}
