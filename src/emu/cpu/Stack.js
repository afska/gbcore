import byte from "../lib/byte";

/**
 * A stack that lives in WRAM.
 */
export default class Stack {
  constructor(memory, sp) {
    this._memory = memory;
    this._sp = sp;
  }

  push(value) {
    this._sp.decrement();
    this._memory.write(this._sp.getValue(), value);
  }

  pop() {
    const value = this._memory.read(this._sp.getValue());
    this._sp.increment();

    return value;
  }

  push16(value) {
    this.push(byte.highByteOf(value));
    this.push(byte.lowByteOf(value));
  }

  pop16() {
    const low = this.pop();
    const high = this.pop();

    return byte.buildU16(high, low);
  }
}
