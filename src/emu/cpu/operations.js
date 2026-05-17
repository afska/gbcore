import instructions from "./instructions";

function defineOperations(operations) {
  const sortedOperations = [];
  for (let i = 0; i < 256; i++)
    sortedOperations.push(operations.find((it) => it.opcode === i) || null);
  return sortedOperations;
}

const normalOperations = defineOperations([
  {
    opcode: 0xfe,
    instruction: instructions.ADD("c")
  }
]);

const prefixOperations = defineOperations([]);

export default (opcode, isPrefix) => {
  return isPrefix ? normalOperations[opcode] : prefixOperations[opcode];
};
