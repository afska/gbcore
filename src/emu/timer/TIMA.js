import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * TIMA: Timer counter
 * This timer is incremented at the clock frequency specified by the TAC register ($FF07). When the value overflows (exceeds $FF) it is reset to the value specified in TMA (FF06) and an interrupt is requested.
 */
export default class TIMA extends InMemoryRegister.Unit {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
