import byte from "../lib/byte";

export default class FlagsRegister {
  constructor() {
    this.c = false;
    this.z = false;
    this.i = false;
    this.d = false;
    this.v = false;
    this.n = false;
  }

  getValue() {
    return byte.bitfield(this.c, this.z, this.i, this.d, 0, 1, this.v, this.n);
  }

  setValue(value) {
    this.c = byte.getFlag(value, 0);
    this.z = byte.getFlag(value, 1);
    this.i = byte.getFlag(value, 2);
    this.d = byte.getFlag(value, 3);
    this.v = byte.getFlag(value, 6);
    this.n = byte.getFlag(value, 7);
  }

  updateZero(value) {
    this.z = value === 0;
  }

  updateNegative(value) {
    this.n = byte.isNegative(value);
  }

  updateZeroAndNegative(value) {
    this.updateZero(value);
    this.updateNegative(value);
  }
}
