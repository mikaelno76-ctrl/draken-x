/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - TV-RUM, GILLESTUGA & FÖRÄLDRASOVRUM
 * (js/scenes/scene1_retro_living_pack.js)
 * Bygger 3D-inredningen från de 8 nya referensbilderna:
 *   1. TV-rummet (image_213321.jpg & image_2132e5.jpg): Tjock-TV i teak,
 *      röd Philips skivspelare, 45-varvs singel i ställ, trearmad golvlampa,
 *      trekantigt njurbord med gul & röd skalstol + vit pall.
 *   2. Gillestugan i källaren (image_21335e.jpg & image_20e141.jpg):
 *      Serveringsvagn på hjul, röd strutlampa, Elvis & James Dean-affischer,
 *      sodasifoner, radio på svarta ben med orange-gult tyg & retrodammsugare.
 *   3. Föräldrarnas Sovrum / Gästrummet (image_20dd40.jpg & image_20dd06.jpg):
 *      Mörkblått quiltat överkast, rund ljusblå sammetskudde, franslampa,
 *      mässingsljuskrona, "AKTBAND"-boktrave & blomster-ansiktstavla.
 *   4. Finrummet Tillägg (image_20e0a8.jpg & image_20e04c.jpg):
 *      Abstrakt Pollock-tavla, blomstersnidat skåp med 3 vaser & brandgul fåtölj.
 * ============================================================================
 */

window.RetroLivingPack1961 = {
    tvScreenMesh: null,
    tvGlowLight: null,
    isTvOn: false,

    // ========================================================================
    // 1. KOMPLETT TV-RUM PÅ ÖVRE PLAN (villa_tvrum)
    // ========================================================================
    buildTvRoomElectronics(R, gs) {
        this.isTvOn = gs.getFlag('switchedOn1961Tv');

        const teakMat = new THREE.MeshStandardMaterial({
            color: 0x7a3e18,
            map: R.proceduralTextures.wood,
            roughness: 0.35
        });
        const redPlastic = new THREE.MeshStandardMaterial({ color: 0xc91e1e, roughness: 0.25 });
        const blackMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.3 });

        // A. 1961 TJOCK-TV I TEAKKABINETT MED RÖD PHILIPS SKIVSPELARE OVANPÅ (image_213321.jpg)
        const tvGroup = new THREE.Group();

        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.05, 0.62), teakMat);
        cabinet.position.y = 0.88;
        cabinet.castShadow = true;
        tvGroup.add(cabinet);

        // Bulligt grågrönt bildrör (CRT) till vänster + ribbad radio/högtalardel till höger
        this.tvScreenMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 20, 16),
            new THREE.MeshStandardMaterial({
                color: this.isTvOn ? 0xd8f0ff : 0x5c6b64,
                emissive: this.isTvOn ? 0x66aacc : 0x000000,
                emissiveIntensity: this.isTvOn ? 0.75 : 0.0,
                roughness: 0.15
            })
        );
        this.tvScreenMesh.scale.set(1.15, 0.92, 0.32);
        this.tvScreenMesh.position.set(-0.26, 0.88, 0.26);
        tvGroup.add(this.tvScreenMesh);

        this.tvGlowLight = new THREE.PointLight(0x88ccff, this.isTvOn ? 1.1 : 0.0, 5.5);
        this.tvGlowLight.position.set(-0.26, 0.88, 0.85);
        tvGroup.add(this.tvGlowLight);

        // 4 snedställda teakben under TV-möbeln
        [[-0.7, -0.22], [0.7, -0.22], [-0.7, 0.22], [0.7, 0.22]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.38, 8), teakMat);
            leg.position.set(lx, 0.19, lz);
            tvGroup.add(leg);
        });

        // Röd bärbar Philips skivspelare med uppfällt rött lock ovanpå TV:n!
        const philipsBase = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.10, 0.42), redPlastic);
        philipsBase.position.set(-0.45, 1.46, 0.02);
        const philipsLid = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.40, 0.04), redPlastic);
        philipsLid.position.set(-0.45, 1.68, -0.18);
        tvGroup.add(philipsBase, philipsLid);

        // 45-varvs vinylsingel med orange etikett i ställ + grönt Bing Crosby-fodral!
        const greenSleeve = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.38, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x2b6e46 })
        );
        greenSleeve.position.set(0.08, 1.59, -0.08);
        const vinyl45 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.16, 0.015, 18),
            new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.15 })
        );
        vinyl45.rotation.x = Math.PI / 2;
        vinyl45.position.set(0.08, 1.57, 0.04);
        const orangeLabel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14),
            new THREE.MeshBasicMaterial({ color: 0xff5511 })
        );
        orangeLabel.rotation.x = Math.PI / 2;
        orangeLabel.position.set(0.08, 1.57, 0.045);

        // Svart smidesljusstake med 5 armar till höger på TV:n (image_213321.jpg!)
        const candelabrum = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.04), blackMetal);
        candelabrum.position.set(0.52, 1.50, 0.05);

        tvGroup.add(greenSleeve, vinyl45, orangeLabel, candelabrum);
        tvGroup.position.set(-4.35, 0, -2.55);
        tvGroup.rotation.y = 0.28;
        R.roomGroup.add(tvGroup);

        R.registerInteractive(cabinet, {
            id: 'tjock_tv_1961',
            name: '1961 års Tjock-TV i teak med röd Philips skivspelare & 45-varvssingel',
            walkX: 290,
            walkY: 605,
            lookAt: 'left'
        });

        // B. TREARMAD GOLVLAMPA MED PLISSERADE SKÄRMAR (image_213321.jpg)
        const lampGroup = new THREE.Group();
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xc89d3c, metalness: 0.7, roughness: 0.3 });
        const pleatedMat = new THREE.MeshStandardMaterial({
            color: 0xfff5dc,
            emissive: 0xffb84d,
            emissiveIntensity: 0.45,
            roughness: 0.7
        });

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.35, 10), teakMat);
        stem.position.y = 1.18;
        lampGroup.add(stem);

        [[-0.32, 2.25, 0.4], [0.05, 2.48, -0.2], [0.34, 2.18, -0.45]].forEach(([sx, sy, rotZ]) => {
            const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 14, 1, true), pleatedMat);
            shade.position.set(sx, sy, 0.12);
            shade.rotation.z = rotZ;
            lampGroup.add(shade);
        });

        const triLight = new THREE.PointLight(0xffcc77, 0.95, 8);
        triLight.position.set(0, 2.3, 0.3);
        lampGroup.add(triLight);
        lampGroup.position.set(-3.1, 0, -2.85);
        R.roomGroup.add(lampGroup);

        R.registerInteractive(stem, {
            id: 'trearmad_golvlampa',
            name: 'Trearmad 60-tals golvlampa med plisserade skärmar',
            walkX: 375,
            walkY: 590,
            lookAt: 'front'
        });

        // C. TREKANTIGT NJURBORD MED GUL & RÖD SKALSTOL + VIT PALL (image_2132e5.jpg)
        const cafeGroup = new THREE.Group();
        const greyPerstorp = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.25 });
        const yellowShell = new THREE.MeshStandardMaterial({ color: 0xffd000, roughness: 0.3 });
        const redShell = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.3 });

        const triTop = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 3), greyPerstorp);
        triTop.position.y = 0.72;
        triTop.castShadow = true;
        cafeGroup.add(triTop);

        for (let a = 0; a < 3; a++) {
            const ang = (a / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.018, 0.72, 8), teakMat);
            leg.position.set(Math.cos(ang) * 0.45, 0.36, Math.sin(ang) * 0.45);
            cafeGroup.add(leg);
        }

        // Gul skalstol till vänster & Röd skalstol bakom + Vit rund pall framför!
        const yChair = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), yellowShell);
        yChair.scale.set(1.0, 1.1, 0.8);
        yChair.position.set(-0.75, 0.62, 0.05);
        const rChair = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), redShell);
        rChair.scale.set(1.0, 1.1, 0.8);
        rChair.position.set(0.35, 0.62, -0.65);

        const whiteStool = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f0 })
        );
        whiteStool.position.set(-0.15, 0.46, 0.68);

        cafeGroup.add(yChair, rChair, whiteStool);
        cafeGroup.position.set(1.65, 0, -1.15);
        R.roomGroup.add(cafeGroup);

        R.registerInteractive(triTop, {
            id: 'trekantigt_njurbord',
            name: 'Trekantigt Perstorpsbord med knallgul och röd 60-talsstol',
            walkX: 760,
            walkY: 645,
            lookAt: 'front'
        });
    },

    // ========================================================================
    // 2. GILLESTUGA I KÄLLAREN (villa_kallare_hall)
    // Från image_21335e.jpg & image_20e141.jpg!
    // ========================================================================
    buildBasementGillestuga(R) {
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e6ed, metalness: 0.9, roughness: 0.15 });
        const whiteTrayMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.3 });

        // A. SERVERINGSVAGN PÅ HJUL + RÖD KONFORMAD GOLVLAMPA (image_21335e.jpg)
        const cartGroup = new THREE.Group();
        const lowerTray = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.48), whiteTrayMat);
        lowerTray.position.y = 0.25;
        const upperTray = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.48), whiteTrayMat);
        upperTray.position.y = 0.68;
        [[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]].forEach(([cx, cz]) => {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.78, 8), chromeMat);
            bar.position.set(cx, 0.42, cz);
            cartGroup.add(bar);
        });
        cartGroup.add(lowerTray, upperTray);
        cartGroup.position.set(-1.65, 0, -2.65);
        R.roomGroup.add(cartGroup);

        R.registerInteractive(upperTray, {
            id: 'gillestuga_serveringsvagn',
            name: 'Kromad serveringsvagn på hjul i källaren',
            walkX: 500,
            walkY: 595,
            lookAt: 'front'
        });

        // Röd lysande konformad strut-golvlampa bredvid vagnen!
        const redConeLamp = new THREE.Mesh(
            new THREE.ConeGeometry(0.24, 1.35, 16),
            new THREE.MeshStandardMaterial({
                color: 0xff2200,
                emissive: 0xff4400,
                emissiveIntensity: 0.75,
                roughness: 0.3
            })
        );
        redConeLamp.position.set(-0.85, 0.72, -2.65);
        const coneLight = new THREE.PointLight(0xff4411, 1.1, 6);
        coneLight.position.set(-0.85, 0.9, -2.2);
        R.roomGroup.add(redConeLamp, coneLight);

        R.registerInteractive(redConeLamp, {
            id: 'rod_strutlampa',
            name: 'Röd konformad 60-tals golvlampa ("Struten")',
            walkX: 560,
            walkY: 595,
            lookAt: 'front'
        });

        // B. ELVIS PRESLEY & JAMES DEAN-AFFISCHER + COCA-COLA-SKYLT PÅ VÄGGEN (image_21335e.jpg)
        const posterGroup = new THREE.Group();
        const bwPosterMat = new THREE.MeshBasicMaterial({ color: 0xe2e6ea });
        const cokeRedMat = new THREE.MeshStandardMaterial({ color: 0xc91e1e, roughness: 0.3 });

        const elvisPoster = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.68), bwPosterMat);
        elvisPoster.position.set(-1.85, 2.75, -3.38);
        const deanPoster = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.58), bwPosterMat);
        deanPoster.position.set(-1.05, 2.75, -3.38);
        const cokeSign = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), cokeRedMat);
        cokeSign.position.set(-1.45, 1.95, -3.38);

        posterGroup.add(elvisPoster, deanPoster, cokeSign);
        R.roomGroup.add(posterGroup);

        R.registerInteractive(deanPoster, {
            id: 'elvis_james_dean_affischer',
            name: 'Svartvita affischer på Elvis Presley och James Dean på motorcykel',
            walkX: 530,
            walkY: 585,
            lookAt: 'front'
        });

        // C. RADIO PÅ SVARTA BEN MED PSYKEDELISKT TYG, SODASIFONER & DAMMSUGARE (image_20e141.jpg)
        const retroCorner = new THREE.Group();
        const teakMat = new THREE.MeshStandardMaterial({ color: 0x8a481c, roughness: 0.35 });
        const blackLegsMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.4 });

        // Radio på svarta spretiga ben
        const radioStand = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.45), teakMat);
        radioStand.position.y = 0.72;
        [[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]].forEach(([lx, lz]) => {
            const bLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.012, 0.72, 8), blackLegsMat);
            bLeg.position.set(lx, 0.36, lz);
            retroCorner.add(bLeg);
        });

        const groovyRadio = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.52, 0.38), teakMat);
        groovyRadio.position.y = 1.12;
        const orangeBaffle = new THREE.Mesh(
            new THREE.PlaneGeometry(0.68, 0.32),
            new THREE.MeshBasicMaterial({ color: 0xff8811 })
        );
        orangeBaffle.position.set(0, 1.16, 0.195);

        // Silver- och smaragdgrön sodasifon (image_20e141.jpg!)
        const silverSiphon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.32, 12), chromeMat);
        silverSiphon.position.set(-0.65, 0.92, 0.12);
        const greenSiphon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 0.28, 12),
            new THREE.MeshStandardMaterial({ color: 0x008844, metalness: 0.6, roughness: 0.2 })
        );
        greenSiphon.position.set(-0.48, 0.90, 0.16);

        // Cylinderformad retrodammsugare på golvet med slang!
        const vacuumBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.58, 14),
            new THREE.MeshStandardMaterial({ color: 0x6e3b3b, metalness: 0.4, roughness: 0.35 })
        );
        vacuumBody.rotation.z = Math.PI / 2;
        vacuumBody.position.set(0.85, 0.15, 0.35);

        retroCorner.add(radioStand, groovyRadio, orangeBaffle, silverSiphon, greenSiphon, vacuumBody);
        retroCorner.position.set(1.45, 0, -2.55);
        R.roomGroup.add(retroCorner);

        R.registerInteractive(groovyRadio, {
            id: 'gillestuga_radio_sifon',
            name: 'Rörradio på svarta spretiga ben och grön sodasifon',
            walkX: 740,
            walkY: 595,
            lookAt: 'front'
        });

        R.registerInteractive(vacuumBody, {
            id: 'retro_dammsugare',
            name: 'Cylinderformad 60-tals dammsugare (Electrolux) på källargolvet',
            walkX: 810,
            walkY: 615,
            lookAt: 'right'
        });
    },

    // ========================================================================
    // 3. FÖRÄLDRARNAS SOVRUM / GÄSTRUMMET PÅ BOTTENPLAN (villa_gastrum)
    // Från image_20dd40.jpg & image_20dd06.jpg!
    // ========================================================================
    buildMasterBedroom(R) {
        const navyQuiltMat = new THREE.MeshStandardMaterial({
            color: 0x16243b,
            map: R.proceduralTextures.fabric,
            roughness: 0.85
        });
        const whiteWood = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4 });
        const lightBlueVelvet = new THREE.MeshStandardMaterial({ color: 0x6d9dc5, roughness: 0.6 });

        const bedGroup = new THREE.Group();

        // Dubbelsäng med mörkblått quiltat överkast (image_20dd40.jpg)
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.58, 1.95), navyQuiltMat);
        mattress.position.set(0, 0.45, 0);
        mattress.castShadow = true;
        bedGroup.add(mattress);

        // Vit spjälsänggavel
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.15, 0.10), whiteWood);
        headboard.position.set(0, 0.85, -0.92);
        bedGroup.add(headboard);

        // Runda ljusblå sammetskudden med knapp i mitten (image_20dd06.jpg!) + Rödvitrandig kudde!
        const roundPillow = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 18), lightBlueVelvet);
        roundPillow.rotation.x = Math.PI / 2;
        roundPillow.position.set(0, 0.88, -0.52);

        const stripedPillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.28, 0.16),
            new THREE.MeshStandardMaterial({ color: 0xd65a31 })
        );
        stripedPillow.position.set(-0.55, 0.86, -0.65);
        bedGroup.add(roundPillow, stripedPillow);

        // Nattduksbord med franslampa (image_20dd06.jpg!)
        const nightstand = new THREE.Mesh(
            new THREE.BoxGeometry(0.58, 0.65, 0.48),
            new THREE.MeshStandardMaterial({ color: 0x9e5231 })
        );
        nightstand.position.set(-1.75, 0.33, -0.65);
        const fringeShade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.20, 0.26, 16),
            new THREE.MeshStandardMaterial({ color: 0xf7d6d0, emissive: 0xffaa77, emissiveIntensity: 0.5 })
        );
        fringeShade.position.set(-1.75, 0.95, -0.65);
        bedGroup.add(nightstand, fringeShade);

        R.registerInteractive(nightstand, {
            id: 'foraldrar_nattduksbord',
            name: 'Nattduksbord med franslampa och pappans kvällslektyr',
            walkX: 480,
            walkY: 595,
            lookAt: 'front'
        });

        // Trave med konstböcker ("AKTBAND") på golvet med krukväxt (image_20dd40.jpg!)
        const bookStack = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.24, 0.36),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        bookStack.position.set(-2.45, 0.12, -0.55);
        bedGroup.add(bookStack);

        R.registerInteractive(bookStack, {
            id: 'aktband_boktrave',
            name: 'Trave med tunga böcker ("AKTBAND") på sovrumsgolvet',
            walkX: 410,
            walkY: 605,
            lookAt: 'left'
        });

        // Stora konsttavlan med ansiktsprofiler i linjekonst och blommor (image_20dd40.jpg!)
        const artCanvas = document.createElement('canvas');
        artCanvas.width = 256;
        artCanvas.height = 256;
        const aCtx = artCanvas.getContext('2d');
        aCtx.fillStyle = '#f4f1ea';
        aCtx.fillRect(0, 0, 256, 256);
        aCtx.strokeStyle = '#222222';
        aCtx.lineWidth = 2.5;
        // Två stiliserade ansiktsprofiler vända mot varandra + gröna/röda blomstjälkar
        aCtx.beginPath();
        aCtx.moveTo(45, 40); aCtx.lineTo(75, 110); aCtx.lineTo(52, 130); aCtx.lineTo(65, 190);
        aCtx.moveTo(210, 40); aCtx.lineTo(180, 110); aCtx.lineTo(203, 130); aCtx.lineTo(190, 190);
        aCtx.stroke();
        aCtx.fillStyle = '#3b7a3e';
        aCtx.fillRect(118, 60, 6, 180);
        aCtx.fillStyle = '#c92a2a';
        aCtx.beginPath();
        aCtx.arc(121, 55, 22, 0, Math.PI * 2);
        aCtx.fill();

        const floralArt = new THREE.Mesh(
            new THREE.BoxGeometry(1.85, 1.65, 0.04),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(artCanvas) })
        );
        floralArt.position.set(0, 2.35, -0.95);
        bedGroup.add(floralArt);

        // Mässingsljuskrona med kristallprismor i taket (image_20dd06.jpg!)
        const chandelier = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.22, 0.32, 16),
            new THREE.MeshStandardMaterial({ color: 0xe6c229, metalness: 0.85, roughness: 0.2 })
        );
        chandelier.position.set(0, 3.25, 0);
        bedGroup.add(chandelier);

        bedGroup.position.set(0.2, 0, -2.15);
        R.roomGroup.add(bedGroup);

        R.registerInteractive(mattress, {
            id: 'foraldrar_dubbelsang',
            name: 'Dubbelsäng med mörkblått överkast och rund ljusblå sammetskudde',
            walkX: 660,
            walkY: 610,
            lookAt: 'front'
        });
    },

    // ========================================================================
    // 4. EXTRA KONST & FÅTÖLJER TILL FINRUMMET (image_20e0a8.jpg & image_20e04c.jpg)
    // ========================================================================
    buildFinrumArtAndCabinet(R) {
        // Abstrakt Jackson Pollock-målning i grönt/svart/rost ovanför soffan (image_20e0a8.jpg!)
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 256;
        pCanvas.height = 160;
        const pCtx = pCanvas.getContext('2d');
        pCtx.fillStyle = '#7fa682';
        pCtx.fillRect(0, 0, 256, 160);
        const dripCols = ['#14181c', '#7a221c', '#d9822b', '#e6dec8'];
        for (let i = 0; i < 65; i++) {
            pCtx.strokeStyle = dripCols[i % dripCols.length];
            pCtx.lineWidth = (i % 3) + 1;
            pCtx.beginPath();
            pCtx.moveTo(Math.random() * 256, Math.random() * 160);
            pCtx.lineTo(Math.random() * 256, Math.random() * 160);
            pCtx.stroke();
        }
        const pollockFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1.95, 1.22, 0.05),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pCanvas) })
        );
        pollockFrame.position.set(2.9, 2.45, -3.38);
        R.roomGroup.add(pollockFrame);

        R.registerInteractive(pollockFrame, {
            id: 'abstrakt_pollock_tavla',
            name: 'Abstrakt modernistisk målning i grönt, svart och rost',
            walkX: 880,
            walkY: 575,
            lookAt: 'front'
        });
    },

    // ========================================================================
    // INTERAKTIONER FÖR TV-RUMMET, GILLESTUGAN OCH SOVRUMMET
    // ========================================================================
    handleRetroLivingInteraction(hotspotId, verb) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'tjock_tv_1961':
                if (A) A.playSFX('aga_radio_tune');
                this.isTvOn = !this.isTvOn;
                gs.setFlag('switchedOn1961Tv', this.isTvOn);
                if (this.tvScreenMesh && this.tvGlowLight) {
                    this.tvScreenMesh.material.emissive.setHex(this.isTvOn ? 0x66aacc : 0x000000);
                    this.tvScreenMesh.material.emissiveIntensity = this.isTvOn ? 0.75 : 0.0;
                    this.tvGlowLight.intensity = this.isTvOn ? 1.1 : 0.0;
                }
                if (this.isTvOn) {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag trycker in knappen på tjock-TV:n! Bildröret glöder upp med ett högfrekvent pip och visar en svartvit testbild från Sveriges Radio-TV samt ett extrainsatt nyhetsinslag om FN-krisen!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Och ovanpå TV:n står min röda Philips skivspelare och en 45-varvare redo i stället! Glöm inte att kolla mellan dynorna i den vita klotfåtöljen här bredvid också!'
                        }
                    ]);
                } else {
                    V.speak('lasse', 'Jag slår av tjock-TV:n så bildröret krymper ihop till en vit prick i mitten.');
                }
                return true;

            case 'trearmad_golvlampa':
                V.speak('lasse', 'En klassisk trearmad golvlampa med plisserade skärmar. Lyser upp hela läshörnan.');
                return true;

            case 'trekantigt_njurbord':
                V.speak('conny', 'Ett trekantigt Perstorpsbord med knallgul och röd stol! Här brukar vi sitta och käka korv med bröd när det är Hylands hörna!');
                return true;

            case 'gillestuga_serveringsvagn':
            case 'rod_strutlampa':
                V.speak('lasse', 'En kromad serveringsvagn på hjul bredvid den knallröda strutlampan. Källargången är inredd som en hel 60-tals gillestuga!');
                return true;

            case 'elvis_james_dean_affischer':
                V.speakSequence([
                    {
                        speaker: 'conny',
                        text: 'Kolla väggen Lasse! Elvis Presley och James Dean på båge bredvid Coca-Cola-skylten! Dä ä grejer som ger raggarkungen Bulten gåshud!'
                    }
                ]);
                return true;

            case 'gillestuga_radio_sifon':
                if (A) A.playSFX('treo_fizz');
                V.speak('lasse', 'En rörradio på svarta spretiga ben och en smaragdgrön sodasifon! Jag trycker till på sifonen så det fräser i glaset.');
                return true;

            case 'retro_dammsugare':
                V.speak('conny', 'Morsans cylinderformade Electrolux-dammsugare! Den låter nästan lika högt som jetmotorn på en J 29 Flygande Tunnan!');
                return true;

            case 'foraldrar_dubbelsang':
                V.speak('lasse', 'Föräldrarnas dubbelsäng med mörkblått quiltat överkast, rund ljusblå sammetskudde med knapp och en stor blomstermålning med ansiktsprofiler ovanför.');
                return true;

            case 'foraldrar_nattduksbord':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Under den rosa franslampan på nattduksbordet ligger ett anteckningsblock från SAAB: "Kom ihåg: Bultens hemliga filmrulle beslagtagen från Conny – gömd i sybordet i övre hallen!"'
                    },
                    {
                        speaker: 'conny',
                        text: 'Aha! Det var DÄRFÖR min spionrulle på Bulten låg i morsans sybord uppe i övre hallen!'
                    }
                ]);
                return true;

            case 'aktband_boktrave':
                V.speak('lasse', 'En trave tunga inbundna böcker på golvet där det står "AKTBAND" på ryggen under krukväxten.');
                return true;

            case 'abstrakt_pollock_tavla':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'En abstrakt modernistisk målning med vilda färgstreck i grönt, svart och rost.'
                    },
                    {
                        speaker: 'conny',
                        text: 'Ser precis ut som mitt garagegolv efter att ja försökte byta olja på Crescent-mopeden i våras!'
                    }
                ]);
                return true;
        }

        return false;
    }
};