/**
 * SCF
 * Set Carry Flag.
 *
 * N: 0.
 * H: 0.
 * C: 1
 */
function SCF(cpu) {
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = true;
}

/**
 * CCF
 * Complement Carry Flag.
 *
 * N: 0.
 * H: 0.
 * C: Inverted.
 */
function CCF(cpu) {
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !cpu.registers.flags.carry;
}

export default [
  // SCF
  {
    id: 0x37,
    run: (cpu) => {
      SCF(cpu);
    },
    cycles: 1
  },

  // CCF
  {
    id: 0x3f,
    run: (cpu) => {
      CCF(cpu);
    },
    cycles: 1
  }
];
