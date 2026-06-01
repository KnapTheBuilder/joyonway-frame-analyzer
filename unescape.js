/**
 * unescape.js - Joyonway 1A/1D family pseudo-escape decoder
 *
 * Correct implementation based on @KDy post #90 in the HA community thread:
 * https://community.home-assistant.io/t/joyonway-spa-control/582344/90
 *
 * Pseudo-escape table:
 *   0x1B 0x11  ->  0x1A
 *   0x1B 0x13  ->  0x1C
 *   0x1B 0x14  ->  0x1D
 *   0x1B 0x15  ->  0x1E
 *   0x1B 0x0B  ->  0x1B
 *
 * Any other 0x1B XX combination is left as-is (no transformation).
 *
 * This unescape MUST be applied before reading byte positions in B4 broadcasts.
 * Without it, positions shift after the first 0x1B and decoding becomes incorrect.
 *
 * Author: Christophe Knap (KnapTheBuilder)
 * License: MIT
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.JoyonwayUnescape = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // KDy escape table (post #90)
  var ESCAPE_TABLE = {
    0x11: 0x1A,
    0x13: 0x1C,
    0x14: 0x1D,
    0x15: 0x1E,
    0x0B: 0x1B
  };

  var ESCAPE_MARKER = 0x1B;
  var FRAME_START = 0x1A;
  var FRAME_END = 0x1D;

  /**
   * Apply KDy unescape table to a byte array.
   * Returns a new Uint8Array with escaped sequences resolved.
   *
   * @param {Uint8Array|Array<number>} frame - Raw frame including delimiters
   * @returns {Uint8Array} Unescaped frame
   */
  function unescapeFrame(frame) {
    if (!frame || frame.length === 0) {
      return new Uint8Array(0);
    }

    var result = [];
    var i = 0;
    var n = frame.length;

    while (i < n) {
      if (frame[i] === ESCAPE_MARKER && i + 1 < n) {
        var nextByte = frame[i + 1];
        if (ESCAPE_TABLE.hasOwnProperty(nextByte)) {
          result.push(ESCAPE_TABLE[nextByte]);
          i += 2;
          continue;
        }
      }
      result.push(frame[i]);
      i += 1;
    }

    return new Uint8Array(result);
  }

  /**
   * Apply inverse of KDy unescape table to build a frame ready to transmit.
   * Any byte 0x1A, 0x1B, 0x1C, 0x1D, 0x1E in the payload gets prefixed with 0x1B.
   *
   * @param {Uint8Array|Array<number>} payload - Payload WITHOUT outer delimiters
   * @returns {Uint8Array} Escaped payload ready to wrap in 0x1A...0x1D
   */
  function escapeFrame(payload) {
    if (!payload || payload.length === 0) {
      return new Uint8Array(0);
    }

    var reverseTable = {
      0x1A: 0x11,
      0x1C: 0x13,
      0x1D: 0x14,
      0x1E: 0x15,
      0x1B: 0x0B
    };

    var result = [];
    for (var i = 0; i < payload.length; i += 1) {
      var byte = payload[i];
      if (reverseTable.hasOwnProperty(byte)) {
        result.push(ESCAPE_MARKER);
        result.push(reverseTable[byte]);
      } else {
        result.push(byte);
      }
    }

    return new Uint8Array(result);
  }

  /**
   * Extract all delimited frames from a raw binary blob.
   * Frames start with 0x1A and end with 0x1D.
   * Note: this is a simple scan - escaped 0x1D inside frames are still
   * recognized properly because they appear as 0x1B 0x14 in the raw stream.
   *
   * @param {Uint8Array} rawData - Raw capture bytes
   * @returns {Array<Uint8Array>} Array of raw frames (still escaped)
   */
  function extractFrames(rawData) {
    var frames = [];
    if (!rawData || rawData.length === 0) {
      return frames;
    }

    var i = 0;
    var n = rawData.length;

    while (i < n) {
      if (rawData[i] === FRAME_START) {
        // Look for next 0x1D
        var j = i + 1;
        while (j < n) {
          if (rawData[j] === FRAME_END) {
            frames.push(rawData.slice(i, j + 1));
            i = j + 1;
            break;
          }
          j += 1;
        }
        if (j >= n) {
          // Incomplete frame, abandon
          break;
        }
      } else {
        i += 1;
      }
    }

    return frames;
  }

  /**
   * Get the type byte (offset 5 after unescape) of a frame.
   *
   * @param {Uint8Array} frame - Raw frame with delimiters
   * @param {boolean} unescapeFirst - If true, apply unescape before reading byte 5
   * @returns {number|null} The type byte value or null if frame too short
   */
  function getFrameType(frame, unescapeFirst) {
    var workingFrame = unescapeFirst !== false ? unescapeFrame(frame) : frame;
    if (workingFrame.length < 6) {
      return null;
    }
    return workingFrame[5];
  }

  /**
   * Decode a B4 broadcast frame (after unescape) using KDy's parser logic.
   *
   * @param {Uint8Array} unescapedFrame - Frame already passed through unescapeFrame()
   * @returns {Object} Decoded fields
   */
  function decodeB4Broadcast(unescapedFrame) {
    if (unescapedFrame.length < 30) {
      return { error: 'Frame too short for B4 decoding' };
    }

    var tempF = unescapedFrame[9];
    var setpointF = unescapedFrame[16];
    var pumpFlags = unescapedFrame[12];
    var heatingByte = unescapedFrame[14];
    var lightFlags = unescapedFrame[17];

    var heatingState;
    switch (heatingByte) {
      case 0x50:
        heatingState = 'circulation';
        break;
      case 0x54:
        heatingState = 'heating';
        break;
      case 0x40:
        heatingState = 'cooldown';
        break;
      case 0xC1:
        heatingState = 'ozonator_active';
        break;
      default:
        heatingState = 'off_or_manual_disabled';
    }

    return {
      water_temp_fahrenheit: tempF,
      water_temp_celsius: Math.round(((tempF - 32) * 5 / 9) * 10) / 10,
      setpoint_fahrenheit: setpointF,
      setpoint_celsius: Math.round(((setpointF - 32) * 5 / 9) * 10) / 10,
      filtering: (pumpFlags & 0x02) !== 0,
      massage: (pumpFlags & 0x04) !== 0,
      light: (lightFlags & 0x01) !== 0,
      heating_state: heatingState,
      heating_byte_raw: '0x' + heatingByte.toString(16).padStart(2, '0').toUpperCase()
    };
  }

  return {
    unescapeFrame: unescapeFrame,
    escapeFrame: escapeFrame,
    extractFrames: extractFrames,
    getFrameType: getFrameType,
    decodeB4Broadcast: decodeB4Broadcast,
    ESCAPE_TABLE: ESCAPE_TABLE,
    FRAME_START: FRAME_START,
    FRAME_END: FRAME_END,
    ESCAPE_MARKER: ESCAPE_MARKER
  };
}));
