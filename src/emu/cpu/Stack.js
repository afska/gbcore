import byte from "../lib/byte";

const STACK_ADDRESS = 0x0100;

export default class Stack {
  constructor(memory, sp) {
    this._memory = memory;
    this._sp = sp;
  }

  push(value) {
    this._memory.write(this._currentAddress(), value);
    this._sp.decrement();
  }

  pop() {
    this._sp.increment();
    return this._memory.read(this._currentAddress());
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

  _currentAddress() {
    return STACK_ADDRESS + this._sp.getValue();
  }
}
