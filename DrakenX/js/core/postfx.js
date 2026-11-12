/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - EFTERBEHANDLING (postfx.js)
 *
 * Renderar hela scenen till en HDR-buffert med kantutjämning (MSAA) och lägger
 * sedan på, i ett enda slutpass:
 *   - Bloom (varm "halation" runt lampor, solstrimmor och glänsande lack)
 *   - Filmisk tonmappning (ACES) och korrekt sRGB-utmatning
 *   - Färggradering (skuggor mot kallt, högdagrar mot varmt, mättnad, kontrast)
 *   - Vinjett, svag kromatisk aberration, rörligt filmkorn
 *
 * Varje rum kan ställa in sin egen "stämning" med PostFX.setGrade({...}).
 * Övergången mellan rum glider mjukt.
 *
 * Kräver WebGL2. Saknas det (eller går något fel) faller spelet automatiskt
 * tillbaka till vanlig rendering. Knappen "GRAFIK" i toppraden slår av/på.
 * ============================================================================
 */

window.PostFX = {
    enabled: true,
    ok: false,
    msaaSamples: 4,
    filmLook: true,
    maxRatio: 1.5,

    W: 1280,
    H: 760,
    Y0: 264,

    // Nuvarande (glidande) och önskad stämning
    grade: null,
    target: null,

    DEFAULT_GRADE: {
        exposure: 2.0,
        bloom: 0.55,
        bloomThreshold: 0.95,
        saturation: 1.08,
        contrast: 1.07,
        vignette: 0.30,
        grain: 0.030,
        aberration: 0.0022,
        shadowTint: [0.93, 0.98, 1.06],
        highTint: [1.06, 1.0, 0.90],
        lift: 0.0
    },

    init(renderer) {
        this.renderer = renderer;
        this.grade = Object.assign({}, this.DEFAULT_GRADE);
        this.target = Object.assign({}, this.DEFAULT_GRADE);
        this.ok = false;

        try {
            if (!renderer.capabilities.isWebGL2) {
                console.info('[PostFX] WebGL2 saknas – kör vanlig rendering.');
                return;
            }

            const ext = renderer.extensions;
            let hdr = false;
            if (ext.has('EXT_color_buffer_float')) hdr = true;
            else if (ext.has('EXT_color_buffer_half_float')) hdr = true;
            this.hdr = hdr;
            if (ext.has('OES_texture_float_linear')) { /* aktiverad om den finns */ }

            const pr = Math.min(renderer.getPixelRatio(), this.maxRatio);
            this.rw = Math.round(this.W * pr);
            this.rh = Math.round(this.H * pr);

            const opts = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
                encoding: THREE.LinearEncoding,
                depthBuffer: true,
                stencilBuffer: false
            };

            this.rtScene = new THREE.WebGLMultisampleRenderTarget(this.rw, this.rh, opts);
            this.rtScene.samples = this.msaaSamples;

            const mk = (w, h) => new THREE.WebGLRenderTarget(Math.max(2, w | 0), Math.max(2, h | 0), {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
                depthBuffer: false,
                stencilBuffer: false
            });

            // Bloom-kedja: 1/2, 1/4, 1/8 upplösning (med en temporär per nivå)
            this.levels = [];
            let lw = this.rw / 2, lh = this.rh / 2;
            for (let i = 0; i < 3; i++) {
                this.levels.push({ a: mk(lw, lh), b: mk(lw, lh), w: lw, h: lh });
                lw /= 2; lh /= 2;
            }

            this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.quadScene = new THREE.Scene();
            this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
            this.quad.frustumCulled = false;
            this.quadScene.add(this.quad);

            const vert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

            this.matBright = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.95 }, uKnee: { value: 0.5 } },
                vertexShader: vert,
                fragmentShader: `
                    uniform sampler2D tDiffuse; uniform float uThreshold; uniform float uKnee;
                    varying vec2 vUv;
                    void main(){
                        vec3 c = texture2D(tDiffuse, vUv).rgb;
                        c = min(c, vec3(24.0));
                        float br = max(c.r, max(c.g, c.b));
                        float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
                        soft = soft * soft / (4.0 * uKnee + 1e-4);
                        float w = max(soft, br - uThreshold) / max(br, 1e-4);
                        gl_FragColor = vec4(c * w, 1.0);
                    }`,
                depthTest: false, depthWrite: false
            });

            this.matBlur = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) } },
                vertexShader: vert,
                fragmentShader: `
                    uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
                    void main(){
                        vec3 s = texture2D(tDiffuse, vUv).rgb * 0.2270270270;
                        s += (texture2D(tDiffuse, vUv + uDir * 1.3846153846).rgb + texture2D(tDiffuse, vUv - uDir * 1.3846153846).rgb) * 0.3162162162;
                        s += (texture2D(tDiffuse, vUv + uDir * 3.2307692308).rgb + texture2D(tDiffuse, vUv - uDir * 3.2307692308).rgb) * 0.0702702703;
                        gl_FragColor = vec4(s, 1.0);
                    }`,
                depthTest: false, depthWrite: false
            });

            this.matFinal = new THREE.ShaderMaterial({
                uniforms: {
                    tScene: { value: null },
                    tB0: { value: null }, tB1: { value: null }, tB2: { value: null },
                    uExposure: { value: 2.0 }, uBloom: { value: 0.5 },
                    uSat: { value: 1.08 }, uContrast: { value: 1.07 },
                    uVignette: { value: 0.3 }, uGrain: { value: 0.03 }, uAberr: { value: 0.002 },
                    uShadowTint: { value: new THREE.Vector3(1, 1, 1) },
                    uHighTint: { value: new THREE.Vector3(1, 1, 1) },
                    uLift: { value: 0 },
                    uTime: { value: 0 }
                },
                vertexShader: vert,
                fragmentShader: `
                    uniform sampler2D tScene; uniform sampler2D tB0; uniform sampler2D tB1; uniform sampler2D tB2;
                    uniform float uExposure, uBloom, uSat, uContrast, uVignette, uGrain, uAberr, uLift, uTime;
                    uniform vec3 uShadowTint, uHighTint;
                    varying vec2 vUv;

                    vec3 aces(vec3 x){
                        x *= 0.6;
                        const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
                        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
                    }
                    vec3 toSRGB(vec3 c){
                        c = max(c, vec3(0.0));
                        return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
                    }
                    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

                    void main(){
                        vec2 d = vUv - 0.5;
                        float r2 = dot(d, d);
                        vec3 col;
                        col.r = texture2D(tScene, vUv + d * uAberr * r2 * 6.0).r;
                        col.g = texture2D(tScene, vUv).g;
                        col.b = texture2D(tScene, vUv - d * uAberr * r2 * 6.0).b;
                        col = min(col, vec3(32.0));

                        vec3 bloom = texture2D(tB0, vUv).rgb * 0.50 + texture2D(tB1, vUv).rgb * 0.34 + texture2D(tB2, vUv).rgb * 0.30;
                        col += bloom * vec3(1.0, 0.90, 0.76) * uBloom;

                        col = aces(col * uExposure);
                        col = toSRGB(col);

                        // Gradering i skärmrymd
                        float luma = dot(col, vec3(0.299, 0.587, 0.114));
                        col = mix(vec3(luma), col, uSat);
                        col *= mix(uShadowTint, uHighTint, smoothstep(0.1, 0.8, luma));
                        col = (col - 0.5) * uContrast + 0.5;
                        col += uLift;

                        // Vinjett
                        float v = smoothstep(0.30, 0.98, length(d * vec2(1.0, 0.92)) * 1.55);
                        col *= 1.0 - uVignette * v * v;

                        // Filmkorn + dither
                        float g = hash(vUv * vec2(1280.0, 760.0) + fract(uTime) * 91.7) - 0.5;
                        col += g * (uGrain * (1.0 - 0.6 * luma) + 0.004);

                        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
                    }`,
                depthTest: false, depthWrite: false
            });

            this.ok = true;
        } catch (err) {
            console.warn('[PostFX] Kunde inte starta, kör vanlig rendering:', err);
            this.ok = false;
        }
    },

    setGrade(partial, instant = false) {
        if (!this.target) return;
        this.target = Object.assign({}, this.DEFAULT_GRADE, partial || {});
        if (instant) this.grade = Object.assign({}, this.target);
    },

    _lerpGrade(dt) {
        const k = 1 - Math.exp(-dt * 3.5);
        const g = this.grade, t = this.target;
        for (const key in t) {
            if (Array.isArray(t[key])) {
                for (let i = 0; i < t[key].length; i++) g[key][i] += (t[key][i] - g[key][i]) * k;
            } else {
                g[key] += (t[key] - g[key]) * k;
            }
        }
    },

    _pass(material, target) {
        this.quad.material = material;
        this.renderer.setRenderTarget(target);
        this.renderer.render(this.quadScene, this.quadCam);
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    render(scene, camera, dt) {
        const r = this.renderer;
        if (!this.ok || !this.enabled) {
            // Reservläge: direkt rendering med three.js egen tonmappning
            r.setRenderTarget(null);
            r.toneMapping = THREE.ACESFilmicToneMapping;
            r.toneMappingExposure = (this.grade ? this.grade.exposure : 2.0) * 0.55;
            r.outputEncoding = THREE.sRGBEncoding;
            r.setViewport(0, this.Y0, this.W, this.H);
            r.setScissor(0, this.Y0, this.W, this.H);
            r.setScissorTest(true);
            r.render(scene, camera);
            return;
        }

        try {
            this._lerpGrade(dt || 0.016);
            const g = this.grade;

            r.toneMapping = THREE.NoToneMapping;
            r.outputEncoding = THREE.LinearEncoding;

            // 1. Scenen till HDR-bufferten (MSAA)
            r.setRenderTarget(this.rtScene);
            r.setScissorTest(false);
            r.clear();
            r.render(scene, camera);

            // 2. Ljusa partier -> bloom-kedjan
            this.matBright.uniforms.tDiffuse.value = this.rtScene.texture;
            this.matBright.uniforms.uThreshold.value = g.bloomThreshold;
            this._pass(this.matBright, this.levels[0].a);

            let src = this.levels[0].a;
            for (let i = 0; i < this.levels.length; i++) {
                const L = this.levels[i];
                this.matBlur.uniforms.tDiffuse.value = src.texture;
                this.matBlur.uniforms.uDir.value.set(1 / L.w, 0);
                this._pass(this.matBlur, L.b);
                this.matBlur.uniforms.tDiffuse.value = L.b.texture;
                this.matBlur.uniforms.uDir.value.set(0, 1 / L.h);
                this._pass(this.matBlur, L.a);
                src = L.a;
            }

            // 3. Slutpass till skärmen
            const u = this.matFinal.uniforms;
            u.tScene.value = this.rtScene.texture;
            u.tB0.value = this.levels[0].a.texture;
            u.tB1.value = this.levels[1].a.texture;
            u.tB2.value = this.levels[2].a.texture;
            u.uExposure.value = g.exposure;
            u.uBloom.value = g.bloom;
            u.uSat.value = g.saturation;
            u.uContrast.value = g.contrast;
            u.uVignette.value = this.filmLook ? g.vignette : g.vignette * 0.5;
            u.uGrain.value = this.filmLook ? g.grain : 0.0;
            u.uAberr.value = g.aberration;
            u.uShadowTint.value.set(g.shadowTint[0], g.shadowTint[1], g.shadowTint[2]);
            u.uHighTint.value.set(g.highTint[0], g.highTint[1], g.highTint[2]);
            u.uLift.value = g.lift;
            u.uTime.value = (performance.now() * 0.001) % 100;

            r.setViewport(0, this.Y0, this.W, this.H);
            r.setScissor(0, this.Y0, this.W, this.H);
            r.setScissorTest(true);
            this._pass(this.matFinal, null);
        } catch (err) {
            console.warn('[PostFX] Fel i efterbehandlingen – stänger av den:', err);
            this.ok = false;
            r.setRenderTarget(null);
        }
    }
};
