import InMemoryRegister from "../../lib/InMemoryRegister";

const READ_ONLY_BITS = 0b111;

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
    this.setValue((value & ~READ_ONLY_BITS) | (this.value & READ_ONLY_BITS));

    this.ppu.syncSTAT();
  }

  getSaveState() {
    return {
      ...super.getSaveState(),
      interruptLine: this.interruptLine
    };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.interruptLine = saveState.interruptLine;
  }
}
