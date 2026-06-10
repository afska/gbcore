import interrupts from "./interrupts";
import byte from "./lib/byte";

/**
 * The eight Game Boy action/direction buttons are arranged as a 2×4 matrix. Select either action or direction buttons by writing to this register, then read out the bits 0-3.
 */
export default class Controller {
  constructor(cpu) {
    this.cpu = cpu;

    this._buttons = {
      BUTTON_LEFT: false,
      BUTTON_RIGHT: false,
      BUTTON_UP: false,
      BUTTON_DOWN: false,
      BUTTON_A: false,
      BUTTON_B: false,
      BUTTON_START: false,
      BUTTON_SELECT: false
    };

    this._selectDpad = false;
    this._selectButtons = false;
  }

  isPressed(button) {
    return this._buttons[button] || false;
  }

  setButton(button, isPressed) {
    this._update(() => {
      this._buttons[button] = !!isPressed;
    });
  }

  onRead() {
    return byte.bitfield(
      this._getBit("BUTTON_A", "BUTTON_RIGHT"),
      this._getBit("BUTTON_B", "BUTTON_LEFT"),
      this._getBit("BUTTON_SELECT", "BUTTON_UP"),
      this._getBit("BUTTON_START", "BUTTON_DOWN"),
      +!this._selectDpad,
      +!this._selectButtons,
      1,
      1
    );
  }

  onWrite(value) {
    this._update(() => {
      this._selectDpad = !byte.getFlag(value, 4);
      this._selectButtons = !byte.getFlag(value, 5);
    });
  }

  _update(fn) {
    const prev = this.onRead() & 0b1111;
    fn();
    const next = this.onRead() & 0b1111;

    if ((prev & next) !== prev) {
      // any of the bits 0-3 changed from High (unpressed) to Low (pressed)
      this.cpu.requestInterrupt(interrupts.JOYPAD);
    }
  }

  _getBit(buttonId, dpadId) {
    const isPressed =
      (this._selectButtons && this._buttons[buttonId]) ||
      (this._selectDpad && this._buttons[dpadId]);

    return isPressed ? 0 : 1;
  }
}
