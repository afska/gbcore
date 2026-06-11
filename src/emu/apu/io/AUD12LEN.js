import InMemoryRegister from "../../lib/InMemoryRegister";

const READ_MASK = 0b11000000;

/**
 * AUD1LEN/AUD2LEN (aka NR11/NR21): Channel 1/2 length counter & duty cycle
 */
export default class AUD12LEN extends InMemoryRegister.APU {
  onLoad() {
    this.addField("initialLengthCounter", 0, 6).addField("dutyCycle", 6, 2);
  }

  onRead() {
    return this.value & READ_MASK;
  }

  onWrite(value) {
    this.setValue(value);

    this.apu.channels.pulses[this.id].lengthCounter.set(
      this.initialLengthCounter
    );
  }
}
