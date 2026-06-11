import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

const READ_MASK = 0b01111111;

/**
 * AUD3HIGH (aka NR34): Channel 3 period high & control
 */
export default class AUD3HIGH extends InMemoryRegister.APU {
  onLoad() {
    this.addWritableField("periodHigh", 0, 3)
      .addField("enableLength", 6)
      .addField("trigger", 7);
  }

  onRead() {
    return this.value & READ_MASK;
  }

  onWrite(value) {
    this.setValue(value);

    if (byte.getFlag(value, 7)) this.apu.channels.wave.trigger();
  }
}
