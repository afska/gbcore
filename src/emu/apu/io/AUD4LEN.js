import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD4LEN (aka NR41): Channel 4 length counter
 */
export default class AUD4LEN extends InMemoryRegister.APU {
  onLoad() {
    this.addField("initialLengthCounter", 0, 6);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);

    this.apu.channels.noise.lengthCounter.set(this.initialLengthCounter);
  }
}
