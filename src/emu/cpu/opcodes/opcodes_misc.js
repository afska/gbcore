import byte from "../../lib/byte";

/**
 * DAA
 * Decimal Adjust Accumulator.
 * Designed to be used after performing an arithmetic instruction (ADD, ADC, SUB, SBC) whose inputs were in Binary-Coded Decimal (BCD), adjusting the result to likewise be in BCD.
 *
 * Z: Set if result is 0.
 * H: 0.
 * C: Set if carry occurred (if N=1, preserved).
 */
function DAA(cpu) {
  const target = cpu.registers.a;
  const flags = cpu.registers.flags;

  let value = target.getValue();

  if (flags.subtraction) {
    if (flags.carry) value -= 0x60;
    if (flags.halfCarry) value -= 0x06;
  } else {
    if (flags.carry || value > 0x99) {
      value += 0x60;
      flags.carry = true;
    }

    if (flags.halfCarry || byte.lowNybbleOf(value) > 0x09) {
      value += 0x06;
    }
  }

  target.setValue(value);

  flags.zero = target.getValue() === 0;
  flags.halfCarry = false;
}

/**
 * The STOP instruction is intended to switch the Game Boy into VERY low power standby mode.
 * For example, a program may use this feature when it hasn’t sensed keyboard input for a longer period (for example, when somebody forgot to turn off the Game Boy).
 * No licensed rom makes use of STOP outside of CGB speed switching.
 */
function STOP(cpu) {
  cpu.fetchProgramByte(); // ignored byte

  if (!cpu.memory.key1.switchArmed) return;

  cpu.memory.doubleSpeed = !cpu.memory.doubleSpeed;
  cpu.memory.key1.setValue(0);
  cpu.memory.timer.div.set(0);
  cpu.memory.timer.resetDivPhase();
  cpu.cycles += 2050;
}

export default [
  // NOP
  {
    id: 0x00,
    run: (cpu) => {},
    cycles: 1
  },

  // STOP
  {
    id: 0x10,
    run: (cpu) => {
      STOP(cpu);
    },
    cycles: 1
  },

  // DAA
  {
    id: 0x27,
    run: (cpu) => {
      DAA(cpu);
    },
    cycles: 1
  }
];
