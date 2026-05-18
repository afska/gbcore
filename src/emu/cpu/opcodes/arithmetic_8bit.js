import { withHL } from "./_helpers";
import byte from "../lib/byte";

/**
 * ADD A, \addend
 * Add \addend to the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: Set if overflow from bit 3.
 * C: Set if overflow from bit 7.
 */
function ADD(cpu, addend) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const result = currentValue + addend;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry =
    byte.lowNybbleOf(currentValue) + byte.lowNybbleOf(addend) > 0b1111;
  cpu.registers.flags.carry = result > 0xff;
}

/**
 * ADC A, \addend
 * Add \addend and the CY flag to the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: Set if overflow from bit 3.
 * C: Set if overflow from bit 7.
 */
function ADC(cpu, addend) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const carry = cpu.registers.flags.carry;
  const result = currentValue + addend + carry;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry =
    byte.lowNybbleOf(currentValue) + byte.lowNybbleOf(addend) + carry > 0b1111;
  cpu.registers.flags.carry = result > 0xff;
}

/**
 * SUB \subtrahend
 * Subtract \subtrahend from the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 1.
 * H: Set if borrow from bit 4.
 * C: Set if borrow (i.e. if \subtrahend > A).
 */
function SUB(cpu, subtrahend) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const result = currentValue - subtrahend;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = true;
  cpu.registers.flags.halfCarry =
    byte.lowNybbleOf(subtrahend) > byte.lowNybbleOf(currentValue);
  cpu.registers.flags.carry = subtrahend > currentValue;
}

/**
 * SBC A, \subtrahend
 * Subtract \subtrahend and the CY flag from the contents of register A, and store the results in register A.
 *
 * Z: Set if result is 0.
 * N: 1.
 * H: Set if borrow from bit 4.
 * C: Set if borrow (i.e. if (\subtrahend + carry) > A).
 */
function SBC(cpu, subtrahend) {
  const target = cpu.registers.a;
  const currentValue = target.getValue();
  const carry = cpu.registers.flags.carry;
  const result = currentValue - subtrahend - carry;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = true;
  cpu.registers.flags.halfCarry =
    byte.lowNybbleOf(subtrahend) + carry > byte.lowNybbleOf(currentValue);
  cpu.registers.flags.carry = subtrahend + carry > currentValue;
}

/**
 * CP \value
 * Compare \value and the contents of register A by calculating A - \value, and set the Z flag if they are equal.
 * The execution of this instruction does not affect the contents of register A.
 *
 * Z: Set if result is 0.
 * N: 1.
 * H: Set if borrow from bit 4.
 * C: Set if borrow (i.e. if \value > A).
 */
function CP(cpu, value) {
  const a = cpu.registers.a.getValue();
  SUB(cpu, value);
  cpu.registers.a.setValue(a);
}

/**
 * INC \target
 * Increment the value in \target by 1.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: Set if overflow from bit 3.
 */
function INC(cpu, target) {
  const currentValue = target.getValue();
  const result = currentValue + 1;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = byte.lowNybbleOf(currentValue) + 1 > 0b1111;
}

/**
 * DEC \target
 * Decrement the value in \target by 1.
 *
 * Z: Set if result is 0.
 * N: 1.
 * H: Set if borrow from bit 4.
 */
function DEC(cpu, target) {
  const currentValue = target.getValue();
  const result = currentValue - 1;

  target.setValue(result);
  const newValue = target.getValue();

  cpu.registers.flags.zero = newValue === 0;
  cpu.registers.flags.subtraction = true;
  cpu.registers.flags.halfCarry = 1 > byte.lowNybbleOf(currentValue);
}

export default [
  // INC B
  {
    id: 0x04,
    run: (cpu) => {
      const b = cpu.registers.b;
      INC(cpu, b);
    },
    cycles: 1
  },

  // INC C
  {
    id: 0x0c,
    run: (cpu) => {
      const c = cpu.registers.c;
      INC(cpu, c);
    },
    cycles: 1
  },

  // DEC B
  {
    id: 0x05,
    run: (cpu) => {
      const b = cpu.registers.b;
      DEC(cpu, b);
    },
    cycles: 1
  },

  // DEC C
  {
    id: 0x0d,
    run: (cpu) => {
      const c = cpu.registers.c;
      DEC(cpu, c);
    },
    cycles: 1
  },

  // INC D
  {
    id: 0x14,
    run: (cpu) => {
      const d = cpu.registers.d;
      INC(cpu, d);
    },
    cycles: 1
  },

  // INC E
  {
    id: 0x1c,
    run: (cpu) => {
      const e = cpu.registers.e;
      INC(cpu, e);
    },
    cycles: 1
  },

  // INC H
  {
    id: 0x24,
    run: (cpu) => {
      const h = cpu.registers.h;
      INC(cpu, h);
    },
    cycles: 1
  },

  // INC L
  {
    id: 0x2c,
    run: (cpu) => {
      const l = cpu.registers.l;
      INC(cpu, l);
    },
    cycles: 1
  },

  // INC (HL)
  {
    id: 0x34,
    run: (cpu) => {
      withHL(cpu, INC);
    },
    cycles: 3
  },

  // INC A
  {
    id: 0x3c,
    run: (cpu) => {
      const a = cpu.registers.a;
      INC(cpu, a);
    },
    cycles: 1
  },

  // DEC D
  {
    id: 0x15,
    run: (cpu) => {
      const d = cpu.registers.d;
      DEC(cpu, d);
    },
    cycles: 1
  },

  // DEC E
  {
    id: 0x1d,
    run: (cpu) => {
      const e = cpu.registers.e;
      DEC(cpu, e);
    },
    cycles: 1
  },

  // DEC H
  {
    id: 0x25,
    run: (cpu) => {
      const h = cpu.registers.h;
      DEC(cpu, h);
    },
    cycles: 1
  },

  // DEC L
  {
    id: 0x2d,
    run: (cpu) => {
      const l = cpu.registers.l;
      DEC(cpu, l);
    },
    cycles: 1
  },

  // DEC (HL)
  {
    id: 0x35,
    run: (cpu) => {
      withHL(cpu, DEC);
    },
    cycles: 3
  },

  // DEC A
  {
    id: 0x3d,
    run: (cpu) => {
      const a = cpu.registers.a;
      DEC(cpu, a);
    },
    cycles: 1
  },

  // ADD A, B
  {
    id: 0x80,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      ADD(cpu, b);
    },
    cycles: 1
  },

  // ADD A, C
  {
    id: 0x81,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      ADD(cpu, c);
    },
    cycles: 1
  },

  // ADD A, D
  {
    id: 0x82,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      ADD(cpu, d);
    },
    cycles: 1
  },

  // ADD A, E
  {
    id: 0x83,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      ADD(cpu, e);
    },
    cycles: 1
  },

  // ADD A, H
  {
    id: 0x84,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      ADD(cpu, h);
    },
    cycles: 1
  },

  // ADD A, L
  {
    id: 0x85,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      ADD(cpu, l);
    },
    cycles: 1
  },

  // ADD A, (HL)
  {
    id: 0x86,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      ADD(cpu, value);
    },
    cycles: 2
  },

  // ADD A, A
  {
    id: 0x87,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      ADD(cpu, a);
    },
    cycles: 1
  },

  // ADC A, B
  {
    id: 0x88,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      ADC(cpu, b);
    },
    cycles: 1
  },

  // ADC A, C
  {
    id: 0x89,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      ADC(cpu, c);
    },
    cycles: 1
  },

  // ADC A, D
  {
    id: 0x8a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      ADC(cpu, d);
    },
    cycles: 1
  },

  // ADC A, E
  {
    id: 0x8b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      ADC(cpu, e);
    },
    cycles: 1
  },

  // ADC A, H
  {
    id: 0x8c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      ADC(cpu, h);
    },
    cycles: 1
  },

  // ADC A, L
  {
    id: 0x8d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      ADC(cpu, l);
    },
    cycles: 1
  },

  // ADC A, (HL)
  {
    id: 0x8e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      ADC(cpu, value);
    },
    cycles: 2
  },

  // ADC A, A
  {
    id: 0x8f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      ADC(cpu, a);
    },
    cycles: 1
  },

  // SUB B
  {
    id: 0x90,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      SUB(cpu, b);
    },
    cycles: 1
  },

  // SUB C
  {
    id: 0x91,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      SUB(cpu, c);
    },
    cycles: 1
  },

  // SUB D
  {
    id: 0x92,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      SUB(cpu, d);
    },
    cycles: 1
  },

  // SUB E
  {
    id: 0x93,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      SUB(cpu, e);
    },
    cycles: 1
  },

  // SUB H
  {
    id: 0x94,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      SUB(cpu, h);
    },
    cycles: 1
  },

  // SUB L
  {
    id: 0x95,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      SUB(cpu, l);
    },
    cycles: 1
  },

  // SUB (HL)
  {
    id: 0x96,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      SUB(cpu, value);
    },
    cycles: 2
  },

  // SUB A
  {
    id: 0x97,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      SUB(cpu, a);
    },
    cycles: 1
  },

  // SBC A, B
  {
    id: 0x98,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      SBC(cpu, b);
    },
    cycles: 1
  },

  // SBC A, C
  {
    id: 0x99,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      SBC(cpu, c);
    },
    cycles: 1
  },

  // SBC A, D
  {
    id: 0x9a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      SBC(cpu, d);
    },
    cycles: 1
  },

  // SBC A, E
  {
    id: 0x9b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      SBC(cpu, e);
    },
    cycles: 1
  },

  // SBC A, H
  {
    id: 0x9c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      SBC(cpu, h);
    },
    cycles: 1
  },

  // SBC A, L
  {
    id: 0x9d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      SBC(cpu, l);
    },
    cycles: 1
  },

  // SBC A, (HL)
  {
    id: 0x9e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      SBC(cpu, value);
    },
    cycles: 2
  },

  // SBC A, A
  {
    id: 0x9f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      SBC(cpu, a);
    },
    cycles: 1
  },

  // CP B
  {
    id: 0xb8,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      CP(cpu, b);
    },
    cycles: 1
  },

  // CP C
  {
    id: 0xb9,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      CP(cpu, c);
    },
    cycles: 1
  },

  // CP D
  {
    id: 0xba,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      CP(cpu, d);
    },
    cycles: 1
  },

  // CP E
  {
    id: 0xbb,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      CP(cpu, e);
    },
    cycles: 1
  },

  // CP H
  {
    id: 0xbc,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      CP(cpu, h);
    },
    cycles: 1
  },

  // CP L
  {
    id: 0xbd,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      CP(cpu, l);
    },
    cycles: 1
  },

  // CP (HL)
  {
    id: 0xbe,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      CP(cpu, value);
    },
    cycles: 2
  },

  // CP A
  {
    id: 0xbf,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      CP(cpu, a);
    },
    cycles: 1
  },

  // ADD A, d8
  {
    id: 0xc6,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      ADD(cpu, d8);
    },
    cycles: 2
  },

  // ADC A, d8
  {
    id: 0xce,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      ADC(cpu, d8);
    },
    cycles: 2
  },

  // SUB d8
  {
    id: 0xd6,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      SUB(cpu, d8);
    },
    cycles: 2
  },

  // SBC A, d8
  {
    id: 0xde,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      SBC(cpu, d8);
    },
    cycles: 2
  },

  // CP d8
  {
    id: 0xfe,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      CP(cpu, d8);
    },
    cycles: 2
  }
];
