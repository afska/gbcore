import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

/**
 * OAM DMA source address & start
 * Writing to this register starts a DMA transfer from ROM or RAM to OAM (Object Attribute Memory). The written value specifies the transfer source address divided by $100, that is, source and destination are:
 *   Source:      $XX00-$XX9F   ;XX = $00 to $DF
 *   Destination: $FE00-$FE9F
 * The transfer takes 160 M-cycles: 640 dots (1.4 lines) in normal speed, or 320 dots (0.7 lines) in CGB Double Speed Mode. This is much faster than a CPU-driven copy.
 */
export default class OAMDMA extends InMemoryRegister.PPU {
  onWrite(value) {
    const cpu = this.ppu.cpu;
    if (value > 0xdf) return;

    for (let i = 0; i < 160; i++) {
      const address = byte.buildU16(value, i);
      const data = cpu.memory.read(address);
      cpu.memory.oam[i] = data;
    }

    cpu.pendingCycles += 160;
  }
}
