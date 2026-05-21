/** A group of I/O registers mapped into memory. */
export default class IORegisterSegment {
  /** Called when the CPU reads an address in this range. */
  read(address) {
    return this._getRegister(address)?.onRead();
  }

  /** Called when the CPU writes to an address in this range. */
  write(address, value) {
    this._getRegister(address)?.onWrite(value);
  }

  _getRegister(address) {
    throw new Error("not_implemented");
  }
}
