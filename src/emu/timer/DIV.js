import InMemoryRegister from "../lib/InMemoryRegister";
import byte from "../lib/byte";

/**
 * DIV: Divider register
 * This register is incremented at a rate of 16384Hz (~16779Hz on SGB). Writing any value to this register resets it to $00. Additionally, this register is reset when executing the stop instruction, and only begins ticking again once stop mode ends.
 */
export default class DIV extends InMemoryRegister.Unit {
  onLoad() {
    this.divApu = 0;
  }

  onRead() {
    return this.value;
  }

  set(value) {
    const oldValue = this.value;

    this.setValue(value);

    // every time DIV's bit 4 (or 5 in double-speed mode) goes from 1 to 0, DIV-APU is incremented
    const bit = this.unit.cpu.memory.doubleSpeed ? 5 : 4;
    if (byte.getFlag(oldValue, bit) && !byte.getFlag(value, bit)) this.divApu++;
  }

  onWrite(value) {
    this.set(0);
    this.unit.resetDivPhase();
  }

  getSaveState() {
    return {
      ...super.getSaveState(),
      divApu: this.divApu
    };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.divApu = saveState.divApu;
  }
}
