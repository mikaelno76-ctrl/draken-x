/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - FÄRGHANTERING (colorspace.js)
 *
 * three.js r128 behandlar alla hex-färger (0xRRGGBB) som LINJÄRA värden, fast
 * vi skriver dem som vanliga skärmfärger (sRGB). Resultatet blir urblekta,
 * platta och överexponerade rum: en 50 % grå vägg (0x808080) visas som 73 %.
 *
 * Den här filen gör som moderna three.js: varje hex-färg tolkas som sRGB och
 * omvandlas till linjärt innan ljusberäkningen. Det gör färgerna djupare och
 * mer mättade UTAN att någon scenfil behöver ändras. Canvas-texturer märks
 * som sRGB så att tapeter och golv avkodas rätt.
 *
 * MÅSTE laddas direkt efter three.js och före allt annat.
 * ============================================================================
 */
(function () {
    'use strict';
    if (typeof THREE === 'undefined' || THREE.__drakenColorManaged) return;
    THREE.__drakenColorManaged = true;

    const srgbToLinear = (c) => (c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4));

    const origSetHex = THREE.Color.prototype.setHex;
    THREE.Color.prototype.setHex = function (hex) {
        origSetHex.call(this, hex);
        this.r = srgbToLinear(this.r);
        this.g = srgbToLinear(this.g);
        this.b = srgbToLinear(this.b);
        return this;
    };

    // Alla CanvasTexture som skapas utan egen kodning är målade i sRGB.
    const OrigCanvasTexture = THREE.CanvasTexture;
    const WrappedCanvasTexture = function () {
        const tex = new OrigCanvasTexture(...arguments);
        if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
        return tex;
    };
    WrappedCanvasTexture.prototype = OrigCanvasTexture.prototype;
    THREE.CanvasTexture = WrappedCanvasTexture;
})();
