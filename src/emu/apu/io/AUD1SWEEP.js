import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD1SWEEP (aka NR10): Channel 1 sweep
 */
export default class AUD1SWEEP extends InMemoryRegister.APU {
  onLoad() {
    this.addField("individualStep", 0, 3)
      .addField("negative", 3)
      .addField("pace", 4, 3);
  }

  get hasSweep() {
    return this.pace > 0;
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
