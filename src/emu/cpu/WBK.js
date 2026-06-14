import hardware from "../hardware";
import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * SVBK/WBK (CGB Mode only): WRAM bank
 * In CGB Mode, 32 KiB of internal RAM are available. This memory is divided into 8 banks of 4 KiB each.
 * Bank 0 is always available in memory at C000–CFFF, banks 1–7 can be selected into the address space at D000–DFFF.
 * WRAM bank (Read/Write): Writing a value will map the corresponding bank to D000–DFFF, except 0, which maps bank 1 instead.
 */
export default class WBK extends InMemoryRegister.CPU {
  onLoad() {
    this.addWritableField("bankNumber", 0, 3);
  }

  get selectedBank() {
    return this.bankNumber === 0 ? 1 : this.bankNumber;
  }

  onRead() {
    if (this.cpu.memory.hardwareMode === hardware.DMG) return 0;

    return this.value;
  }

  onWrite(value) {
    if (this.cpu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value);
  }
}
