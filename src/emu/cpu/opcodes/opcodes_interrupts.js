/**
 * DI
 * Reset the interrupt master enable (IME) flag and prohibit maskable interrupts.
 * Even if a DI instruction is executed in an interrupt routine, the IME flag is set if a return is performed with a RETI instruction.
 */
function DI(cpu) {
  cpu.ime = 0;
  cpu.eiCountdown = 0;
}

/**
 * EI
 * Set the interrupt master enable (IME) flag and enable maskable interrupts. This instruction can be used in an interrupt routine to enable higher-order interrupts.
 * The IME flag is reset immediately after an interrupt occurs. The IME flag reset remains in effect if control is returned from the interrupt routine by a RET instruction. However, if an EI instruction is executed in the interrupt routine, control is returned with IME = 1.
 */
function EI(cpu) {
  cpu.eiCountdown = 2;
}

/**
 * HALT
 * Enter CPU low-power consumption mode until an interrupt occurs.
 */
function HALT(cpu) {
  cpu.halted = true;
}

export default [
  // HALT
  {
    id: 0x76,
    run: (cpu) => {
      HALT(cpu);
    },
    cycles: 1
  },

  // DI
  {
    id: 0xf3,
    run: (cpu) => {
      DI(cpu);
    },
    cycles: 1
  },

  // EI
  {
    id: 0xfb,
    run: (cpu) => {
      EI(cpu);
    },
    cycles: 1
  }
];
