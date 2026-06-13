import byte from "../lib/byte";

/**
 * The Flags Register (lower 8 bits of AF register)
 * Contains information about the result of the most recent instruction that has affected flags.
 */
export default class FlagsRegister {
  constructor() {
    this.zero = false;
    this.subtraction = false;
    this.carry = false;
    this.halfCarry = false;
  }

  getValue() {
    return byte.bitfield(
      0,
      0,
      0,
      0,
      this.carry,
      this.halfCarry,
      this.subtraction,
      this.zero
    );
  }

  setValue(value) {
    this.carry = byte.getFlag(value, 4);
    this.halfCarry = byte.getFlag(value, 5);
    this.subtraction = byte.getFlag(value, 6);
    this.zero = byte.getFlag(value, 7);
  }

  getSaveState() {
    return this.getValue();
  }

  setSaveState(saveState) {
    this.setValue(saveState);
  }
}
