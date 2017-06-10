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

"use strict";

var CPlayer = function () {

    //--------------------------------------------------------------------------
    // Private members
    //--------------------------------------------------------------------------

    var mProgressCallback;

    var mGeneratedBuffer;

    var mWorker = new Worker("scripts/core/player-worker.js");

    mWorker.onmessage = function (event) {
        if (event.data.cmd === "progress") {
            mGeneratedBuffer = event.data.buffer;
            if (mProgressCallback) {
                mProgressCallback(event.data.progress);
            }
        }
    };


    //--------------------------------------------------------------------------
    // Public methods
    //--------------------------------------------------------------------------

    // Generate the audio data (done in worker).
    this.generate = function (song, opts, progressCallback) {
        mProgressCallback = progressCallback;
        mWorker.postMessage({
            cmd: "generate",
            song: song,
            opts: opts
        });
    };

    // Create a WAVE formatted Uint8Array from the generated audio data.
    this.createWave = function() {
        // Turn critical object properties into local variables (performance)
        var mixBuf = mGeneratedBuffer,
            waveWords = mixBuf.length;

        // Create WAVE header
        var headerLen = 44;
        var l1 = headerLen + waveWords * 2 - 8;
        var l2 = l1 - 36;
        var wave = new Uint8Array(headerLen + waveWords * 2);
        wave.set(
            [82,73,70,70,
             l1 & 255,(l1 >> 8) & 255,(l1 >> 16) & 255,(l1 >> 24) & 255,
             87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,
             68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,
             l2 & 255,(l2 >> 8) & 255,(l2 >> 16) & 255,(l2 >> 24) & 255]
        );

        // Append actual wave data
        for (var i = 0, idx = headerLen; i < waveWords; ++i) {
            // Note: We clamp here
            var y = mixBuf[i];
            y = y < -32767 ? -32767 : (y > 32767 ? 32767 : y);
            wave[idx++] = y & 255;
            wave[idx++] = (y >> 8) & 255;
        }

        // Return the WAVE formatted typed array
        return wave;
    };

    // Get n samples of wave data at time t [s]. Wave data in range [-2,2].
    this.getData = function(t, n) {
        var i = 2 * Math.floor(t * 44100);
        var d = new Array(n);
        var b = mGeneratedBuffer;
        for (var j = 0; j < 2*n; j += 1) {
            var k = i + j;
            d[j] = t > 0 && k < b.length ? b[k] / 32768 : 0;
        }
        return d;
    };
};

