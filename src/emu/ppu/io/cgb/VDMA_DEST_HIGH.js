import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

/**
 * VDMA_DEST_HIGH (aka HDMA3) (CGB Mode only): VRAM DMA destination (high) [write-only]
 * HDMA3 and HDMA4 specify the address within 8000-9FF0 to which the data will be copied.
 * Only bits 12-4 are respected; others are ignored.
 * The four lower bits of this address will be ignored and treated as 0.
 */
export default class VDMA_DEST_HIGH extends InMemoryRegister.PPU {
  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value & 0b11111);
  }
}
