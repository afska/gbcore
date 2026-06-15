import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";

/**
 * VDMA_SRC_HIGH (aka HDMA1) (CGB Mode only): VRAM DMA source (high) [write-only]
 * HDMA1 and HDMA2 specify the address at which the transfer will read data from.
 * The four lower bits of this address will be ignored and treated as 0.
 */
export default class VDMA_SRC_HIGH extends InMemoryRegister.PPU {
  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value);
  }
}
