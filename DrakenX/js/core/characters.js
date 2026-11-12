/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - KARAKTÄRER v2 (characters.js)
 *
 * Ersätter de gamla provdockorna med riktiga, ledade figurer:
 *   - Mjuka former (svarvade lemmar, ellipsoider) i stället för lådor/cylindrar
 *   - Ansikten med ögonglob, iris, glimt, ögonlock, ögonbryn, näsa, läppar, öron
 *   - Frisyrer: Lasses sidbena, Connys brylkräm-kalufs, Tant Karins knut, polisens skärmmössa
 *   - Konturlinje som följer formen (utåtvänd normal) i stället för uppskalade kopior
 *   - Kantljus (rim light) som lyfter figurerna från bakgrunden
 *   - Levande animation: gångcykel utan glidande fötter, andning, viktförskjutning,
 *     blinkningar, ögonrörelser, talgester, huvudnickningar, vänder sig mot den som pratar
 *
 * Publikt API (används av renderer.js):
 *   Characters.create(R, id, style)  -> actor (samma fält som förut)
 *   Characters.update(actor, state)  -> animerar en figur ett steg
 * ============================================================================
 */

window.Characters = (function () {
    'use strict';
    const T = THREE;

    // ------------------------------------------------------------------
    // Små byggstenar
    // ------------------------------------------------------------------
    function bake(geo, sx, sy, sz) {
        geo.applyMatrix4(new T.Matrix4().makeScale(sx, sy, sz));
        return geo;
    }

    function ell(material, rx, ry, rz, ws = 18, hs = 14) {
        const m = new T.Mesh(bake(new T.SphereGeometry(1, ws, hs), rx, ry, rz), material);
        m.castShadow = true;
        return m;
    }

    function lathe(material, pts, seg = 22, sx = 1, sz = 1) {
        const g = bake(new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg), sx, 1, sz);
        const m = new T.Mesh(g, material);
        m.castShadow = true;
        return m;
    }

    // Avsmalnande kapsel som hänger nedåt från y=0 till y=-len
    function limb(material, r0, r1, len, seg = 16) {
        const pts = [];
        const n = 5;
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI / 2;
            pts.push([r1 * Math.sin(a), -len + r1 - r1 * Math.cos(a)]);
        }
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI / 2;
            pts.push([r0 * Math.cos(a), -r0 + r0 * Math.sin(a)]);
        }
        return lathe(material, pts, seg);
    }

    // Kontur: kopia av geometrin, förskjuten längs utjämnade normaler (inga gliptäcken)
    function outlineGeometry(geo, thickness) {
        const pos = geo.attributes.position;
        const nor = geo.attributes.normal;
        if (!pos || !nor) return null;
        const keyOf = (i) => Math.round(pos.getX(i) * 2000) + ',' + Math.round(pos.getY(i) * 2000) + ',' + Math.round(pos.getZ(i) * 2000);
        const acc = new Map();
        for (let i = 0; i < pos.count; i++) {
            const k = keyOf(i);
            let e = acc.get(k);
            if (!e) { e = [0, 0, 0]; acc.set(k, e); }
            e[0] += nor.getX(i); e[1] += nor.getY(i); e[2] += nor.getZ(i);
        }
        const out = geo.clone();
        const p2 = out.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const e = acc.get(keyOf(i));
            const len = Math.hypot(e[0], e[1], e[2]) || 1;
            p2.setXYZ(i, pos.getX(i) + e[0] / len * thickness, pos.getY(i) + e[1] / len * thickness, pos.getZ(i) + e[2] / len * thickness);
        }
        p2.needsUpdate = true;
        return out;
    }

    // Svetsa ihop normaler för koincidenta hörn (tar bort synliga sömmar på svarvade/deformerade former)
    function weldNormals(geo) {
        const pos = geo.attributes.position, nor = geo.attributes.normal;
        const keyOf = (i) => Math.round(pos.getX(i) * 2000) + ',' + Math.round(pos.getY(i) * 2000) + ',' + Math.round(pos.getZ(i) * 2000);
        const acc = new Map();
        for (let i = 0; i < pos.count; i++) {
            const k = keyOf(i);
            let e = acc.get(k);
            if (!e) { e = [0, 0, 0]; acc.set(k, e); }
            e[0] += nor.getX(i); e[1] += nor.getY(i); e[2] += nor.getZ(i);
        }
        for (let i = 0; i < pos.count; i++) {
            const e = acc.get(keyOf(i));
            const len = Math.hypot(e[0], e[1], e[2]) || 1;
            nor.setXYZ(i, e[0] / len, e[1] / len, e[2] / len);
        }
        nor.needsUpdate = true;
        return geo;
    }

    // Huvudform i ett stycke: rund hjässa som smalnar av mot hakan (ingen söm mellan skalle och käke)
    function headGeometry(rx, ry, rz, taper, lengthen) {
        const g = new T.SphereGeometry(1, 40, 30);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            let xx = x * rx, yy = y * ry, zz = z * rz;
            if (y < 0) {
                const k = Math.pow(-y, 1.5);
                xx *= 1 - taper * k;
                zz *= 1 - 0.10 * k;
                yy *= 1 + lengthen * k;
            }
            p.setXYZ(i, xx, yy, zz);
        }
        g.computeVertexNormals();
        return weldNormals(g);
    }

    const OUTLINE_MAT = new T.MeshBasicMaterial({ color: 0x1b120c, side: T.BackSide });

    function outline(mesh, thickness = 0.008) {
        const g = outlineGeometry(mesh.geometry, thickness);
        if (!g) return mesh;
        const o = new T.Mesh(g, OUTLINE_MAT);
        o.raycast = () => {};
        o.castShadow = false;
        mesh.add(o);
        return mesh;
    }

    // Kantljus: tänder en svag glöd där ytan vetter bort från kameran
    function addRim(material, color = 0xffe0b0, strength = 0.32) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uRimColor = { value: new T.Color(color) };
            shader.uniforms.uRimStrength = { value: strength };
            shader.fragmentShader = 'uniform vec3 uRimColor;\nuniform float uRimStrength;\n' + shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                 float rimF = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 2.8);
                 totalEmissiveRadiance += uRimColor * rimF * uRimStrength;`
            );
        };
        return material;
    }

    function std(color, o = {}) {
        const m = new T.MeshStandardMaterial({
            color,
            roughness: o.roughness !== undefined ? o.roughness : 0.7,
            metalness: o.metalness !== undefined ? o.metalness : 0.0,
            map: o.map || null,
            emissive: o.emissive !== undefined ? o.emissive : 0x000000
        });
        if (o.rim !== false) addRim(m, o.rimColor || 0xffe0b0, o.rimStrength !== undefined ? o.rimStrength : 0.30);
        return m;
    }

    const basic = (color) => new T.MeshBasicMaterial({ color });

    // ------------------------------------------------------------------
    // Skapa en figur
    // ------------------------------------------------------------------
    function create(R, id, style = {}) {
        const kind = id === 'mamma' ? 'woman' : id === 'polis' ? 'cop' : 'teen';
        const sc = style.shoulderScale || 1.0;
        const hs = style.heightScale || 1.0;
        const jawW = style.jawWidth || 0.95;
        const fabric = R && R.proceduralTextures ? R.proceduralTextures.fabric : null;

        const group = new T.Group();
        group.scale.set(1, hs, 1);

        // ----- Material -----
        const skinHex = style.skinColor || (kind === 'cop' ? 0xe0a98a : 0xeeb792);
        const skin = std(skinHex, { roughness: 0.58, emissive: 0x2a0f06, rimStrength: 0.22 });
        const hairHex = style.hairColor || 0x7a5c32;
        const hair = std(hairHex, {
            roughness: style.pompadour ? 0.22 : 0.58,
            metalness: style.pompadour ? 0.25 : 0.0,
            rimStrength: style.pompadour ? 0.5 : 0.35
        });
        const jacketIsLeather = id === 'conny';
        const jacket = std(style.jacketColor || 0x4a525d, {
            map: jacketIsLeather ? null : fabric,
            roughness: jacketIsLeather ? 0.34 : 0.9,
            metalness: jacketIsLeather ? 0.12 : 0.0,
            rimStrength: jacketIsLeather ? 0.45 : 0.28
        });
        const shirt = std(style.shirtColor || 0xf2efe6, { roughness: 0.75 });
        const pants = std(style.pantsColor || 0x181c22, { map: fabric, roughness: 0.85 });
        const shoeMat = std(kind === 'cop' ? 0x0d0d0f : 0x2a1a10, { roughness: 0.38, metalness: 0.05, rimStrength: 0.4 });
        const soleMat = std(0x2c1d12, { roughness: 0.8, rim: false });
        const metal = std(0xe6c767, { roughness: 0.25, metalness: 0.85 });
        const lipMat = std(0xb5584f, { roughness: 0.5, rim: false });
        const mouthDark = basic(0x3a0f10);
        const sclera = basic(0xf4f0e8);
        const irisHex = id === 'lasse' ? 0x3d7fc4 : id === 'conny' ? 0x5a3a1c : kind === 'woman' ? 0x5b7d5a : 0x4d6a82;
        const irisMat = basic(irisHex);
        const pupilMat = basic(0x0a0808);
        const glintMat = basic(0xffffff);

        // ================================================================
        // UNDERKROPP: bäcken + ben
        // ================================================================
        const lower = new T.Group();
        group.add(lower);

        const pelvis = lathe(pants, [[0.0, -0.13], [0.2, -0.13], [0.255, -0.04], [0.258, 0.02], [0.24, 0.05], [0.0, 0.05]], 22, 1.05, 0.66);
        pelvis.position.y = 0.97;
        outline(pelvis, 0.007);
        lower.add(pelvis);

        const buildLeg = (isLeft) => {
            const hip = new T.Group();
            hip.position.set((isLeft ? -1 : 1) * 0.125 * sc, 0.92, 0);

            const legMat = kind === 'woman' ? std(0xe8b896, { roughness: 0.6 }) : pants;
            const thigh = limb(legMat, 0.124, 0.091, 0.47);
            outline(thigh, 0.007);
            hip.add(thigh);

            const knee = new T.Group();
            knee.position.set(0, -0.455, 0);
            const calf = limb(legMat, 0.091, 0.064, 0.385);
            outline(calf, 0.007);
            knee.add(calf);

            // Uppvikt jeansslag på Conny
            if (id === 'conny') {
                const cuff = lathe(std(0x3c5a85, { roughness: 0.9 }), [[0.072, -0.375], [0.084, -0.375], [0.087, -0.295], [0.078, -0.295]], 16);
                knee.add(cuff);
            }

            // Fot/sko
            const foot = new T.Group();
            foot.position.set(0, -0.375, 0);
            const upper = ell(shoeMat, 0.072, 0.058, 0.17);
            upper.position.set(0, -0.032, 0.065);
            outline(upper, 0.006);
            const toe = ell(shoeMat, 0.068, 0.044, 0.09);
            toe.position.set(0, -0.056, 0.17);
            const sole = new T.Mesh(bake(new T.BoxGeometry(1, 1, 1), 0.122, 0.016, 0.33), soleMat);
            sole.position.set(0, -0.092, 0.075);
            const heel = new T.Mesh(bake(new T.BoxGeometry(1, 1, 1), 0.09, 0.028, 0.08), soleMat);
            heel.position.set(0, -0.092, -0.07);
            foot.add(upper, toe, sole, heel);
            knee.add(foot);

            hip.add(knee);
            hip.userData = { knee, foot };
            return hip;
        };
        const legL = buildLeg(true);
        const legR = buildLeg(false);
        group.add(legL, legR);

        // Kjol för Tant Karin
        if (kind === 'woman') {
            const skirt = lathe(std(style.pantsColor || 0x3b4d5e, { roughness: 0.85, map: fabric }),
                [[0.0, 0.50], [0.30, 0.50], [0.33, 0.62], [0.30, 0.78], [0.25, 0.96], [0.0, 0.96]], 26, 1.1, 0.95);
            skirt.position.y = 0.0;
            outline(skirt, 0.007);
            lower.add(skirt);
        }

        // ================================================================
        // ÖVERKROPP (vrids kring midjan)
        // ================================================================
        const WAIST = 1.0;
        const upperBody = new T.Group();
        upperBody.position.set(0, WAIST, 0);
        group.add(upperBody);

        const torsoGroup = new T.Group();
        torsoGroup.position.set(0, 0.333, 0);
        upperBody.add(torsoGroup);

        // Jackans profil: [radie, y] nerifrån och upp
        const torsoProfile = kind === 'woman'
            ? [[0.0, -0.37], [0.24, -0.37], [0.235, -0.2], [0.225, -0.05], [0.265, 0.12], [0.285, 0.24], [0.245, 0.335], [0.15, 0.365], [0.105, 0.378], [0.0, 0.378]]
            : [[0.0, -0.37], [0.262, -0.37], [0.268, -0.32], [0.25, -0.18], [0.262, 0.0], [0.292, 0.14], [0.292, 0.27], [0.25, 0.335], [0.155, 0.365], [0.108, 0.378], [0.0, 0.378]];
        const TY = 0.9;
        for (const pt of torsoProfile) pt[1] *= TY;
        const torso = lathe(jacket, torsoProfile, 28, 1.10 * sc, 0.70);
        outline(torso, 0.008);
        torsoGroup.add(torso);

        const halfW = (y) => {
            // jackans halvbredd (x) och halvdjup (z) vid höjden y
            for (let i = 0; i < torsoProfile.length - 1; i++) {
                const a = torsoProfile[i], b = torsoProfile[i + 1];
                if (y >= a[1] && y <= b[1]) {
                    const k = (y - a[1]) / Math.max(1e-6, b[1] - a[1]);
                    const r = a[0] + (b[0] - a[0]) * k;
                    return [r * 1.10 * sc, r * 0.70];
                }
            }
            return [0.26, 0.18];
        };

        if (kind === 'teen' || kind === 'cop') {
            // Framkant: placket + dragkedja (fastsatta i ytan)
            const plackMat = std(kind === 'cop' ? 0x0f1726 : 0x1b2a3c, { roughness: 0.7, rim: false });
            for (let yy = -0.34; yy <= 0.31; yy += 0.05) {
                const hw = halfW(yy + 0.025);
                const seg = new T.Mesh(new T.BoxGeometry(0.026, 0.052, 0.012), kind === 'cop' ? metal : plackMat);
                seg.position.set(0, yy + 0.025, hw[1] - 0.004);
                torsoGroup.add(seg);
            }
            if (kind === 'cop') {
                // Messingsknappar och bälte
                [-0.30, -0.18, -0.06, 0.06, 0.18].forEach(yy => {
                    [-0.07, 0.07].forEach(xx => {
                        const b = new T.Mesh(new T.SphereGeometry(0.017, 8, 8), metal);
                        b.position.set(xx, yy, halfW(yy)[1] + 0.004);
                        torsoGroup.add(b);
                    });
                });
                const belt = lathe(std(0x070707, { roughness: 0.4 }), [[0.268, -0.31], [0.274, -0.31], [0.274, -0.25], [0.268, -0.25]], 28, 1.10 * sc, 0.70);
                torsoGroup.add(belt);
                const buckle = new T.Mesh(new T.BoxGeometry(0.07, 0.07, 0.02), metal);
                buckle.position.set(0, -0.28, halfW(-0.28)[1] + 0.004);
                torsoGroup.add(buckle);
            } else {
                // Fickor
                [-1, 1].forEach(s => {
                    const hw = halfW(-0.2);
                    const pocket = new T.Mesh(new T.BoxGeometry(0.11, 0.012, 0.014), std(0x0f1a28, { rim: false }));
                    pocket.position.set(s * hw[0] * 0.62, -0.17, hw[1] * 0.80);
                    pocket.rotation.y = s * 0.55;
                    pocket.rotation.z = -s * 0.28;
                    torsoGroup.add(pocket);
                });
            }
        }

        if (kind === 'woman') {
            // Förkläde med ficka
            const apronGeo = bake(new T.LatheGeometry([[0.325, 0.54], [0.327, 0.62], [0.307, 0.78], [0.262, 0.95], [0.255, 0.97]].map(q => new T.Vector2(q[0] + 0.006, q[1])), 20, -0.62, 1.24), 1.1, 1, 0.95);
            const apron = new T.Mesh(apronGeo, std(0xf3efe2, { roughness: 0.85, rim: false }));
            apron.material.side = T.DoubleSide;
            lower.add(apron);
            const pearls = new T.Group();
            for (let i = 0; i < 11; i++) {
                const p = new T.Mesh(new T.SphereGeometry(0.013, 8, 8), std(0xf6f1e6, { roughness: 0.2, metalness: 0.2 }));
                const ang = -0.9 + (i / 10) * 1.8;
                p.position.set(Math.sin(ang) * 0.12, 0.31 - Math.cos(ang * 1.0) * 0.07 + 0.07, 0.115 + Math.cos(ang) * 0.02);
                pearls.add(p);
            }
            torsoGroup.add(pearls);
        }

        // Krage: skjortkrage som tittar fram + uppvikt jackkrage
        const neckBase = 0.335;
        const shirtCollar = lathe(shirt, [[0.092, neckBase - 0.02], [0.118, neckBase - 0.02], [0.122, neckBase + 0.05], [0.098, neckBase + 0.055]], 20);
        torsoGroup.add(shirtCollar);
        if (kind !== 'woman') {
            const lapelMat = jacket;
            [-1, 1].forEach(s => {
                const lap = new T.Mesh(new T.BoxGeometry(0.11, 0.1, 0.02), lapelMat);
                lap.position.set(s * 0.085, neckBase - 0.04, 0.125);
                lap.rotation.set(0.35, s * 0.35, s * -0.5);
                outline(lap, 0.004);
                torsoGroup.add(lap);
            });
            if (kind === 'cop') {
                const tie = new T.Mesh(new T.BoxGeometry(0.045, 0.24, 0.012), std(0x14182c, { roughness: 0.5, rim: false }));
                tie.position.set(0, 0.17, 0.142);
                torsoGroup.add(tie);
            }
        }

        // ----- Armar -----
        const sleeveMat = kind === 'woman' ? std(style.jacketColor || 0xb84a39, { roughness: 0.8, map: fabric }) : jacket;
        const buildArm = (isLeft) => {
            const s = isLeft ? -1 : 1;
            const shoulder = new T.Group();
            shoulder.position.set(s * 0.31 * sc, 0.595, 0);
            shoulder.rotation.z = -s * 0.10;

            const cap = ell(sleeveMat, 0.085, 0.082, 0.082, 16, 12);
            outline(cap, 0.007);
            shoulder.add(cap);

            const uarm = limb(sleeveMat, 0.084, 0.07, 0.33, 14);
            uarm.position.y = -0.01;
            outline(uarm, 0.007);
            shoulder.add(uarm);

            const elbow = new T.Group();
            elbow.position.set(0, -0.335, 0);
            elbow.rotation.x = -0.16;
            const joint = ell(sleeveMat, 0.07, 0.066, 0.068, 12, 10);
            elbow.add(joint);
            const farm = limb(sleeveMat, 0.068, 0.054, 0.30, 14);
            outline(farm, 0.006);
            elbow.add(farm);

            // Manschett
            const cuffMat = kind === 'cop' ? sleeveMat : shirt;
            const cuff = lathe(cuffMat, [[0.056, -0.275], [0.064, -0.275], [0.068, -0.235], [0.060, -0.235]], 14);
            elbow.add(cuff);

            // Hand
            const hand = new T.Group();
            hand.position.set(0, -0.325, 0);
            const palm = ell(skin, 0.043, 0.062, 0.03, 12, 10);
            palm.position.y = -0.03;
            outline(palm, 0.005);
            const fingers = ell(skin, 0.039, 0.045, 0.026, 12, 10);
            fingers.position.set(0, -0.085, 0.006);
            fingers.rotation.x = -0.25;
            const thumb = ell(skin, 0.014, 0.036, 0.016, 8, 8);
            thumb.position.set(-s * 0.04, -0.045, 0.028);
            thumb.rotation.set(-0.55, 0, -s * 0.5);
            hand.add(palm, fingers, thumb);
            elbow.add(hand);

            shoulder.add(elbow);
            shoulder.userData = { elbow, hand };
            return shoulder;
        };
        const armL = buildArm(true);
        const armR = buildArm(false);
        upperBody.add(armL, armR);

        // ----- Hals -----
        const neck = new T.Mesh(new T.CylinderGeometry(0.068, 0.078, 0.17, 14), skin);
        neck.position.set(0, 0.72, 0);
        upperBody.add(neck);

        // ================================================================
        // HUVUD
        // ================================================================
        const headGroup = new T.Group();
        headGroup.position.set(0, 0.945, 0);
        headGroup.scale.setScalar(1.1);
        upperBody.add(headGroup);

        const SK = { rx: 0.186 * jawW, ry: 0.215, rz: 0.200 };
        const skullZ = (x, y) => {
            const t = 1 - (x / SK.rx) * (x / SK.rx) - (y / SK.ry) * (y / SK.ry);
            return SK.rz * Math.sqrt(Math.max(0.02, t));
        };

        const skull = new T.Mesh(headGeometry(SK.rx, SK.ry, SK.rz, id === 'conny' ? 0.26 : 0.34, 0.13), skin);
        skull.castShadow = true;
        outline(skull, 0.007);
        headGroup.add(skull);

        // Öron
        [-1, 1].forEach(s => {
            const ear = ell(skin, 0.026, 0.05, 0.03, 10, 10);
            ear.position.set(s * (SK.rx + 0.004), -0.005, -0.005);
            outline(ear, 0.004);
            headGroup.add(ear);
        });

        // Näsa
        const nose = ell(skin, 0.022, 0.036, 0.028, 12, 10);
        nose.position.set(0, -0.025, skullZ(0, -0.025) + 0.012);
        nose.rotation.x = 0.32;
        headGroup.add(nose);
        const noseTip = ell(skin, 0.021, 0.018, 0.021, 10, 8);
        noseTip.position.set(0, -0.058, skullZ(0, -0.05) + 0.045);
        headGroup.add(noseTip);

        // Ögon (egna grupper så de kan titta åt olika håll)
        const eyes = [];
        const eyelids = [];
        const eyebrows = [];
        const browMat = hair;
        [-1, 1].forEach((s, idx) => {
            const ex = s * 0.072, ey = 0.028;
            const eyeCenterZ = skullZ(ex, ey) - 0.006;
            const eyeGroup = new T.Group();
            eyeGroup.position.set(ex, ey, eyeCenterZ);

            const ball = ell(sclera, 0.036, 0.031, 0.03, 14, 12);
            const iris = ell(irisMat, 0.0185, 0.0185, 0.008, 14, 10);
            iris.position.z = 0.0245;
            const pupil = ell(pupilMat, 0.0095, 0.0095, 0.006, 10, 8);
            pupil.position.z = 0.0295;
            const glint = ell(glintMat, 0.0055, 0.0055, 0.004, 8, 6);
            glint.position.set(0.008, 0.008, 0.0325);
            eyeGroup.add(ball, iris, pupil, glint);
            headGroup.add(eyeGroup);
            eyes.push(eyeGroup);

            // Övre ögonlock (kupol som roteras fram över ögat vid blinkning)
            const lid = new T.Mesh(new T.SphereGeometry(0.0385, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), skin);
            lid.scale.set(1.0, 0.95, 1.0);
            lid.position.copy(eyeGroup.position);
            lid.rotation.x = -0.38;
            headGroup.add(lid);
            eyelids.push(lid);

            // Ögonbryn
            const brow = ell(browMat, 0.043, 0.0095, 0.0135, 10, 8);
            brow.position.set(ex, 0.085, skullZ(ex, 0.085) + 0.002);
            brow.rotation.z = -s * 0.10;
            brow.rotation.x = -0.2;
            headGroup.add(brow);
            eyebrows.push(brow);
        });

        // Mun
        const mouthY = -0.1;
        const mouthZ = Math.max(skullZ(0, mouthY), 0.045 + 0.15 * Math.sqrt(1 - Math.pow((mouthY + 0.11) / 0.115, 2))) + 0.004;
        const mouthInner = ell(mouthDark, 0.027, 0.003, 0.012, 12, 6);
        mouthInner.position.set(0, mouthY - 0.001, mouthZ - 0.004);
        const upperLip = ell(lipMat, 0.036, 0.0085, 0.016, 12, 8);
        upperLip.position.set(0, mouthY + 0.004, mouthZ);
        const lowerLip = ell(lipMat, 0.031, 0.0095, 0.016, 12, 8);
        lowerLip.position.set(0, mouthY - 0.011, mouthZ);
        headGroup.add(mouthInner, upperLip, lowerLip);

        // ----- Frisyrer -----
        const hairGroup = new T.Group();
        headGroup.add(hairGroup);
        const addHair = (mesh, x, y, z, rx = 0, ry = 0, rz = 0) => {
            mesh.position.set(x, y, z);
            mesh.rotation.set(rx, ry, rz);
            hairGroup.add(mesh);
            return mesh;
        };

        // Hårkalott: kupol över hjässa/nacke vars främre kant bildar hårfästet (täcker aldrig ansiktet)
        const hairDome = (extra, tilt, theta) => {
            const g = bake(new T.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * theta), SK.rx * extra, SK.ry * (extra + 0.02), SK.rz * extra);
            const m = new T.Mesh(g, hair);
            m.castShadow = true;
            m.rotation.x = tilt;
            m.position.set(0, 0.004, -0.004);
            outline(m, 0.006);
            hairGroup.add(m);
            return m;
        };

        if (kind === 'cop') {
            // Skärmmössa
            const capMat = std(0x101a2e, { roughness: 0.7 });
            const crown = lathe(capMat, [[0.0, 0.0], [0.215, 0.0], [0.235, 0.05], [0.245, 0.11], [0.0, 0.12]], 26);
            crown.position.set(0, 0.125, 0.0);
            outline(crown, 0.007);
            const band = lathe(std(0x070b14, { roughness: 0.5 }), [[0.21, 0.0], [0.225, 0.0], [0.226, 0.055], [0.212, 0.055]], 26);
            band.position.set(0, 0.125, 0.0);
            const brim = lathe(std(0x07090e, { roughness: 0.25, metalness: 0.1 }), [[0.0, 0.0], [0.2, 0.0], [0.21, 0.01], [0.0, 0.012]], 26, 1, 1);
            brim.scale.set(1.0, 1.0, 1.15);
            brim.position.set(0, 0.123, 0.09);
            brim.rotation.x = 0.28;
            const badge = new T.Mesh(new T.CircleGeometry(0.025, 14), metal);
            badge.position.set(0, 0.155, 0.226);
            hairGroup.add(crown, band, brim, badge);
            // Hår under mössan + mustasch
            addHair(ell(hair, 0.19, 0.12, 0.17), 0, -0.01, -0.05);
            const stache = ell(hair, 0.045, 0.014, 0.018);
            stache.position.set(0, mouthY + 0.025, mouthZ + 0.004);
            headGroup.add(stache);
        } else if (kind === 'woman') {
            hairDome(1.08, -0.45, 0.52);
            const bun = ell(hair, 0.085, 0.085, 0.08);
            addHair(bun, 0, 0.17, -0.20);
            [-1, 1].forEach(s => addHair(ell(hair, 0.045, 0.11, 0.12), s * 0.168, -0.04, 0.0));
            // Pannlugg
            addHair(ell(hair, 0.15, 0.05, 0.1), 0, 0.155, 0.12, 0.45, 0, 0);
            // Hårband
            const band = lathe(std(0xd24a3a, { roughness: 0.6 }), [[0.20, 0.0], [0.21, 0.0], [0.21, 0.028], [0.20, 0.028]], 24);
            band.position.set(0, 0.105, 0.0);
            band.scale.z = 1.05;
            hairGroup.add(band);
        } else {
            // Gemensamt för pojkarna: hjässa + nacke + tinningar
            hairDome(1.07, -0.5, 0.5);
            addHair(ell(hair, 0.176 * jawW, 0.13, 0.15), 0, -0.07, -0.08);               // nacke
            if (!style.pompadour) {
                [-1, 1].forEach(s => addHair(ell(hair, 0.03, 0.095, 0.115), s * (0.172 * jawW), -0.03, -0.01)); // sidor
            }

            if (style.pompadour) {
                // Connys brylkrämslugg: hög, bakåtstruken våg + stjärt
                addHair(ell(hair, 0.125, 0.055, 0.2), 0, 0.225, 0.07, -0.5, 0, 0);
                addHair(ell(hair, 0.11, 0.05, 0.1), 0, 0.2, 0.19, -0.05, 0, 0);
                [-1, 1].forEach(s => {
                    addHair(ell(hair, 0.045, 0.05, 0.1), s * 0.125, 0.175, 0.07, -0.2, 0, -s * 0.35);
                });
                addHair(ell(hair, 0.085, 0.06, 0.06), 0, 0.0, -0.205);                         // ankstjärt
            } else {
                // Lasses sidbena: lugg som sveper över pannan
                addHair(ell(hair, 0.15, 0.052, 0.115), -0.03, 0.172, 0.105, 0.5, 0, 0.16);
                addHair(ell(hair, 0.075, 0.04, 0.09), -0.085, 0.145, 0.15, 0.7, 0, 0.65);
                addHair(ell(hair, 0.11, 0.048, 0.085), 0.07, 0.185, 0.07, 0.4, 0, -0.18);
                [-1, 1].forEach(s => addHair(ell(hair, 0.028, 0.07, 0.04), s * 0.178 * jawW, -0.04, 0.07));
            }
        }

        // ----- Träffyta för klick -----
        const hitbox = new T.Mesh(
            new T.BoxGeometry(0.85, 2.25, 0.65),
            new T.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.set(0, 1.12, 0);
        group.add(hitbox);

        // ----- Mjuk markskugga -----
        const shadowTex = Characters_blobTexture();
        const blob = new T.Mesh(
            new T.PlaneGeometry(1.1, 0.75),
            new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55, fog: false })
        );
        blob.rotation.x = -Math.PI / 2;
        blob.position.y = 0.012;
        blob.raycast = () => {};
        blob.renderOrder = 1;
        group.add(blob);

        const actor = {
            id, kind, group, lower, upperBody, torsoGroup, headGroup,
            mouthMesh: mouthInner, upperLip, lowerLip, mouthBase: { y: mouthY, z: mouthZ },
            eyes, eyelids, eyebrows, hairGroup, blob,
            leftLeg: legL, rightLeg: legR, leftArm: armL, rightArm: armR,
            hitbox,
            blinkOffset: Math.random() * 4.0,
            anim: {
                phase: Math.random() * 6.28, walkBlend: 0, talkBlend: 0,
                yaw: 0, lookYaw: 0, lookPitch: 0,
                eyeX: 0, eyeY: 0, nextSaccade: 1 + Math.random() * 2, saccX: 0, saccY: 0,
                shift: 0, shiftTarget: 0, nextShift: 3 + Math.random() * 4,
                lastX: null, lastZ: null, blink: 0, nextBlink: 2 + Math.random() * 3,
                gestureArm: id === 'conny' ? 'L' : 'R'
            }
        };
        return actor;
    }

    let _blobTex = null;
    function Characters_blobTexture() {
        if (_blobTex) return _blobTex;
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
        grd.addColorStop(0, 'rgba(0,0,0,0.85)');
        grd.addColorStop(0.55, 'rgba(0,0,0,0.38)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
        _blobTex = new OrigCanvas(c);
        return _blobTex;
    }
    const OrigCanvas = T.CanvasTexture;

    // ------------------------------------------------------------------
    // Animation
    // ------------------------------------------------------------------
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

    /**
     * state: { t, dt, walking, speed (världsenheter/s), talking,
     *          faceYaw (önskad kroppsvridning), lookDx (riktning mot den man tittar på, +x = höger) }
     */
    function update(actor, st) {
        if (!actor) return;
        const a = actor.anim;
        const dt = clamp(st.dt || 0.016, 0.001, 0.1);
        const t = st.t;
        const bo = actor.blinkOffset;

        // ----- Blandningsvikter -----
        a.walkBlend = damp(a.walkBlend, st.walking ? 1 : 0, st.walking ? 9 : 7, dt);
        a.talkBlend = damp(a.talkBlend, st.talking ? 1 : 0, 8, dt);
        const w = a.walkBlend, tk = a.talkBlend;

        // ----- Gångfas drivs av faktisk förflyttning (inga glidande fötter) -----
        const stride = 1.55;                    // världsenheter per full gångcykel
        if (st.walking) a.phase += (Math.max(0.6, st.speed || 2.4) / stride) * Math.PI * 2 * dt;
        else a.phase = damp(a.phase, Math.round(a.phase / Math.PI) * Math.PI, 5, dt); // lägg ner fötterna parallellt

        const ph = a.phase;
        const s = Math.sin(ph), c = Math.cos(ph);

        // ----- Kroppsvridning (mjuk) -----
        a.yaw = damp(a.yaw, st.faceYaw || 0, 7, dt);
        actor.group.rotation.y = a.yaw;

        // ----- Viktförskjutning i vila -----
        a.nextShift -= dt;
        if (a.nextShift <= 0) {
            a.shiftTarget = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
            a.nextShift = 3 + Math.random() * 5;
        }
        a.shift = damp(a.shift, a.shiftTarget, 1.6, dt);
        const idle = 1 - w;
        const breath = Math.sin(t * 2.1 + bo);

        // ----- Ben -----
        const legAmp = 0.58 * w;
        const thL = s * legAmp, thR = -s * legAmp;
        const kneeBend = (ph0) => 0.12 * w + 0.85 * w * Math.max(0, -Math.cos(ph0));
        const kL = kneeBend(ph), kR = kneeBend(ph + Math.PI);
        // Vilande ben: det avlastade benet böjs lite
        const restBend = 0.05 * idle * Math.max(0, a.shift);
        const restBendR = 0.05 * idle * Math.max(0, -a.shift);

        actor.leftLeg.rotation.x = thL;
        actor.rightLeg.rotation.x = thR;
        actor.leftLeg.userData.knee.rotation.x = kL + restBend;
        actor.rightLeg.userData.knee.rotation.x = kR + restBendR;
        actor.leftLeg.userData.foot.rotation.x = -(thL + kL) * 0.65 + (Math.max(0, Math.cos(ph)) * 0.35 * w);
        actor.rightLeg.userData.foot.rotation.x = -(thR + kR) * 0.65 + (Math.max(0, -Math.cos(ph)) * 0.35 * w);
        actor.leftLeg.rotation.z = 0.012 * a.shift * idle;
        actor.rightLeg.rotation.z = 0.012 * a.shift * idle;

        // ----- Bål -----
        const bob = (0.024 * Math.cos(2 * ph) + 0.004) * w;
        actor.group.position.y = bob - 0.012 * Math.abs(a.shift) * idle;
        actor.lower.rotation.y = 0.14 * s * w;
        actor.lower.position.x = 0.012 * a.shift * idle;
        actor.upperBody.rotation.y = -0.20 * s * w + (st.talking ? Math.sin(t * 1.3 + bo) * 0.05 : 0);
        actor.upperBody.rotation.z = -0.018 * a.shift * idle + 0.025 * Math.cos(ph) * w;
        actor.upperBody.rotation.x = 0.05 * w;                 // lutar lite framåt när man går
        actor.upperBody.position.y = 0.95 + breath * 0.004 * idle;
        actor.torsoGroup.scale.set(1.0 + breath * 0.012, 1.0 + breath * 0.008, 1.0 + breath * 0.02);

        // ----- Armar -----
        const gest = tk * (0.5 + 0.5 * Math.sin(t * 2.4 + bo * 3));
        const armSwingL = -s * 0.52 * w, armSwingR = s * 0.52 * w;
        const setArm = (arm, swing, isGesture, side) => {
            let sh = swing + breath * 0.01 * idle;
            let elbow = -(0.16 + 0.45 * Math.max(0, -swing / 0.52) * w) - 0.05 * breath * idle;
            let sz = -side * 0.10 - side * 0.03 * breath * idle;
            if (isGesture) {
                const raise = tk;
                sh = damp(arm.rotation.x, -0.55 * raise + swing * (1 - raise) + Math.sin(t * 3.1 + bo) * 0.18 * raise, 12, dt);
                elbow = -(0.16 + 0.95 * raise) + Math.sin(t * 4.3 + bo) * 0.22 * raise;
                sz = -side * (0.10 + 0.10 * raise);
            }
            arm.rotation.x = isGesture ? sh : damp(arm.rotation.x, sh, 14, dt);
            arm.rotation.z = damp(arm.rotation.z, sz, 10, dt);
            arm.userData.elbow.rotation.x = damp(arm.userData.elbow.rotation.x, elbow, 12, dt);
            arm.userData.hand.rotation.z = isGesture ? Math.sin(t * 5.2 + bo) * 0.35 * tk : 0;
        };
        const gestureLeft = a.gestureArm === 'L';
        setArm(actor.leftArm, armSwingL, gestureLeft && tk > 0.02, -1);
        setArm(actor.rightArm, armSwingR, !gestureLeft && tk > 0.02, 1);

        // ----- Huvud & blick -----
        const lookDx = st.lookDx || 0;
        const wantYaw = clamp(lookDx * 0.16, -0.5, 0.5) * (0.55 + 0.45 * tk) - actor.group.rotation.y * 0.35;
        a.lookYaw = damp(a.lookYaw, wantYaw + Math.sin(t * 0.5 + bo) * 0.05, 4, dt);
        const nod = tk * (Math.sin(t * 7.3 + bo) * 0.035 + Math.max(0, Math.sin(t * 2.2 + bo)) * 0.05);
        const wantPitch = Math.sin(t * 0.9 + bo) * 0.02 + nod - 0.03 * w;
        a.lookPitch = damp(a.lookPitch, wantPitch, 9, dt);
        actor.headGroup.rotation.y = a.lookYaw - actor.upperBody.rotation.y * 0.6;
        actor.headGroup.rotation.x = a.lookPitch;
        actor.headGroup.rotation.z = Math.sin(t * 0.7 + bo) * 0.015 + a.shift * 0.012 * idle;

        // Ögonrörelser (små hopp) – tittar åt samtalspartnern när man pratar
        a.nextSaccade -= dt;
        if (a.nextSaccade <= 0) {
            a.saccX = (Math.random() - 0.5) * 0.5;
            a.saccY = (Math.random() - 0.5) * 0.3;
            a.nextSaccade = 0.8 + Math.random() * 2.6;
        }
        const targetEyeX = clamp(lookDx * 0.05, -0.35, 0.35) * 0.6 + a.saccX * 0.5;
        a.eyeX = damp(a.eyeX, targetEyeX, 16, dt);
        a.eyeY = damp(a.eyeY, a.saccY * 0.5, 16, dt);
        actor.eyes.forEach(e => { e.rotation.y = a.eyeX; e.rotation.x = -a.eyeY; });

        // Blinkning
        a.nextBlink -= dt;
        if (a.nextBlink <= 0) { a.blink = 1; a.nextBlink = 2.2 + Math.random() * 3.6; if (Math.random() < 0.2) a.nextBlink = 0.25; }
        a.blink = Math.max(0, a.blink - dt * 7.5);
        const closure = a.blink > 0.5 ? (1 - (a.blink - 0.5) * 2) : a.blink * 2; // snabbt ner, snabbt upp
        const lidAngle = -0.38 + 1.83 * clamp(closure, 0, 1);
        actor.eyelids.forEach(l => { l.rotation.x = lidAngle; });

        // Ögonbryn
        const emph = tk * Math.max(0, Math.sin(t * 2.6 + bo * 2)) * 0.014;
        actor.eyebrows.forEach((b, i) => {
            b.position.y = 0.085 + emph + (i === 0 ? 0.0 : 0.0);
        });

        // Mun: pratar i stavelser
        if (tk > 0.05) {
            const syl = Math.abs(Math.sin(t * 9.0 + bo)) * (0.55 + 0.45 * Math.sin(t * 3.3 + bo * 2));
            const open = clamp(syl * 1.3, 0, 1) * tk;
            actor.mouthMesh.scale.set(1.0 - 0.15 * open, 1 + open * 4.2, 1);
            actor.lowerLip.position.y = actor.mouthBase.y - 0.011 - 0.014 * open;
            actor.mouthMesh.position.y = actor.mouthBase.y - 0.001 - 0.005 * open;
            actor.upperLip.position.y = actor.mouthBase.y + 0.004 + 0.002 * open;
        } else {
            actor.mouthMesh.scale.set(1, 1, 1);
            actor.lowerLip.position.y = actor.mouthBase.y - 0.011;
            actor.mouthMesh.position.y = actor.mouthBase.y - 0.001;
            actor.upperLip.position.y = actor.mouthBase.y + 0.004;
        }

        // Skuggan följer med kroppen
        if (actor.blob) {
            actor.blob.scale.set(1 + 0.08 * w, 1, 1);
            actor.blob.position.y = 0.012 - actor.group.position.y;
        }
    }

    return { create, update, outline, std, ell, lathe, limb, addRim };
})();
