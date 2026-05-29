import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * DIV: Divider register
 * This register is incremented at a rate of 16384Hz (~16779Hz on SGB). Writing any value to this register resets it to $00. Additionally, this register is reset when executing the stop instruction, and only begins ticking again once stop mode ends.
 */
export default class DIV extends InMemoryRegister.Unit {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(0);
    this.unit.resetDivPhase();
  }
}
