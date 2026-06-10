import mbcs from "./mbcs";

const HEADER_OFFSET = 0x100;
const HEADER_SIZE = 80;
const GLOBAL_CHECKSUM_OFFSET_HIGH = 0x014e;
const GLOBAL_CHECKSUM_OFFSET_LOW = 0x014f;

/**
 * Each cartridge contains a header, located at the address range $0100—$014F. The cartridge header provides information about the game itself and the hardware it expects to run on.
 */
export default class Cartridge {
  constructor(bytes) {
    if (bytes.length < HEADER_OFFSET + HEADER_SIZE)
      throw new Error(
        "File too small: " + bytes.length + " (should be at least 336 bytes)"
      );

    this.bytes = bytes;
    this.header = this._buildHeader();
    this._validateHeaderChecksum();
    // this._validateGlobalChecksum(); // DISABLED

    this.mbc = this._createMBC();
  }

  read(address) {
    return this.mbc.read(address);
  }

  write(address, value) {
    return this.mbc.write(address, value);
  }

  _buildHeader() {
    const romSizeCode = this.bytes[0x0148];
    const ramSizeCode = this.bytes[0x0149];

    return {
      title: this._getString(0x0134, 16), // can be 11 in new cartridges
      manufacturerCode: this._getString(0x013f, 4),
      cgbFlag: this.bytes[0x0143],
      sgbFlag: this.bytes[0x0146],
      cartridgeType: this.bytes[0x0147],
      romBanks16KiB: (() => {
        switch (romSizeCode) {
          case 0x00:
          case 0x01:
          case 0x02:
          case 0x03:
          case 0x04:
          case 0x05:
          case 0x06:
          case 0x07:
          case 0x08:
            return Math.pow(2, 1 + romSizeCode);
          case 0x52:
            return 72;
          case 0x53:
            return 80;
          case 0x54:
            return 96;
          default:
            throw new Error(
              `Invalid ROM size code: 0x${romSizeCode.toString(16)}`
            );
        }
      })(),
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

  _validateHeaderChecksum() {
    const expectedChecksum = this.bytes[0x014d];

    const checksum = new Uint8Array(1);
    for (let address = 0x0134; address <= 0x014c; address++)
      checksum[0] = checksum[0] - this.bytes[address] - 1;

    if (checksum[0] !== expectedChecksum)
      throw new Error(`Bad header checksum: 0x${checksum[0].toString(16)}`);
  }

  _validateGlobalChecksum() {
    const expectedChecksum =
      (this.bytes[GLOBAL_CHECKSUM_OFFSET_HIGH] << 8) |
      this.bytes[GLOBAL_CHECKSUM_OFFSET_LOW];

    const checksum = new Uint16Array(1);
    for (let address = 0; address < this.bytes.length; address++) {
      if (
        address !== GLOBAL_CHECKSUM_OFFSET_HIGH &&
        address !== GLOBAL_CHECKSUM_OFFSET_LOW
      )
        checksum[0] += this.bytes[address];
    }

    if (checksum[0] !== expectedChecksum)
      throw new Error(`Bad global checksum: 0x${checksum.toString(16)}`);
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

  _createMBC() {
    const id = this.header.cartridgeType;
    const type = mbcs.find((it) => it.id === id);
    if (type == null)
      throw new Error(`Unknown cartridge type: 0x${id.toString(16)}`);
    const MBC = type.MBC;
    if (MBC == null)
      throw new Error(
        `Unsupported cartridge type: 0x${id.toString(16)} (${type.name})`
      );

    return new MBC(this);
  }
}
