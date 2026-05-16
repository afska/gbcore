import byte from "../lib/byte";

const BUTTONS = [
  "BUTTON_A",
  "BUTTON_B",
  "BUTTON_SELECT",
  "BUTTON_START",
  "BUTTON_UP",
  "BUTTON_DOWN",
  "BUTTON_LEFT",
  "BUTTON_RIGHT"
];

export default class Controller {
  constructor(player) {
    this.strobe = false;
    this.cursor = 0;
    this.other = null;

    this._player = player;
    this._buttons = [false, false, false, false, false, false, false, false];
  }

  update(button, isPressed) {
    const index = BUTTONS.indexOf(button);
    this._buttons[index] = isPressed;
  }

  onRead() {
    const strobe = this._player === 1 ? this.strobe : this.other.strobe;

    if (this.cursor >= 8) return 1;

    const isPressed = this._buttons[this.cursor];
    if (!strobe) this.cursor++;

    return +isPressed;
  }

  onWrite(value) {
    if (this._player === 2) return;

    this.strobe = byte.getFlag(value, 0);

    if (this.strobe) {
      this.cursor = 0;
      this.other.cursor = 0;
    }
  }
}
