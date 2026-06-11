import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD4POLY (aka NR43): Channel 4 frequency & randomness
 */
export default class AUD4POLY extends InMemoryRegister.APU {
  onLoad() {
    this.addField("clockDivider", 0, 3)
      .addField("shortMode", 3)
      .addField("clockShift", 4, 4);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
