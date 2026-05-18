/**
 * ADD \target, \addend
 * Add \addend to the contents of 16-bit register \target, and store the results in \target.
 *
 * N: 0.
 * H: Set if overflow from bit 11.
 * C: Set if overflow from bit 15.
 */
function ADD16(cpu, addend, target) {
  const currentValue = target.getValue();
  const result = currentValue + addend;

  target.setValue(result);

  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry =
    (currentValue & 0x0fff) + (addend & 0x0fff) > 0x0fff;
  cpu.registers.flags.carry = result > 0xffff;
}

/**
 * DEC \target
 * Decrement the contents of 16-bit register \target by 1.
 */
function INC16(cpu, target) {
  target.setValue(target.getValue() + 1);
}

function DEC16(cpu, target) {
  target.setValue(target.getValue() - 1);
}

export default [
  // INC BC
  {
    id: 0x03,
    run: (cpu) => {
      const bc = cpu.registers.bc;
      INC16(cpu, bc);
    },
    cycles: 2
  },

  // ADD HL, BC
  {
    id: 0x09,
    run: (cpu) => {
      const bc = cpu.registers.bc.getValue();
      ADD16(cpu, bc, cpu.registers.hl);
    },
    cycles: 2
  },

  // DEC BC
  {
    id: 0x0b,
    run: (cpu) => {
      const bc = cpu.registers.bc;
      DEC16(cpu, bc);
    },
    cycles: 2
  },

  // INC DE
  {
    id: 0x13,
    run: (cpu) => {
      const de = cpu.registers.de;
      INC16(cpu, de);
    },
    cycles: 2
  },

  // ADD HL, DE
  {
    id: 0x19,
    run: (cpu) => {
      const de = cpu.registers.de.getValue();
      ADD16(cpu, de, cpu.registers.hl);
    },
    cycles: 2
  },

  // DEC DE
  {
    id: 0x1b,
    run: (cpu) => {
      const de = cpu.registers.de;
      DEC16(cpu, de);
    },
    cycles: 2
  },

  // INC HL
  {
    id: 0x23,
    run: (cpu) => {
      const hl = cpu.registers.hl;
      INC16(cpu, hl);
    },
    cycles: 2
  },

  // ADD HL, HL
  {
    id: 0x29,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      ADD16(cpu, hl, cpu.registers.hl);
    },
    cycles: 2
  },

  // DEC HL
  {
    id: 0x2b,
    run: (cpu) => {
      const hl = cpu.registers.hl;
      DEC16(cpu, hl);
    },
    cycles: 2
  }
];
