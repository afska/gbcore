import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD1ENV/AUD2ENV (aka NR12/NR22): Channel 1/2 volume & envelope
 */
export default class AUD12ENV extends InMemoryRegister.APU {
  onLoad() {
    this.addField("sweepPace", 0, 3)
      .addField("negative", 3)
      .addField("initialVolume", 4, 3);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
