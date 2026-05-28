import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

const DMG_COLORS = [0xffffffff, 0xffaaaaaa, 0xff555555, 0xff000000];

/**
 * This register assigns gray shades to the color indices of the BG and Window tiles.
                     7 6   5 4   3 2   1 0
       Color for...  ID 3	ID 2	ID 1	ID 0
   Each of the two-bit values map to a color thusly:
       0	White
       1	Light gray
       2	Dark gray
       3	Black
 */
export default class Palette extends InMemoryRegister.PPU {
  constructor(ppu, initialValue = 0) {
    super(ppu);

    this.setValue(initialValue);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }

  colorFor(colorIndex) {
    const shadeIndex = byte.getBits(this.value, colorIndex * 2, 2);

    return DMG_COLORS[shadeIndex];
  }
}
