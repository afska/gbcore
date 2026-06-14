import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

/**
 * BGPI/OBPI (CGB Mode only): Background/OBJ palette index
 */
export default class PI extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("address", 0, 6).addField("autoIncrement", 7);
  }

  onRead() {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return 0;

    return this.value;
  }

  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value);
  }
}
