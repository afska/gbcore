import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD3LEN (aka NR31): Channel 3 length counter
 */
export default class AUD3LEN extends InMemoryRegister.APU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);

    this.apu.channels.wave.lengthCounter.set(this.value);
  }
}
