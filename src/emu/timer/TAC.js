import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * TAC: Timer control
 * Enable: Controls whether TIMA is incremented. Note that DIV is always counting, regardless of this bit.
 * Clock select: Controls the frequency at which TIMA is incremented.
 */
export default class TAC extends InMemoryRegister.Unit {
  onLoad() {
    this.addField("clockSelect", 0, 2).addField("enable", 2);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }

  get incrementInterval() {
    switch (this.clockSelect) {
      case 0b00:
        return 256;
      case 0b01:
        return 4;
      case 0b10:
        return 16;
      case 0b11:
        return 64;
    }
  }
}
