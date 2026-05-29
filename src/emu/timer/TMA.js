import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * TMA: Timer modulo
 * When TIMA overflows, it is reset to the value in this register and an interrupt is requested.
 * Example of use: if TMA is set to $FF, an interrupt is requested at the clock frequency selected in TAC (because every increment is an overflow).
 * However, if TMA is set to $FE, an interrupt is only requested every two increments, which effectively divides the selected clock by two.
 * Setting TMA to $FD would divide the clock by three, and so on.
 */
export default class TMA extends InMemoryRegister.Unit {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
