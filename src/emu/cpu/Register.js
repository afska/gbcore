class Register {
  constructor(TypedArray) {
    this._bytes = new TypedArray(1);
  }

  getValue() {
    return this._bytes[0];
  }

  setValue(value) {
    this._bytes[0] = value;
  }

  increment() {
    this.setValue(this.getValue() + 1);
  }

  decrement() {
    this.setValue(this.getValue() - 1);
  }
}

export class Register8Bit extends Register {
  constructor() {
    super(Uint8Array);
  }
}

export class Register16Bit extends Register {
  constructor() {
    super(Uint16Array);
  }
}
