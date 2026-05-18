/**
 * PUSH AF
 * Push the contents of register pair AF into the stack.
 * This is roughly equivalent to the following imaginary instructions:
 *   DEC SP
 *   LD [SP], A
 *   DEC SP
 *   LD [SP], F.Z << 7 | F.N << 6 | F.H << 5 | F.C << 4
 */
function PUSH_AF(cpu) {}

// TODO: IMPLEMENT
