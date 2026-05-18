const tmp = new Register8Bit();

export function withHL(cpu, action) {
  const hl = cpu.registers.hl.getValue();
  const value = cpu.memory.read(hl);

  tmp.setValue(value);
  action(cpu, tmp);
  cpu.memory.write(hl, tmp.getValue());
}
