export default {
  VBLANK: {
    id: "VBLANK",
    mask: 1 << 0,
    vector: 0x40
  },
  LCD: {
    id: "LCD",
    mask: 1 << 1,
    vector: 0x48
  },
  TIMER: {
    id: "TIMER",
    mask: 1 << 2,
    vector: 0x50
  },
  SERIAL: {
    id: "SERIAL",
    mask: 1 << 3,
    vector: 0x58
  },
  JOYPAD: {
    id: "JOYPAD",
    mask: 1 << 4,
    vector: 0x60
  }
};
