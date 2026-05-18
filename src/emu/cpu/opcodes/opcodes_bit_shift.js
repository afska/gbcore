import { withHL } from "./_helpers";
import byte from "../../lib/byte";

/**
 * RL \target
 * Rotate \target to the left, through the carry flag.
 *   ┏━ Flags ━┓ ┏━━━━ \target ━━━━┓
 * ┌─╂─   C   ←╂─╂─ b7 ← ... ← b0 ←╂─┐
 * │ ┗━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛ │
 * └─────────────────────────────────┘
 * The previous contents of the CY flag are copied to bit 0 of \target.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 7).
 */
function RL(cpu, target, ignoreZ = false) {
  const value = target.getValue();
  const oldCarry = cpu.registers.flags.carry ? 1 : 0;
  const carry = byte.getBit(value, 7);

  target.setValue((value << 1) | oldCarry);
  const result = target.getValue();

  cpu.registers.flags.zero = ignoreZ ? false : result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * RLC \target
 * Rotate \target to the left.
 * ┏━ Flags ━┓   ┏━━━━ \target ━━━━┓
 * ┃    C   ←╂─┬─╂─ b7 ← ... ← b0 ←╂─┐
 * ┗━━━━━━━━━┛ │ ┗━━━━━━━━━━━━━━━━━┛ │
 *             └─────────────────────┘
 * The contents of bit 7 are placed in both the CY flag and bit 0 of \target.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 7).
 */
function RLC(cpu, target, ignoreZ = false) {
  const value = target.getValue();
  const carry = byte.getBit(value, 7);

  target.setValue((value << 1) | carry);
  const result = target.getValue();

  cpu.registers.flags.zero = ignoreZ ? false : result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * RR \target
 * Rotate \target to the right, through the carry flag.
 *   ┏━━━━ \target ━━━━┓ ┏━ Flags ━┓
 * ┌─╂→ b7 → ... → b0 ─╂─╂→   C   ─╂─┐
 * │ ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━┛ │
 * └─────────────────────────────────┘
 * The previous contents of the CY flag are copied to bit 7 of \target.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 0).
 */
function RR(cpu, target, ignoreZ = false) {
  const value = target.getValue();
  const oldCarry = cpu.registers.flags.carry ? 1 : 0;
  const carry = byte.getBit(value, 0);

  target.setValue((value >> 1) | (oldCarry << 7));
  const result = target.getValue();

  cpu.registers.flags.zero = ignoreZ ? false : result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * RRC \target
 * Rotate \target to the right.
 *   ┏━━━━ \target ━━━━┓   ┏━ Flags ━┓
 * ┌─╂→ b7 → ... → b0 ─╂─┬─╂→   C    ┃
 * │ ┗━━━━━━━━━━━━━━━━━┛ │ ┗━━━━━━━━━┛
 * └─────────────────────┘
 * The contents of bit 0 are placed in both the CY flag and bit 7 of \target.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 0).
 */
function RRC(cpu, target, ignoreZ = false) {
  const value = target.getValue();
  const carry = byte.getBit(value, 0);

  target.setValue((value >> 1) | (carry << 7));
  const result = target.getValue();

  cpu.registers.flags.zero = ignoreZ ? false : result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * SLA \target
 * Shift \target to the left, arithmetically.
 * ┏━ Flags ━┓ ┏━━━━ \target ━━━━┓
 * ┃    C   ←╂─╂─ b7 ← ... ← b0 ←╂─ 0
 * ┗━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛
 * The contents of bit 7 are copied to the CY flag, and bit 0 of \target is reset to 0.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 7).
 */
function SLA(cpu, target) {
  const value = target.getValue();
  const carry = byte.getBit(value, 7);

  target.setValue(value << 1);
  const result = target.getValue();

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * SRL \target
 * Shift \target to the right, logically.
 *    ┏━━━━ \target ━━━━┓ ┏━ Flags ━┓
 * 0 ─╂→ b7 → ... → b0 ─╂─╂→   C    ┃
 *    ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━┛
 * The contents of bit 0 are copied to the CY flag, and bit 7 of \target is reset to 0.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 0).
 */
function SRL(cpu, target) {
  const value = target.getValue();
  const carry = byte.getBit(value, 0);

  target.setValue(value >> 1);
  const result = target.getValue();

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * SRA \target
 * Shift \target to the right, arithmetically.
 * ┏━━━━ \target ━━━┓ ┏━ Flags ━┓
 * ┃ b7 → ... → b0 ─╂─╂→   C    ┃
 * ┗━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━┛
 * The contents of bit 0 are copied to the CY flag, and bit 7 of \target is unchanged.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: Set according to result (old bit 0).
 */
function SRA(cpu, target) {
  const value = target.getValue();
  const carry = byte.getBit(value, 0);

  target.setValue((value >> 1) | (value & 0x80));
  const result = target.getValue();

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = !!carry;
}

/**
 * SWAP \target
 * Swap the upper 4 bits in \target and the lower 4 ones.
 *
 * Z: Set if result is 0.
 * N: 0.
 * H: 0.
 * C: 0.
 */
function SWAP(cpu, target) {
  const value = target.getValue();

  target.setValue((value << 4) | (value >> 4));
  const result = target.getValue();

  cpu.registers.flags.zero = result === 0;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = false;
  cpu.registers.flags.carry = false;
}

export default [
  // RLCA
  {
    id: 0x07,
    run: (cpu) => {
      RLC(cpu, cpu.registers.a, true);
    },
    cycles: 1
  },

  // RRCA
  {
    id: 0x0f,
    run: (cpu) => {
      RRC(cpu, cpu.registers.a, true);
    },
    cycles: 1
  },

  // RLA
  {
    id: 0x17,
    run: (cpu) => {
      RL(cpu, cpu.registers.a, true);
    },
    cycles: 1
  },

  // RRA
  {
    id: 0x1f,
    run: (cpu) => {
      RR(cpu, cpu.registers.a, true);
    },
    cycles: 1
  },

  // RLC B
  {
    id: 0xcb00,
    run: (cpu) => {
      RLC(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // RLC C
  {
    id: 0xcb01,
    run: (cpu) => {
      RLC(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // RLC D
  {
    id: 0xcb02,
    run: (cpu) => {
      RLC(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // RLC E
  {
    id: 0xcb03,
    run: (cpu) => {
      RLC(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // RLC H
  {
    id: 0xcb04,
    run: (cpu) => {
      RLC(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // RLC L
  {
    id: 0xcb05,
    run: (cpu) => {
      RLC(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // RLC (HL)
  {
    id: 0xcb06,
    run: (cpu) => {
      withHL(cpu, RLC);
    },
    cycles: 4
  },

  // RLC A
  {
    id: 0xcb07,
    run: (cpu) => {
      RLC(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // RRC B
  {
    id: 0xcb08,
    run: (cpu) => {
      RRC(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // RRC C
  {
    id: 0xcb09,
    run: (cpu) => {
      RRC(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // RRC D
  {
    id: 0xcb0a,
    run: (cpu) => {
      RRC(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // RRC E
  {
    id: 0xcb0b,
    run: (cpu) => {
      RRC(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // RRC H
  {
    id: 0xcb0c,
    run: (cpu) => {
      RRC(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // RRC L
  {
    id: 0xcb0d,
    run: (cpu) => {
      RRC(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // RRC (HL)
  {
    id: 0xcb0e,
    run: (cpu) => {
      withHL(cpu, RRC);
    },
    cycles: 4
  },

  // RRC A
  {
    id: 0xcb0f,
    run: (cpu) => {
      RRC(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // RL B
  {
    id: 0xcb10,
    run: (cpu) => {
      RL(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // RL C
  {
    id: 0xcb11,
    run: (cpu) => {
      RL(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // RL D
  {
    id: 0xcb12,
    run: (cpu) => {
      RL(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // RL E
  {
    id: 0xcb13,
    run: (cpu) => {
      RL(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // RL H
  {
    id: 0xcb14,
    run: (cpu) => {
      RL(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // RL L
  {
    id: 0xcb15,
    run: (cpu) => {
      RL(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // RL (HL)
  {
    id: 0xcb16,
    run: (cpu) => {
      withHL(cpu, RL);
    },
    cycles: 4
  },

  // RL A
  {
    id: 0xcb17,
    run: (cpu) => {
      RL(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // RR B
  {
    id: 0xcb18,
    run: (cpu) => {
      RR(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // RR C
  {
    id: 0xcb19,
    run: (cpu) => {
      RR(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // RR D
  {
    id: 0xcb1a,
    run: (cpu) => {
      RR(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // RR E
  {
    id: 0xcb1b,
    run: (cpu) => {
      RR(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // RR H
  {
    id: 0xcb1c,
    run: (cpu) => {
      RR(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // RR L
  {
    id: 0xcb1d,
    run: (cpu) => {
      RR(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // RR (HL)
  {
    id: 0xcb1e,
    run: (cpu) => {
      withHL(cpu, RR);
    },
    cycles: 4
  },

  // RR A
  {
    id: 0xcb1f,
    run: (cpu) => {
      RR(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // SLA B
  {
    id: 0xcb20,
    run: (cpu) => {
      SLA(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // SLA C
  {
    id: 0xcb21,
    run: (cpu) => {
      SLA(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // SLA D
  {
    id: 0xcb22,
    run: (cpu) => {
      SLA(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // SLA E
  {
    id: 0xcb23,
    run: (cpu) => {
      SLA(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // SLA H
  {
    id: 0xcb24,
    run: (cpu) => {
      SLA(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // SLA L
  {
    id: 0xcb25,
    run: (cpu) => {
      SLA(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // SLA (HL)
  {
    id: 0xcb26,
    run: (cpu) => {
      withHL(cpu, SLA);
    },
    cycles: 4
  },

  // SLA A
  {
    id: 0xcb27,
    run: (cpu) => {
      SLA(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // SRA B
  {
    id: 0xcb28,
    run: (cpu) => {
      SRA(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // SRA C
  {
    id: 0xcb29,
    run: (cpu) => {
      SRA(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // SRA D
  {
    id: 0xcb2a,
    run: (cpu) => {
      SRA(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // SRA E
  {
    id: 0xcb2b,
    run: (cpu) => {
      SRA(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // SRA H
  {
    id: 0xcb2c,
    run: (cpu) => {
      SRA(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // SRA L
  {
    id: 0xcb2d,
    run: (cpu) => {
      SRA(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // SRA (HL)
  {
    id: 0xcb2e,
    run: (cpu) => {
      withHL(cpu, SRA);
    },
    cycles: 4
  },

  // SRA A
  {
    id: 0xcb2f,
    run: (cpu) => {
      SRA(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // SWAP B
  {
    id: 0xcb30,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // SWAP C
  {
    id: 0xcb31,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // SWAP D
  {
    id: 0xcb32,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // SWAP E
  {
    id: 0xcb33,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // SWAP H
  {
    id: 0xcb34,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // SWAP L
  {
    id: 0xcb35,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // SWAP (HL)
  {
    id: 0xcb36,
    run: (cpu) => {
      withHL(cpu, SWAP);
    },
    cycles: 4
  },

  // SWAP A
  {
    id: 0xcb37,
    run: (cpu) => {
      SWAP(cpu, cpu.registers.a);
    },
    cycles: 2
  },

  // SRL B
  {
    id: 0xcb38,
    run: (cpu) => {
      SRL(cpu, cpu.registers.b);
    },
    cycles: 2
  },

  // SRL C
  {
    id: 0xcb39,
    run: (cpu) => {
      SRL(cpu, cpu.registers.c);
    },
    cycles: 2
  },

  // SRL D
  {
    id: 0xcb3a,
    run: (cpu) => {
      SRL(cpu, cpu.registers.d);
    },
    cycles: 2
  },

  // SRL E
  {
    id: 0xcb3b,
    run: (cpu) => {
      SRL(cpu, cpu.registers.e);
    },
    cycles: 2
  },

  // SRL H
  {
    id: 0xcb3c,
    run: (cpu) => {
      SRL(cpu, cpu.registers.h);
    },
    cycles: 2
  },

  // SRL L
  {
    id: 0xcb3d,
    run: (cpu) => {
      SRL(cpu, cpu.registers.l);
    },
    cycles: 2
  },

  // SRL (HL)
  {
    id: 0xcb3e,
    run: (cpu) => {
      withHL(cpu, SRL);
    },
    cycles: 4
  },

  // SRL A
  {
    id: 0xcb3f,
    run: (cpu) => {
      SRL(cpu, cpu.registers.a);
    },
    cycles: 2
  }
];
