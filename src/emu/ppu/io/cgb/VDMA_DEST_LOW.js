import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

/**
 * VDMA_DEST_LOW (aka HDMA4) (CGB Mode only): VRAM DMA destination (low) [write-only]
 * HDMA3 and HDMA4 specify the address within 8000-9FF0 to which the data will be copied.
 * Only bits 12-4 are respected; others are ignored.
 * The four lower bits of this address will be ignored and treated as 0.
 */
export default class VDMA_DEST_LOW extends InMemoryRegister.PPU {
  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value & 0b11110000);
  }
}
