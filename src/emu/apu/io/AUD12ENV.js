import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD1ENV/AUD2ENV (aka NR12/NR22): Channel 1/2 volume & envelope
 */
export default class AUD12ENV extends InMemoryRegister.APU {
  onLoad() {
    this.addField("sweepPace", 0, 3)
      .addField("increase", 3)
      .addField("initialVolume", 4, 4);
  }

  get isDACEnabled() {
    // Channel x’s DAC is enabled if and only if [NRx2] & $F8 != 0
    return (this.value & 0xf8) !== 0;
  }

  get hasEnvelope() {
    return this.sweepPace > 0;
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    const wasDACEnabled = this.isDACEnabled;

    this.setValue(value);

    if (wasDACEnabled && !this.isDACEnabled)
      this.apu.channels.pulses[this.id].stop();
  }
}
