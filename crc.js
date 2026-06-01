/**
 * crc.js - Joyonway CRC-32 calculation (algorithm by @alexbde)
 *
 * Reverse-engineered by @alexbde and shared on the HA community thread:
 * https://community.home-assistant.io/t/joyonway-spa-control/582344
 *
 * Original repo: https://github.com/alexbde/ha-joyonway-p25b85
 *
 * Cross-validated by @KnapTheBuilder on P23B32 V2 captures and
 * @Yannickt26's P20B29 setpoint captures (9 of 11 frames OK).
 *
 * Algorithm parameters:
 *   - Polynomial : 0x04C11DB7 (Ethernet / zlib standard)
 *   - Initial    : 0x00000000
 *   - XorOut     : 0x552D22C8 (Joyonway-specific, non-standard)
 *   - Direction  : MSB-first, non-reflected
 *   - Pre-step   : each 32-bit word of the payload is byte-swapped
 *                  before being fed to the CRC. Characteristic of
 *                  an ARM Cortex-M hardware CRC peripheral in
 *                  little-endian word order.
 *
 * Author: Christophe Knap (KnapTheBuilder) - port to JavaScript
 * Original algorithm: @alexbde
 * License: MIT
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.JoyonwayCrc = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var POLY = 0x04C11DB7;
  var XOR_OUT = 0x552D22C8;

  // Build the MSB-first CRC-32 lookup table once
  var TABLE = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = (i << 24) >>> 0;
      for (var j = 0; j < 8; j++) {
        // (c & 0x80000000) test, then shift and possibly XOR
        c = ((c & 0x80000000) !== 0)
          ? (((c << 1) >>> 0) ^ POLY) >>> 0
          : ((c << 1) >>> 0);
      }
      t[i] = c >>> 0;
    }
    return t;
  })();

  /**
   * Non-reflected MSB-first CRC-32 over data.
   * @param {Uint8Array|Array<number>} data
   * @param {number} init Optional initial value (default 0)
   * @returns {number} 32-bit unsigned integer
   */
  function crc32Msb(data, init) {
    var crc = (init | 0) >>> 0;
    for (var i = 0; i < data.length; i++) {
      var idx = ((crc >>> 24) ^ data[i]) & 0xFF;
      crc = (((crc << 8) >>> 0) ^ TABLE[idx]) >>> 0;
    }
    return crc;
  }

  /**
   * Byte-swap each 32-bit word of data. Pads with zero bytes if the
   * length is not a multiple of 4.
   * @param {Uint8Array|Array<number>} data
   * @returns {Uint8Array}
   */
  function byteSwapWords(data) {
    var rem = data.length % 4;
    var padded = (rem === 0)
      ? data
      : (function () {
          var p = new Uint8Array(data.length + (4 - rem));
          p.set(data);
          return p;
        })();
    var out = new Uint8Array(padded.length);
    for (var i = 0; i < padded.length; i += 4) {
      out[i]     = padded[i + 3];
      out[i + 1] = padded[i + 2];
      out[i + 2] = padded[i + 1];
      out[i + 3] = padded[i];
    }
    return out;
  }

  /**
   * Compute the Joyonway CRC-32 value for the given payload.
   * @param {Uint8Array|Array<number>} payload Inner bytes (no 0x1A / 0x1D framing)
   * @returns {number} 32-bit unsigned integer
   */
  function crcJoyonway(payload) {
    var swapped = byteSwapWords(payload);
    var raw = crc32Msb(swapped, 0);
    return ((raw ^ XOR_OUT) >>> 0);
  }

  /**
   * Encode the CRC of payload as 4 little-endian bytes, ready to be
   * inserted between the payload and the trailing 0x1D delimiter.
   * @param {Uint8Array|Array<number>} payload
   * @returns {Uint8Array} 4 bytes
   */
  function encodeCrc(payload) {
    var crc = crcJoyonway(payload);
    return new Uint8Array([
      crc & 0xFF,
      (crc >>> 8) & 0xFF,
      (crc >>> 16) & 0xFF,
      (crc >>> 24) & 0xFF
    ]);
  }

  /**
   * Check whether the given 4-byte CRC matches the computed CRC of the payload.
   * @param {Uint8Array|Array<number>} payload
   * @param {Uint8Array|Array<number>} crcBytes Exactly 4 bytes (little-endian)
   * @returns {boolean}
   */
  function verifyCrc(payload, crcBytes) {
    if (!crcBytes || crcBytes.length !== 4) {
      return false;
    }
    var expected = (crcBytes[0])
                 | (crcBytes[1] << 8)
                 | (crcBytes[2] << 16)
                 | (crcBytes[3] << 24);
    return (crcJoyonway(payload) >>> 0) === ((expected >>> 0));
  }

  return {
    POLY: POLY,
    XOR_OUT: XOR_OUT,
    crc32Msb: crc32Msb,
    byteSwapWords: byteSwapWords,
    crcJoyonway: crcJoyonway,
    encodeCrc: encodeCrc,
    verifyCrc: verifyCrc
  };
}));
