import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";
import byte from "../../../lib/byte";

const KB = 1024;
const VRAM_BANK_SIZE = 8 * KB;
const M_CYCLES_PER_BLOCK = 8;

/**
 * VDMA_LEN (aka HDMA5) (CGB Mode only): VRAM DMA length/mode/start
 * These registers are used to initiate a DMA transfer from ROM or RAM to VRAM.
 */
export default class VDMA_LEN extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("transferLength", 0, 7).addField("mode", 7);
  }

  onRead() {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return 0;

    return this.value;
  }

  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value);

    const cpu = this.ppu.cpu;
    const blocks = this.transferLength + 1;
    if (this.mode === 0) {
      // GDMA (General-Purpose DMA)

      const srcHigh = this.ppu.registers.vdmaSrcHigh.value;
      const srcLow = this.ppu.registers.vdmaSrcLow.value;
      const src = byte.buildU16(srcHigh, srcLow);
      const destHigh = this.ppu.registers.vdmaDestHigh.value;
      const destLow = this.ppu.registers.vdmaDestLow.value;
      const destIndex = byte.buildU16(destHigh, destLow);
      const length = Math.min(blocks * 0x10, VRAM_BANK_SIZE - destIndex);

      for (let i = 0; i < length; i++) {
        const data = cpu.memory.read(src + i);
        cpu.memory.write(0x8000 + destIndex + i, data);
      }

      cpu.cycles += (length / 0x10) * M_CYCLES_PER_BLOCK; // TODO: * 2 in double speed mode

      this.setValue(0xff);
    } else {
      // HDMA (HBlank DMA)
    }
  }
}
