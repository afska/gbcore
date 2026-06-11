import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD3LOW (aka NR33): Channel 3 period low
 */
export default class AUD3LOW extends InMemoryRegister.APU {
  onWrite(value) {
    this.setValue(value);
  }
}
