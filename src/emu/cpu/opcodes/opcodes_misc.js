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

export default [
  // DAA
  {
    id: 0x27,
    run: (cpu) => {
      DAA(cpu);
    },
    cycles: 1
  }
];
