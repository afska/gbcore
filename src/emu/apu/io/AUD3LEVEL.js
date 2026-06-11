import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD3LEVEL (aka NR32): Channel 3 output level
 */
export default class AUD3LEVEL extends InMemoryRegister.APU {
  onLoad() {
    this.addField("outputLevel", 5, 2);
  }

  get volumeFactor() {
    switch (this.outputLevel) {
      case 0b00:
        return 0;
      case 0b01:
        return 1;
      case 0b10:
        return 0.5;
      case 0b11:
        return 0.25;
      default:
        return 1;
    }
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
