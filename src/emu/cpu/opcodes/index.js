import arithmetic_8bit from "./opcodes_arithmetic_8bit";
import arithmetic_16bit from "./opcodes_arithmetic_16bit";
import bit_flag from "./opcodes_bit_flag";
import bit_shift from "./opcodes_bit_shift";
import bitwise_logic from "./opcodes_bitwise_logic";
import carry_flag from "./opcodes_carry_flag";
import interrupts from "./opcodes_interrupts";
import jumps from "./opcodes_jumps";
import load from "./opcodes_load";
import misc from "./opcodes_misc";
import stack from "./opcodes_stack";

const operations = [
  ...arithmetic_8bit,
  ...arithmetic_16bit,
  ...bit_flag,
  ...bit_shift,
  ...bitwise_logic,
  ...carry_flag,
  ...interrupts,
  ...jumps,
  ...load,
  ...misc,
  ...stack
];

const NOP = misc[0];
const normalOperations = new Array(256).fill(NOP);
const prefixOperations = new Array(256).fill(NOP);

for (const operation of operations) {
  if (operation.id >= 0xcb00) prefixOperations[operation.id & 0xff] = operation;
  else normalOperations[operation.id] = operation;
}

export function getOperation(opcode, isPrefix) {
  return isPrefix ? prefixOperations[opcode] : normalOperations[opcode];
}
