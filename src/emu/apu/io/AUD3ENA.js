import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD3ENA (aka NR30): Channel 3 DAC enable
 */
export default class AUD3ENA extends InMemoryRegister.APU {
  onLoad() {
    this.addField("isDACEnabled", 7);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    const wasDACEnabled = this.isDACEnabled;

    this.setValue(value);

    if (wasDACEnabled && !this.isDACEnabled) this.apu.channels.wave.stop();
  }
}
