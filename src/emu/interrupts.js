/**
 * Interrupt sources.
 */
export default {
  // This interrupt is requested every time the Game Boy enters VBlank (Mode 1).
  VBLANK: {
    id: "VBLANK",
    mask: 1 << 0,
    vector: 0x40
  },
  // There are various sources which can trigger this interrupt to occur as described in STAT register ($FF41).
  LCD: {
    id: "LCD",
    mask: 1 << 1,
    vector: 0x48
  },
  // The timer interrupt is requested every time that the timer overflows (that is, when TIMA exceeds $FF).
  TIMER: {
    id: "TIMER",
    mask: 1 << 2,
    vector: 0x50
  },
  // The serial interrupt is requested upon completion of a serial data transfer. In other words, eight serial clock cycles after starting a transfer (by setting SC bit 7), the incoming data will be in SB and the interrupt will be requested.
  SERIAL: {
    id: "SERIAL",
    mask: 1 << 3,
    vector: 0x58
  },
  // The Joypad interrupt is requested when any of P1 bits 0-3 change from High to Low. This happens when a button is pressed (provided that the action/direction buttons are enabled by bit 5/4, respectively), however, due to switch bounce, one or more High to Low transitions are usually produced when pressing a button.
  JOYPAD: {
    id: "JOYPAD",
    mask: 1 << 4,
    vector: 0x60
  }
};
