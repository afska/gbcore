import InMemoryRegister from "../../lib/InMemoryRegister";

const TRIGGER_BIT = 7;

/**
 * AUD1HIGH (aka NR14): Channel 1 period high & control
 */
export default class AUD1HIGH extends InMemoryRegister.APU {
  onLoad() {
    this.addField("periodHigh", 0, 3)
      .addField("enableLength", 6)
      .addField("trigger", TRIGGER_BIT);
  }

  onRead() {
    return this.value & ~(1 << TRIGGER_BIT);
  }

  onWrite(value) {
    this.setValue(value);
  }
}
