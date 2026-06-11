import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

const READ_MASK = 0b01111111;

/**
 * AUD4GO (aka NR44): Channel 4 control
 */
export default class AUD4GO extends InMemoryRegister.APU {
  onLoad() {
    this.addField("enableLength", 6).addField("trigger", 7);
  }

  onRead() {
    return this.value & READ_MASK;
  }

  onWrite(value) {
    this.setValue(value);

    if (byte.getFlag(value, 7)) this.apu.channels.noise.trigger();
  }
}
