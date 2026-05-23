const HEADER_OFFSET = 0x100;
const HEADER_SIZE = 80;
const KB = 1024;

export default class Cartridge {
  constructor(bytes) {
    if (bytes.length < HEADER_OFFSET + HEADER_SIZE)
      throw new Error("Invalid ROM: should be at least 336 bytes.");

    this.bytes = bytes;
    this.header = this._buildHeader();
    this._validateROM();
  }

  read(address) {
    if (address >= 0x0000 && address < 0x8000) {
      return this.bytes[address] ?? 0xff;
    }

    return 0xff;
  }

  write(address, value) {
    // TODO: IMPLEMENT
  }

  _buildHeader() {
    const ramSizeCode = this.bytes[0x0149];

    return {
      title: this._getString(0x0134, 16),
      manufacturerCode: this._getString(0x013f, 4),
      cgbFlag: this.bytes[0x0143],
      sgbFlag: this.bytes[0x0146],
      cartridgeType: this.bytes[0x0147],
      romSize: 32 * KB * (1 << this.bytes[0x0148]),
      ramBanks8KiB: (() => {
        switch (ramSizeCode) {
          case 0x02:
            return 1;
          case 0x03:
            return 4;
          case 0x04:
            return 16;
          case 0x05:
            return 8;
          default:
            return 0;
        }
      })(),
      version: this.bytes[0x014c],
      headerChecksum: this.bytes[0x014d],
      globalChecksum: (this.bytes[0x014e] << 8) | this.bytes[0x014f]
    };
  }

  _validateROM() {
    // TODO: IMPLEMENT
  }

  _getString(offset, maxLength) {
    const stringBytes = Array.from(
      this.bytes.subarray(offset, offset + maxLength)
    );
    const firstNull = stringBytes.indexOf(0);

    return stringBytes
      .filter((it, i) => it > 0 && (firstNull === -1 || i < firstNull))
      .map((it) => String.fromCharCode(it))
      .join("");
  }
}
