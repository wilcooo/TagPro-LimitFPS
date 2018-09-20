// ==UserScript==
// @name         TagPro Limit FPS
// @description  Limit FPS in the webgame TagPro
// @author       Ko
// @version      1.0
// @include      *.koalabeast.com*
// @include      *.jukejuice.com*
// @include      *.newcompte.fr*
// @downloadURL  https://github.com/wilcooo/TagPro-LimitFPS/raw/master/tpfps.user.js
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @website      https://redd.it/no-post-yet
// @require      https://greasyfork.org/scripts/371240/code/TagPro%20Userscript%20Library.js
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==



// Edit this script's options on the homepage or the scoreboard



/* global tagpro, PIXI, tpul */

(function(){
    'use strict';

    var settings = tpul.settings.addSettings({
        id: 'limitFPS',
        title: "Set FPS limit",
        tooltipText: "Set FPS limit",
        icon: "https://github.com/wilcooo/TagPro-LimitFPS/raw/master/icon.png",

        fields: {
            fps_limit: {
                label: 'FPS limit',
                type: 'select',
                default: 30,
                options: ["1", "2", "3", "4", "5", "6", "10", "12", "15", "20", "30", "60"],
            },
            exact_fps: {
                label: "Don't round the FPS counter to the nearest pentad",
                type: 'checkbox',
                default: true,
            }
        },

        events: {
            save: function(){
                cycle = 60 / settings.get("fps_limit");
                exact_fps = settings.get("exact_fps");
            }
        }
    });

    var cycle = 60 / settings.get("fps_limit"),
        exact_fps = settings.get("exact_fps");

    if (location.port) {
        tagpro.ready(function() {

            var tr = tagpro.renderer;
            tr.renderX = tr.render;

            var count = 0;

            tr.render = function() {

                count++;

                if ( count >= cycle ) {
                    count = 0;
                    tr.renderX(...arguments);
                }

                else {
                    tr.measurePerformance(false);
                    requestAnimationFrame(tr.render);
                }
            }




            tr.measurePerformance = function(frame=true){

                if (frame) tr.frameCount += 1;

                var time = performance.now(),
                    n = 300;

                if (tr.lastFrameTime) {

                    var deltaTime = time - tr.lastFrameTime,
                        fps = 1e3 / deltaTime / cycle;

                    if (isFinite(fps)) tr.frameRates.push(fps);
                    while (tr.frameRates.length > n) tr.frameRates.shift();
                }

                if (tr.frameRates.length >= n / 5) {
                    if (exact_fps) tagpro.fps = Math.round(tr.frameRates.reduce((a,b) => a+b, 0) / tr.frameRates.length);
                    else tagpro.fps = Math.round(tr.frameRates.reduce((a,b) => a+b, 0) / tr.frameRates.length / 5) * 5;
                } else tagpro.fps = 0;

                tr.lastFrameTime = time;
            }
        });
    }
})();
