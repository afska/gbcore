import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

const READ_MASK = 0b01111111;

/**
 * AUD1HIGH/AUD2HIGH (aka NR14/NR24): Channel 1/2 period high & control
 */
export default class AUD12HIGH extends InMemoryRegister.APU {
  onLoad() {
    this.addField("periodHigh", 0, 3)
      .addField("enableLength", 6)
      .addField("trigger", 7);
  }

  onRead() {
    return this.value & READ_MASK;
  }

  onWrite(value) {
    this.setValue(value);

    if (byte.getFlag(value, 7)) this.apu.channels.pulses[this.id].trigger();
  }
}
