import byte from "./lib/byte";

export default class Controller {
  constructor() {
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
    this._buttons[button] = isPressed;
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
    this._selectDpad = !byte.getFlag(value, 4);
    this._selectButtons = !byte.getFlag(value, 5);
  }

  _getBit(buttonId, dpadId) {
    const isPressed =
      (this._selectButtons && this._buttons[buttonId]) ||
      (this._selectDpad && this._buttons[dpadId]);

    return isPressed ? 0 : 1;
  }
}
