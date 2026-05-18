import byte from "../lib/byte";

class Register {
  increment() {
    this.setValue(this.getValue() + 1);
  }

  decrement() {
    this.setValue(this.getValue() - 1);
  }
}

export class Register8Bit extends Register {
  constructor() {
    super();

    this._bytes = new Uint8Array(1);
  }

  getValue() {
    return this._bytes[0];
  }

  setValue(value) {
    this._bytes[0] = value;
  }
}

export class Register16Bit extends Register {
  constructor() {
    super();

    this._bytes = new Uint16Array(1);
  }

  getValue() {
    return this._bytes[0];
  }

  setValue(value) {
    this._bytes[0] = value;
  }
}

export class RegisterPair extends Register {
  constructor(high, low) {
    super();

    this._high = high;
    this._low = low;
  }

  getValue() {
    return byte.buildU16(this._high.getValue(), this._low.getValue());
  }

  setValue(value) {
    this._high.setValue(byte.highByteOf(value));
    this._low.setValue(byte.lowByteOf(value));
  }
}
