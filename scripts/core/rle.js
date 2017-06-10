/* -*- mode: javascript; tab-width: 2; indent-tabs-mode: nil; -*-
*
* Copyright (c) 2011-2013 Marcus Geelnard
*
* This file is part of SoundBox.
*
* SoundBox is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* SoundBox is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with SoundBox.  If not, see <http://www.gnu.org/licenses/>.
*
*/

//------------------------------------------------------------------------------
// This is a run length encoder (RLE) that (for SoundBox files) compresses
// to about twice the size compared to DEFLATE.
//------------------------------------------------------------------------------

function rle_encode (data) {
  var out = "", i, j, len, code, code2;

  for (i = 0; i < data.length;) {
    // Next byte from the data stream
    code = data.charCodeAt(i);

    // Count how many equal bytes we have
    for (len = 1; len < 255 && (i + len) < data.length; len++) {
      code2 = data.charCodeAt(i + len);
      if (code2 != code)
        break;
    }

    // Emit run length code?
    if (len > 3) {
      out += String.fromCharCode(254);  // Marker byte (254)
      out += String.fromCharCode(len);
      out += String.fromCharCode(code);
    }
    else {
      out += String.fromCharCode(code);
      if (code == 254)
        out += String.fromCharCode(0);  // zero length indicates the marker byte
      len = 1;
    }

    // Next position to encode
    i += len;
  }

  return out;
}

function rle_decode (data) {
  var out = "", i, j, code, len;

  for (i = 0; i < data.length;) {
    // Next byte from the data stream
    code = data.charCodeAt(i++);

    // Is this a marker byte (254)?
    if (code === 254) {
      if (i < 1)
        break;
      len = data.charCodeAt(i++);
      if (len != 0) {
        if (i < 1)
          break;
        code = data.charCodeAt(i++);
        for (j = 0; j < len; j++)
          out += String.fromCharCode(code);
        continue;
      }
    }

    // Plain byte copy
    out += String.fromCharCode(code);
  }

  return out;
}

