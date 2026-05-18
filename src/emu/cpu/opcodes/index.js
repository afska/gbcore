import arithmetic_8bit from "./arithmetic_8bit";
import arithmetic_16bit from "./arithmetic_16bit";
import bit_flag from "./bit_flag";
import bitwise_logic from "./bitwise_logic";

const operations = [
  ...arithmetic_8bit,
  ...arithmetic_16bit,
  ...bit_flag,
  ...bitwise_logic
];

const normalOperations = new Array(256).fill(null);
const prefixOperations = new Array(256).fill(null);

for (const operation of operations) {
  if (operation.id >= 0xcb00) prefixOperations[operation.id & 0xff] = operation;
  else normalOperations[operation.id] = operation;
}

export function getOperation(opcode, isPrefix) {
  return isPrefix ? prefixOperations[opcode] : normalOperations[opcode];
}
