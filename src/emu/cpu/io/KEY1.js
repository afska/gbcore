import hardware from "../../hardware";
import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * KEY1/SPD (CGB Mode only): Prepare speed switch
 * This register is used to prepare the Game Boy to switch between CGB Double Speed Mode and Normal Speed Mode.
 * The actual speed switch is performed by executing a stop instruction after Bit 0 has been set.
 * After that, Bit 0 will be cleared automatically, and the Game Boy will operate at the “other” speed.
 */
export default class KEY1 extends InMemoryRegister.CPU {
  onLoad() {
    this.addField("switchArmed", 0);
  }

  onRead() {
    if (this.cpu.memory.hardwareMode === hardware.DMG) return 0;

    return (+this.cpu.memory.doubleSpeed << 7) | this.value;
  }

  onWrite(value) {
    if (this.cpu.memory.hardwareMode === hardware.DMG) return;

    this.setValue(value & 1);
  }
}
