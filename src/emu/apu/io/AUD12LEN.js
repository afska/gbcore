import InMemoryRegister from "../../lib/InMemoryRegister";

const READ_MASK = 0b11000000;

/**
 * AUD1LEN/AUD2LEN (aka NR11/NR21): Channel 1/2 length timer & duty cycle
 */
export default class AUD12HIGH extends InMemoryRegister.APU {
  onLoad() {
    this.addField("initialLengthTimer", 0, 6).addField("dutyCycle", 6, 2);
  }

  onRead() {
    return this.value & READ_MASK;
  }

  onWrite(value) {
    this.setValue(value);

    this.apu.channels.pulses[this.id].lengthCounter.counter =
      this.initialLengthTimer;
  }
}
