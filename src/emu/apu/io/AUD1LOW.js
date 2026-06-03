import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD1LOW (aka NR13): Channel 1 period low
 */
export default class AUD1LOW extends InMemoryRegister.APU {
  onWrite(value) {
    this.setValue(value);
  }
}
