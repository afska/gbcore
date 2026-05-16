/** CPU interrupts. */
export default {
  // Non-maskable interrupt (triggered by the PPU during VBlank, if enabled)
  NMI: {
    id: "NMI",
    vector: 0xfffa
  },

  // Reset (triggered when the system is powered on or reset)
  RESET: {
    id: "RESET",
    vector: 0xfffc
  },

  // Maskable interrupt request (triggered by hardware like mappers)
  IRQ: {
    id: "IRQ",
    vector: 0xfffe
  },

  // Software interrupt (triggered by executing the BRK instruction)
  BRK: {
    id: "BRK",
    vector: 0xfffe
  }
};
