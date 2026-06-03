import InMemoryRegister from "../../lib/InMemoryRegister";

const TRIGGER_BIT = 7;

/**
 * AUD1HIGH/AUD2HIGH (aka NR14/NR24): Channel 1/2 period high & control
 */
export default class AUD12HIGH extends InMemoryRegister.APU {
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
