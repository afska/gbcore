import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * STAT: LCD status
 * LCDC is the main LCD Control register.
 * Its bits toggle what elements are displayed on the screen, and how.
 */
export default class STAT extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("ppuMode", 0, 2)
      .addWritableField("lycEqualsLy", 2)
      .addField("mode0InterruptSelect", 3)
      .addField("mode1InterruptSelect", 4)
      .addField("mode2InterruptSelect", 5)
      .addField("lycInterruptSelect", 6);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
