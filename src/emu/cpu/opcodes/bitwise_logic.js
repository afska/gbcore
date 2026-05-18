/**
 * AND \source
 * Take the logical AND for each bit of \source and the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 1.
 * C: 0.
 */
function AND(cpu, source) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const result = currentValue & source;

  target.setValue(result);

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = true;
  cpu.registers.flags.carry = false;
}

/**
 * OR \source
 * Take the logical OR for each bit of \source and the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: 0.
 */
function OR(cpu, source) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const result = currentValue | source;

  target.setValue(result);

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = false;
}

/**
 * XOR \source
 * Take the logical exclusive-OR for each bit of \source and the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: 0.
 */
function XOR(cpu, source) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const result = currentValue ^ source;

  target.setValue(result);

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = false;
}

/**
 * CPL
 * Take the one's complement (i.e., flip all bits) of the contents of register A.
 *
 * N: 1.
 * H: 1.
 */
function CPL(cpu) {
  cpu.registers.a.setValue(~cpu.registers.a.getValue());

  cpu.registers.flags.subtraction = true;
  cpu.registers.flags.halfCarry = true;
}

export default [
  // CPL
  {
    id: 0x2f,
    run: (cpu) => {
      CPL(cpu);
    },
    cycles: 1
  },

  // AND B
  {
    id: 0xa0,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      AND(cpu, b);
    },
    cycles: 1
  },

  // AND C
  {
    id: 0xa1,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      AND(cpu, c);
    },
    cycles: 1
  },

  // AND D
  {
    id: 0xa2,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      AND(cpu, d);
    },
    cycles: 1
  },

  // AND E
  {
    id: 0xa3,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      AND(cpu, e);
    },
    cycles: 1
  },

  // AND H
  {
    id: 0xa4,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      AND(cpu, h);
    },
    cycles: 1
  },

  // AND L
  {
    id: 0xa5,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      AND(cpu, l);
    },
    cycles: 1
  },

  // AND (HL)
  {
    id: 0xa6,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      AND(cpu, value);
    },
    cycles: 2
  },

  // AND A
  {
    id: 0xa7,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      AND(cpu, a);
    },
    cycles: 1
  },

  // XOR B
  {
    id: 0xa8,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      XOR(cpu, b);
    },
    cycles: 1
  },

  // XOR C
  {
    id: 0xa9,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      XOR(cpu, c);
    },
    cycles: 1
  },

  // XOR D
  {
    id: 0xaa,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      XOR(cpu, d);
    },
    cycles: 1
  },

  // XOR E
  {
    id: 0xab,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      XOR(cpu, e);
    },
    cycles: 1
  },

  // XOR H
  {
    id: 0xac,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      XOR(cpu, h);
    },
    cycles: 1
  },

  // XOR L
  {
    id: 0xad,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      XOR(cpu, l);
    },
    cycles: 1
  },

  // XOR (HL)
  {
    id: 0xae,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      XOR(cpu, value);
    },
    cycles: 2
  },

  // XOR A
  {
    id: 0xaf,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      XOR(cpu, a);
    },
    cycles: 1
  },

  // OR B
  {
    id: 0xb0,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      OR(cpu, b);
    },
    cycles: 1
  },

  // OR C
  {
    id: 0xb1,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      OR(cpu, c);
    },
    cycles: 1
  },

  // OR D
  {
    id: 0xb2,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      OR(cpu, d);
    },
    cycles: 1
  },

  // OR E
  {
    id: 0xb3,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      OR(cpu, e);
    },
    cycles: 1
  },

  // OR H
  {
    id: 0xb4,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      OR(cpu, h);
    },
    cycles: 1
  },

  // OR L
  {
    id: 0xb5,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      OR(cpu, l);
    },
    cycles: 1
  },

  // OR (HL)
  {
    id: 0xb6,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      OR(cpu, value);
    },
    cycles: 2
  },

  // OR A
  {
    id: 0xb7,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      OR(cpu, a);
    },
    cycles: 1
  },

  // AND d8
  {
    id: 0xe6,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      AND(cpu, d8);
    },
    cycles: 2
  },

  // XOR d8
  {
    id: 0xee,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      XOR(cpu, d8);
    },
    cycles: 2
  },

  // OR d8
  {
    id: 0xf6,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      OR(cpu, d8);
    },
    cycles: 2
  }
];
