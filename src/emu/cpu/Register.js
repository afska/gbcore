import byte from "../lib/byte";

/**
 * A CPU register.
 */
class Register {
  increment() {
    this.setValue(this.getValue() + 1);
  }

  decrement() {
    this.setValue(this.getValue() - 1);
  }

  getSaveState() {
    return this.getValue();
  }

  setSaveState(saveState) {
    this.setValue(saveState);
  }
}

/**
 * An 8-bit CPU register.
 */
export class Register8Bit extends Register {
  constructor(initialValue) {
    super();

    this._bytes = new Uint8Array(1);
    if (initialValue != null) this.setValue(initialValue);
  }

  getValue() {
    return this._bytes[0];
  }

  setValue(value) {
    this._bytes[0] = value;
  }
}

/**
 * A 16-bit CPU register.
 */
export class Register16Bit extends Register {
  constructor(initialValue) {
    super();

    this._bytes = new Uint16Array(1);
    if (initialValue != null) this.setValue(initialValue);
  }

  getValue() {
    return this._bytes[0];
  }

  setValue(value) {
    this._bytes[0] = value;
  }
}

/**
 * A 16-bit register formed by combining two 8-bit registers.
 */
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
