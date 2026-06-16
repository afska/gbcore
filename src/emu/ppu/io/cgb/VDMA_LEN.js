import hardware from "../../../hardware";
import InMemoryRegister from "../../../lib/InMemoryRegister";
import byte from "../../../lib/byte";

const KB = 1024;
const VRAM_BANK_SIZE = 8 * KB;
const BLOCK_SIZE_BYTES = 16;
const M_CYCLES_PER_BLOCK = 8;
const VRAM_BASE = 0x8000;
const START_BIT = 7;
const DMA_FINISHED = 0xff;

/**
 * VDMA_LEN (aka HDMA5) (CGB Mode only): VRAM DMA length/mode/start
 * These registers are used to initiate a DMA transfer from ROM or RAM to VRAM.
 */
export default class VDMA_LEN extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("transferLength", 0, 7);

    this.isHdmaActive = false;
  }

  gdma() {
    const cpu = this.ppu.cpu;
    const blocks = this.transferLength + 1;

    const src = this.src;
    const destIndex = this.destIndex;
    const dst = VRAM_BASE + this.destIndex;
    const length = Math.min(
      blocks * BLOCK_SIZE_BYTES,
      VRAM_BANK_SIZE - destIndex
    );

    for (let i = 0; i < length; i++) {
      const data = cpu.memory.read(src + i);
      cpu.memory.write(dst + i, data);
    }

    this.src += length;
    this.destIndex += length;

    cpu.cycles +=
      (length / BLOCK_SIZE_BYTES) *
      M_CYCLES_PER_BLOCK *
      (this.ppu.memory.doubleSpeed ? 2 : 1);

    this.setValue(DMA_FINISHED);
  }

  hdma() {
    if (!this.isHdmaActive) return;

    const cpu = this.ppu.cpu;
    const src = this.src;
    const destIndex = this.destIndex;
    const dst = VRAM_BASE + destIndex;
    const length = Math.min(BLOCK_SIZE_BYTES, VRAM_BANK_SIZE - destIndex);
    const isLastBlock = this.transferLength === 0;

    for (let i = 0; i < length; i++) {
      const data = cpu.memory.read(src + i);
      cpu.memory.write(dst + i, data);
    }

    this.src += length;
    this.destIndex += length;

    cpu.cycles += M_CYCLES_PER_BLOCK * (this.ppu.memory.doubleSpeed ? 2 : 1);

    if (isLastBlock || length < BLOCK_SIZE_BYTES) {
      this.isHdmaActive = false;
      this.setValue(DMA_FINISHED);
    } else {
      this.transferLength--;
    }
  }

  get src() {
    const srcHigh = this.ppu.registers.vdmaSrcHigh.value;
    const srcLow = this.ppu.registers.vdmaSrcLow.value;

    return byte.buildU16(srcHigh, srcLow);
  }

  set src(value) {
    const u16 = byte.toU16(value);
    this.ppu.registers.vdmaSrcHigh.setValue(byte.highByteOf(u16));
    this.ppu.registers.vdmaSrcLow.setValue(byte.lowByteOf(u16));
  }

  get destIndex() {
    const destHigh = this.ppu.registers.vdmaDestHigh.value;
    const destLow = this.ppu.registers.vdmaDestLow.value;
    return byte.buildU16(destHigh, destLow);
  }

  set destIndex(value) {
    this.ppu.registers.vdmaDestHigh.setValue(byte.highByteOf(value));
    this.ppu.registers.vdmaDestLow.setValue(byte.lowByteOf(value));
  }

  onRead() {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return 0;

    return (!this.isHdmaActive << START_BIT) | this.transferLength;
  }

  onWrite(value) {
    if (this.ppu.memory.hardwareMode === hardware.DMG) return;

    const hasStartBit0 = !byte.getFlag(value, START_BIT);
    if (hasStartBit0 && this.isHdmaActive) {
      this.isHdmaActive = false;
      return;
    }

    this.setValue(value);

    if (hasStartBit0) {
      // GDMA (General-Purpose DMA)
      this.gdma();
    } else {
      // HDMA (HBlank DMA)
      this.isHdmaActive = true;
    }
  }

  getSaveState() {
    return { ...super.getSaveState(), isHdmaActive: this.isHdmaActive };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.isHdmaActive = saveState.isHdmaActive;
  }
}
