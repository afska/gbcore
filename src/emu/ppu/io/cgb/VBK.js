import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

/**
 * VBK (CGB Mode only): VRAM bank
 * This register can be written to change VRAM banks. Only bit 0 matters, all other bits are ignored.
 */
export default class VBK extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("bank", 0);
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
