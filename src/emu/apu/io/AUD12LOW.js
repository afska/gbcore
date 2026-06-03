import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUD1LOW/AUD2LOW (aka NR13/NR23): Channel 1/2 period low
 */
export default class AUD12LOW extends InMemoryRegister.APU {
  onWrite(value) {
    this.setValue(value);
  }
}
