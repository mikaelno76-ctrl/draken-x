/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - 1961 DESIGNMÖBLER, BERSÅ-KÖKET & RAKETOSTEN
 * (js/scenes/scene1_furniture_pack.js)
 * Nu utökad med Stig Lindbergs Berså-köksdetaljer (vit Bumling-lampa, runda
 * matbordet med Myran-stolar, Berså-porslin, Kanel-kryddburken och Kavlis
 * Raketost!) samt George Nelson Bubble Lamps i Finrummet!
 * ============================================================================
 */

window.FurniturePack1961 = {
    plaidTexture: null,

    _getPlaidTexture() {
        if (this.plaidTexture) return this.plaidTexture;
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#9e8c70';
        ctx.fillRect(0, 0, 256, 256);

        const stripes = [
            { pos: 30, w: 28, col: 'rgba(185, 65, 45, 0.55)' },
            { pos: 95, w: 18, col: 'rgba(65, 45, 30, 0.65)' },
            { pos: 150, w: 34, col: 'rgba(215, 145, 65, 0.50)' },
            { pos: 210, w: 12, col: 'rgba(245, 240, 225, 0.65)' }
        ];
        stripes.forEach(s => {
            ctx.fillStyle = s.col;
            ctx.fillRect(0, s.pos, 256, s.w);
            ctx.fillRect(s.pos, 0, s.w, 256);
        });

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 3);
        this.plaidTexture = tex;
        return tex;
    },

    // ========================================================================
    // RUM D: BERSÅ-KÖKET (villa_kok) - Tant Karin, Bumling, Raketost & Kanelburk!
    // ========================================================================
    buildKitchenAndMom(R) {
        const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x6ab0b8, roughness: 0.4 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xd0d7de, metalness: 0.85, roughness: 0.2 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xc86428, metalness: 0.75, roughness: 0.25 });
        const whitePaint = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.25 });

        // 1. Diskbänk med klappgrötsskål + Kryddhylla med "Kanel"-burken (image_2ca003.jpg!)
        const counterGroup = new THREE.Group();
        const lowerBench = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.92, 0.75), cabinetMat);
        lowerBench.position.y = 0.46;
        lowerBench.castShadow = true;
        const steelTop = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.06, 0.78), steelMat);
        steelTop.position.y = 0.95;

        const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.24, 14), copperMat);
        kettle.position.set(-1.1, 1.10, 0);

        const bowl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.14, 0.18, 16),
            new THREE.MeshStandardMaterial({ color: 0xf5ebd6, roughness: 0.3 })
        );
        bowl.position.set(0.65, 1.07, 0.08);

        // KAVLIS RAKETOST PÅ KÖKSBÄNKEN (Rödgul tub med snöre från image_2ca003.jpg!)
        const raketOst = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.065, 0.24, 14),
            new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 })
        );
        raketOst.position.set(-0.25, 1.10, 0.18);
        const raketCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.068, 0.068, 0.04, 14),
            whitePaint
        );
        raketCap.position.set(-0.25, 1.23, 0.18);

        // Kryddhylla på väggen med "Kanel"-burk och köksklocka (image_2ca6ec.jpg & image_2ca003.jpg)
        const spiceShelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.26), whitePaint);
        spiceShelf.position.set(-0.4, 2.25, -0.35);
        const kanelJar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12),
            new THREE.MeshStandardMaterial({ color: 0x3b7a9e })
        );
        kanelJar.position.set(-0.4, 2.38, -0.32);

        const wallClock = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.06, 18),
            new THREE.MeshStandardMaterial({ color: 0xc89e68 })
        );
        wallClock.rotation.x = Math.PI / 2;
        wallClock.position.set(-1.55, 2.15, -0.42);

        counterGroup.add(lowerBench, steelTop, kettle, bowl, raketOst, raketCap, spiceShelf, kanelJar, wallClock);
        counterGroup.position.set(-1.6, 0, -2.85);
        R.roomGroup.add(counterGroup);

        R.registerInteractive(bowl, {
            id: 'koks_klappgrot_skal',
            name: 'Stor porslinsskål med ovispad klappgröt på diskbänken',
            walkX: 540,
            walkY: 585,
            lookAt: 'front'
        });

        R.registerInteractive(raketOst, {
            id: 'kavlis_raketost',
            name: 'Kavlis Raketost (1961 års tubost med dragsnöre)',
            walkX: 460,
            walkY: 590,
            lookAt: 'front'
        });

        R.registerInteractive(kanelJar, {
            id: 'kryddhylla_kanel',
            name: 'Kryddhylla med "Kanel"-burk i keramik och rund köksklocka',
            walkX: 440,
            walkY: 580,
            lookAt: 'front'
        });

        // 2. BERSÅ-MATHÖRNAN (Från image_2ca6ec.jpg: Vit Bumling-lampa, runt träbord, Myran-stolar & Berså-kanna!)
        consthookGroup = new THREE.Group();
        const oakTableMat = new THREE.MeshStandardMaterial({ color: 0x7c4d25, map: R.proceduralTextures.wood, roughness: 0.4 });
        const greenChairMat = new THREE.MeshStandardMaterial({ color: 0x113826, roughness: 0.35 });

        // Runt matbord med Berså-kaffekanna och sockerkaka
        const roundTop = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.06, 22), oakTableMat);
        roundTop.position.y = 0.82;
        roundTop.castShadow = true;
        consthookGroup.add(roundTop);

        [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.82, 10), oakTableMat);
            leg.position.set(lx, 0.41, lz);
            consthookGroup.add(leg);
        });

        // Berså-kanna & kaffekopp på bordet
        const bersaPitcher = new THREE.Mesh(
            new THREE.CylinderGeometry(0.10, 0.14, 0.22, 14),
            new THREE.MeshStandardMaterial({ map: R.proceduralTextures.wp_bersa })
        );
        bersaPitcher.position.set(-0.22, 0.96, 0.05);
        consthookGroup.add(bersaPitcher);

        // 2 Mörkgröna Myran-stolar på kromben (image_2ca6ec.jpg!)
        [-0.78, 0.78].forEach((cx, i) => {
            const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 14), greenChairMat);
            seat.position.set(cx, 0.48, 0.25);
            const back = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), greenChairMat);
            back.scale.set(1.0, 1.1, 0.2);
            back.position.set(cx * 1.15, 0.82, 0.32);
            back.rotation.y = i === 0 ? 1.2 : -1.2;
            consthookGroup.add(seat, back);
        });

        // Vit "Bumling"-pendellampa som hänger ner över det runda bordet (image_2ca6ec.jpg!)
        const bumlingCord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 8), whitePaint);
        bumlingCord.position.set(0, 2.85, 0);
        const bumlingTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 20), whitePaint);
        bumlingTop.position.set(0, 2.15, 0);
        const bumlingShade = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.45, 0.24, 20), whitePaint);
        bumlingShade.position.set(0, 1.96, 0);
        const bumlingLight = new THREE.PointLight(0xfff2cc, 1.1, 7);
        bumlingLight.position.set(0, 1.75, 0);
        consthookGroup.add(bumlingCord, bumlingTop, bumlingShade, bumlingLight);

        consthookGroup.position.set(2.55, 0, -1.85);
        R.roomGroup.add(consthookGroup);

        R.registerInteractive(bersaPitcher, {
            id: 'bersa_porslin_bord',
            name: 'Runt matbord med Stig Lindbergs Berså-servis och vit Bumling-lampa',
            walkX: 860,
            walkY: 615,
            lookAt: 'front'
        });

        // 3. Tant Karin (Connys mamma vid diskbänken)
        const momActor = R.createCharacterMesh('mamma', {
            jacketColor: 0xb84a39,
            shirtColor: 0xffffff,
            pantsColor: 0x3b4d5e,
            hairColor: 0x6e4726,
            pompadour: false
        });
        momActor.group.position.set(0.35, 0, -2.05);
        momActor.group.rotation.y = -0.35;
        R.actorsGroup.add(momActor.group);

        R.registerInteractive(momActor.hitbox, {
            id: 'tant_karin_mamma',
            name: 'Tant Karin (Connys mamma vid diskbänken)',
            walkX: 650,
            walkY: 605,
            lookAt: 'front'
        });
    },

    // ========================================================================
    // RUM A: FINRUM & MATSAL (villa_matsal) - Nu även med Bubble Lamps!
    // ========================================================================
    buildFinrumFurniture(R) {
        const teakMat = new THREE.MeshStandardMaterial({
            color: 0x8a481c,
            map: R.proceduralTextures.wood,
            roughness: 0.32
        });
        const darkOakMat = new THREE.MeshStandardMaterial({
            color: 0x4a2e16,
            map: R.proceduralTextures.wood,
            roughness: 0.4
        });
        const mossGreenMat = new THREE.MeshStandardMaterial({
            color: 0x475942,
            map: R.proceduralTextures.fabric,
            bumpMap: R.proceduralTextures.fabric,
            bumpScale: 0.02,
            roughness: 0.85
        });

        // 0. GEORGE NELSON VITA "BUBBLE LAMPS" I TAKET (Från image_2ca3e6.png!)
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0xfaf8f2,
            emissive: 0xffe6b3,
            emissiveIntensity: 0.35,
            roughness: 0.6
        });
        const bubble1 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 16), lampMat);
        bubble1.scale.set(1.0, 1.35, 1.0);
        bubble1.position.set(0.8, 3.05, -1.5);
        const bubble2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 16), lampMat);
        bubble2.scale.set(1.45, 0.72, 1.45);
        bubble2.position.set(1.85, 2.85, -1.4);
        R.roomGroup.add(bubble1, bubble2);

        // 1. CADO-VÄGGHYLLA I TEAK
        const cadoGroup = new THREE.Group();
        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.3, 0.06), teakMat);
        backPanel.position.set(0, 1.85, 0);
        cadoGroup.add(backPanel);

        const lowerCabinet = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.72, 0.48), teakMat);
        lowerCabinet.position.set(0, 0.65, 0.22);
        lowerCabinet.castShadow = true;
        cadoGroup.add(lowerCabinet);

        const lockBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 0.42), teakMat);
        lockBox.position.set(0.98, 1.72, 0.20);
        lockBox.castShadow = true;
        const keyhole = new THREE.Mesh(
            new THREE.CircleGeometry(0.025, 10),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        keyhole.position.set(0.98, 1.98, 0.42);

        const slantedShelf = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.04, 0.38), teakMat);
        slantedShelf.position.set(-0.58, 1.48, 0.20);
        slantedShelf.rotation.x = 0.38;

        [2.35, 2.95].forEach(hy => {
            const topShelf = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.04, 0.34), teakMat);
            topShelf.position.set(0, hy, 0.18);
            cadoGroup.add(topShelf);
        });

        cadoGroup.add(lockBox, keyhole, slantedShelf);
        cadoGroup.position.set(-2.6, 0, -3.38);
        R.roomGroup.add(cadoGroup);

        R.registerInteractive(lockBox, {
            id: 'cado_barskap',
            name: 'Cado-vägghyllans låsta sekretärskåp i teak',
            walkX: 440,
            walkY: 575,
            lookAt: 'front'
        });

        // 2. VITRINSKÅP
        const vitrinGroup = new THREE.Group();
        const vitrinBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, 0.48), darkOakMat);
        vitrinBody.position.y = 1.45;
        vitrinBody.castShadow = true;
        const glassPane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.88, 1.35),
            new THREE.MeshPhysicalMaterial({ color: 0x88bbee, transmission: 0.6, opacity: 0.5, transparent: true })
        );
        glassPane.position.set(0, 1.72, 0.25);
        [[-0.42, -0.15], [0.42, 0.15]].forEach(([lx, rot]) => {
            const sLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.38), darkOakMat);
            sLeg.position.set(lx, 0.20, 0);
            sLeg.rotation.z = rot;
            vitrinGroup.add(sLeg);
        });
        vitrinGroup.add(vitrinBody, glassPane);
        vitrinGroup.position.set(0.35, 0, -3.15);
        R.roomGroup.add(vitrinGroup);

        R.registerInteractive(vitrinBody, {
            id: 'morkt_vitrinskap',
            name: 'Vitrinskåp i mörk ek med glasdörr',
            walkX: 660,
            walkY: 575,
            lookAt: 'front'
        });

        // 3. TEAK-SIDEBOARD
        const sbGroup = new THREE.Group();
        const sbBody = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.72, 0.52), teakMat);
        sbBody.position.y = 0.68;
        sbBody.castShadow = true;
        [[-1.1, -0.18], [1.1, -0.18], [-1.1, 0.18], [1.1, 0.18]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.34, 10), teakMat);
            leg.position.set(lx, 0.17, lz);
            sbGroup.add(leg);
        });
        sbGroup.add(sbBody);
        sbGroup.position.set(3.15, 0, -3.10);
        R.roomGroup.add(sbGroup);

        R.registerInteractive(sbBody, {
            id: 'teak_sideboard_skjutdorr',
            name: 'Låg 60-talssideboard i teak med skjutdörrar',
            walkX: 900,
            walkY: 580,
            lookAt: 'front'
        });

        // 4. MOSSGRÖN SOFFGRUPP
        const sofaGroup = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.24, 0.78), mossGreenMat);
        seat.position.y = 0.46;
        seat.castShadow = true;
        const backRest = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.62, 0.18), mossGreenMat);
        backRest.position.set(0, 0.84, -0.28);
        backRest.rotation.x = -0.12;
        [-1.15, 1.15].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.82), teakMat);
            arm.position.set(ax, 0.66, 0);
            const frontPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.66, 8), teakMat);
            frontPost.position.set(ax, 0.33, 0.34);
            sofaGroup.add(arm, frontPost);
        });
        sofaGroup.add(seat, backRest);
        sofaGroup.position.set(-1.5, 0, -1.35);
        R.roomGroup.add(sofaGroup);

        R.registerInteractive(seat, {
            id: 'gron_soffgrupp',
            name: 'Mossgrön 60-talssoffa med teakarmstöd',
            walkX: 500,
            walkY: 635,
            lookAt: 'front'
        });

        // 5. CHEFSSKRIVBORD MED A-BEN
        const deskGroup = new THREE.Group();
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.98), teakMat);
        deskTop.position.y = 1.05;
        deskTop.castShadow = true;
        const leftDrawers = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.88), teakMat);
        leftDrawers.position.set(-0.62, 0.76, 0);
        const rightCab = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.52, 0.88), teakMat);
        rightCab.position.set(0.62, 0.76, 0);
        [-0.98, 0.98].forEach(bx => {
            const legA1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 1.08, 8), teakMat);
            legA1.position.set(bx, 0.52, 0.32);
            legA1.rotation.x = -0.18;
            const legA2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 1.08, 8), teakMat);
            legA2.position.set(bx, 0.52, -0.32);
            legA2.rotation.x = 0.18;
            deskGroup.add(legA1, legA2);
        });
        deskGroup.add(deskTop, leftDrawers, rightCab);
        deskGroup.position.set(2.6, 0, -1.25);
        deskGroup.rotation.y = -0.25;
        R.roomGroup.add(deskGroup);

        R.registerInteractive(deskTop, {
            id: 'teak_chefsskrivbord',
            name: 'Frisvävande chefsskrivbord i teak med A-ben',
            walkX: 830,
            walkY: 640,
            lookAt: 'right'
        });
    },

    // ========================================================================
    // RUM B: ÖVRE TV- & FÅTÖLJRUM (villa_tvrum)
    // ========================================================================
    buildTvrumLoungeChairs(R) {
        const ballGroup = new THREE.Group();
        const whiteFiberglass = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.12, metalness: 0.15 });
        const orangePlush = new THREE.MeshStandardMaterial({ color: 0xb83718, map: R.proceduralTextures.fabric, roughness: 0.85 });

        const basePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.52, 0.28, 20), whiteFiberglass);
        basePedestal.position.y = 0.14;
        const outerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.82, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.75),
            whiteFiberglass
        );
        outerSphere.rotation.x = Math.PI * 0.38;
        outerSphere.position.y = 0.98;
        outerSphere.castShadow = true;

        const innerCushion = new THREE.Mesh(new THREE.SphereGeometry(0.74, 20, 16), orangePlush);
        innerCushion.position.set(0, 0.96, 0.05);
        innerCushion.scale.set(0.92, 0.92, 0.65);

        ballGroup.add(basePedestal, outerSphere, innerCushion);
        ballGroup.position.set(-2.2, 0, -2.15);
        ballGroup.rotation.y = 0.35;
        R.roomGroup.add(ballGroup);

        R.registerInteractive(outerSphere, {
            id: 'klotfatolj_ballchair',
            name: 'Klotrund vit fåtölj med orangeröda dynor ("Åskbollen")',
            walkX: 430,
            walkY: 600,
            lookAt: 'left'
        });

        const leatherGroup = new THREE.Group();
        const cognacLeather = new THREE.MeshStandardMaterial({ color: 0x8c3f19, roughness: 0.28, metalness: 0.12 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.95, roughness: 0.1 });

        const swivelStar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.45, 0.26, 5), chromeMat);
        swivelStar.position.y = 0.13;
        const lSeat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 0.78), cognacLeather);
        lSeat.position.y = 0.42;
        const lBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.05, 0.16), cognacLeather);
        lBack.position.set(0, 0.92, -0.28);
        lBack.rotation.x = -0.22;
        const headPillow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.52, 12), cognacLeather);
        headPillow.rotation.z = Math.PI / 2;
        headPillow.position.set(0, 1.22, -0.24);

        const ottomanBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.36, 0.26, 4), chromeMat);
        ottomanBase.position.set(-0.35, 0.13, 0.85);
        const ottomanTop = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.52), cognacLeather);
        ottomanTop.position.set(-0.35, 0.34, 0.85);
        ottomanTop.rotation.x = 0.12;

        leatherGroup.add(swivelStar, lSeat, lBack, headPillow, ottomanBase, ottomanTop);
        leatherGroup.position.set(0.45, 0, -2.25);
        leatherGroup.rotation.y = -0.25;
        R.roomGroup.add(leatherGroup);

        R.registerInteractive(lBack, {
            id: 'cognac_laderfatolj',
            name: 'Konjaksbrun snurrfåtölj i läder med fotpall',
            walkX: 680,
            walkY: 605,
            lookAt: 'front'
        });

        const plaidGroup = new THREE.Group();
        const plaidMat = new THREE.MeshStandardMaterial({ map: this._getPlaidTexture(), roughness: 0.8 });
        const teakArmMat = new THREE.MeshStandardMaterial({ color: 0x7c441e, roughness: 0.35 });

        const pSeat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.75), plaidMat);
        pSeat.position.y = 0.44;
        const pHighBack = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.28, 0.12), plaidMat);
        pHighBack.position.set(0, 1.05, -0.32);
        pHighBack.rotation.x = -0.15;
        [-0.40, 0.40].forEach(ax => {
            const curvedArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.68), teakArmMat);
            curvedArm.position.set(ax, 0.56, 0);
            plaidGroup.add(curvedArm);
        });
        plaidGroup.add(pSeat, pHighBack);
        plaidGroup.position.set(2.9, 0, -2.10);
        plaidGroup.rotation.y = -0.4;
        R.roomGroup.add(plaidGroup);

        R.registerInteractive(pHighBack, {
            id: 'rutig_lasfatolj',
            name: 'Högryggad läsfåtölj i skotskrutigt 60-talstyg',
            walkX: 900,
            walkY: 605,
            lookAt: 'right'
        });
    },

    // ========================================================================
    // RUM C: "MITT SOVRUM" / RÖDA ARBETSHÖRNAN (villa_mitt_sovrum)
    // ========================================================================
    buildRedStudyRoom(R) {
        const redLacquer = new THREE.MeshStandardMaterial({ color: 0x9e0b22, roughness: 0.28 });
        const birchTopMat = new THREE.MeshStandardMaterial({ color: 0xd8bfa3, roughness: 0.4 });
        const facitGrey = new THREE.MeshStandardMaterial({ color: 0x8c928e, roughness: 0.35, metalness: 0.3 });

        const deskGroup = new THREE.Group();

        const leftPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.08, 0.92), redLacquer);
        leftPedestal.position.set(-1.15, 0.54, 0);
        leftPedestal.castShadow = true;
        const openBottomDrawer = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.20, 0.55), redLacquer);
        openBottomDrawer.position.set(-1.15, 0.16, 0.52);

        const rightPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.08, 0.92), redLacquer);
        rightPedestal.position.set(1.35, 0.54, 0);

        const lightWoodTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 1.02), birchTopMat);
        lightWoodTop.position.set(0.1, 1.12, 0);
        lightWoodTop.castShadow = true;

        const redChair = new THREE.Group();
        const cSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 16), redLacquer);
        cSeat.position.y = 0.65;
        const cRim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 16, 1, true, 0, Math.PI * 1.2), redLacquer);
        cRim.position.y = 1.02;
        redChair.add(cSeat, cRim);
        redChair.position.set(0.15, 0, 0.65);
        redChair.rotation.y = -0.35;

        const typewriter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 0.46), facitGrey);
        typewriter.position.set(-0.25, 1.26, 0.05);
        const paperSheet = new THREE.Mesh(
            new THREE.PlaneGeometry(0.34, 0.32),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        paperSheet.position.set(-0.25, 1.44, -0.08);
        paperSheet.rotation.x = -0.25;

        const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.02, 14), redLacquer);
        saucer.position.set(-0.92, 1.17, 0.22);
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.11, 12), redLacquer);
        cup.position.set(-0.92, 1.23, 0.22);

        const vase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.10, 0.16, 14),
            new THREE.MeshStandardMaterial({ color: 0xd8e2ec })
        );
        vase.position.set(0.88, 1.24, -0.05);
        for (let t = 0; t < 7; t++) {
            const tulip = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffd700 })
            );
            tulip.position.set(0.88 + Math.cos(t) * 0.10, 1.42 + (t % 2) * 0.06, -0.05 + Math.sin(t) * 0.10);
            deskGroup.add(tulip);
        }

        const redWallShelf = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.88, 0.32), redLacquer);
        redWallShelf.position.set(-0.05, 2.38, -0.35);
        for (let b = 0; b < 8; b++) {
            const greenBook = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.36, 0.26),
                new THREE.MeshStandardMaterial({ color: 0x1d6b42 })
            );
            greenBook.position.set(0.15 + b * 0.07, 2.18, -0.32);
            deskGroup.add(greenBook);
        }

        deskGroup.add(
            leftPedestal, openBottomDrawer, rightPedestal, lightWoodTop,
            redChair, typewriter, paperSheet, saucer, cup, vase, redWallShelf
        );
        deskGroup.position.set(0.0, 0, -2.45);
        R.roomGroup.add(deskGroup);

        R.registerInteractive(typewriter, {
            id: 'facit_skrivmaskin',
            name: 'Grå Facit-skrivmaskin med ilagt maskinskrivet papper',
            walkX: 610,
            walkY: 590,
            lookAt: 'front'
        });

        R.registerInteractive(redWallShelf, {
            id: 'rod_vagghylla_ivar_lo',
            name: 'Röd vägghylla med Ivar Lo-Johansson ("Lyckan") & transistorradio',
            walkX: 640,
            walkY: 580,
            lookAt: 'front'
        });

        R.registerInteractive(openBottomDrawer, {
            id: 'utdragen_rod_lada',
            name: 'Utdragen röd skrivbordslåda',
            walkX: 520,
            walkY: 605,
            lookAt: 'front'
        });
    },

    handleFurnitureInteraction(hotspotId, verb) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'kavlis_raketost':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'En rödgul tub Kavlis Raketost! Man trycker upp osten i botten och skär av en skiva med det lilla snöret.'
                    },
                    {
                        speaker: 'conny',
                        text: 'Raketost är grejer för riktiga raketpiloter det, Lasse! Tio gånger bättre än det där livsfarliga messmöret ute i hallen!'
                    }
                ]);
                return true;

            case 'kryddhylla_kanel':
                V.speak('lasse', 'Tant Karins blåvita keramikburk med texten "Kanel" i snirklig stil, precis bredvid den runda köksklockan.');
                return true;

            case 'bersa_porslin_bord':
                V.speak('lasse', 'Stig Lindbergs grönbladiga Berså-servis som matchar kökstapeten perfekt under den vita Bumling-lampan!');
                return true;

            case 'koks_klappgrot_skal':
                if (gs.getFlag('helpedMomInKitchen')) {
                    V.speak('lasse', 'Klappgröten är redan vispad så den står som ett moln i skålen!');
                    return true;
                }
                if (A) A.playSFX('pickup');
                gs.setFlag('helpedMomInKitchen', true);
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Jag tar ballongvispen och vispar Tant Karins lingon-klappgröt för glatta livet tills den blir alldeles vit och fluffig!'
                    },
                    {
                        speaker: 'mamma',
                        text: 'Åh vad snällt av dig, Lasse lilla! Kom och prata med mig här vid bänken så ska du få en sak jag hittade när jag städade!'
                    }
                ]);
                return true;

            case 'tant_karin_mamma':
                if (!gs.getFlag('helpedMomInKitchen')) {
                    V.speakSequence([
                        {
                            speaker: 'mamma',
                            text: 'Hej pojkar! Jag är så orolig för Connys pappa som låst in sig i källaren... Lasse lilla, orkar du vispa färdigt skålen med klappgröt på diskbänken åt mig, så har jag en liten överraskning till dig sen?'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Självklart tant Karin! Jag hugger tag i klappgröten på bänken direkt!'
                        }
                    ]);
                    return true;
                }
                if (!gs.getFlag('receivedClayHeart')) {
                    gs.setFlag('receivedClayHeart', true);
                    gs.addItem('lerhjarta_dagis');
                    V.speakSequence([
                        {
                            speaker: 'mamma',
                            text: 'Tack för hjälpen med gröten, Lasse! Och titta här vad jag hittade när jag städade källarförrådet: det är ett litet rött hjärta i bränd lera som du gjorde på lekskolan när du och Conny var fem år och glömde kvar här!'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Åh... tack så hemskt mycket tant Karin, vad fint att du sparade det! (Viskar för sig själv:) Herregud vad pinsamt... ett skevt lerhjärta från lekskolan! Vad ska jag med det töntiga skräpet till?!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Haha! Spara dä i fickan du, Ler-Lasse! Man vet aldrig när man stöter på en äkta prinsessa i utlandet!'
                        }
                    ]);
                    return true;
                }
                V.speak('mamma', 'Ta på er ordentligt om ni ska ut i höstkvällen pojkar, och glöm inte Skogaholmslimpan i hallen!');
                return true;

            case 'facit_skrivmaskin':
                if (A) A.playSFX('ui_click');
                gs.setFlag('readFacitClue', true);
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Det sitter ett ark i Facit-skrivmaskinen! Farsan har skrivit: "Till Polismästaren i Linköping. Jag har rivit ut sidan med raggarkungen Bultens nummer ur telefonkatalogen och låst in den i Cado-vägghyllans skåp i Finrummet!"'
                    },
                    {
                        speaker: 'lasse',
                        text: 'Och längst ner står det: "PS. Måste leta efter min lilla skåpsnyckel som trillade ur byxfickan när jag provsatt den nya klotrunda fåtöljen i TV-rummet."'
                    }
                ]);
                return true;

            case 'rod_vagghylla_ivar_lo':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'En knallröd vägghylla med tio gröna band, en transistorradio och Ivar Lo-Johanssons bok "Lyckan".'
                    },
                    {
                        speaker: 'conny',
                        text: 'Lyckan för mej ä när vi får igång efterbrännkammaren på Tors Vrede, Lasse!'
                    }
                ]);
                return true;

            case 'utdragen_rod_lada':
                V.speak('lasse', 'Den nedersta röda skrivbordslådan står på glänt. Bara färgband till Facit-maskinen och karbonpapper.');
                return true;

            case 'klotfatolj_ballchair':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En futuristisk klotrund vit fåtölj med orangeröda dynor! Sätter man sig där inne hör man inte ens om ryssen kommer.');
                    return true;
                }
                if (verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    if (gs.getFlag('foundCadoKey')) {
                        V.speak('conny', 'Vi har redan fiskat fram lilla mässingsnyckeln till Cado-skåpet mellan dynorna!');
                        return true;
                    }
                    if (A) A.playSFX('pickup');
                    gs.setFlag('foundCadoKey', true);
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag sticker ner handen djupt mellan de orangeröda dynorna i klotfåtöljen... Bingo! Där låg den lilla nyckeln till Cado-vägghyllan i Finrummet!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Snyggt jobbat! Ner till Finrummet på bottenplan å lås upp Bultens telefonnummer nu!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'cognac_laderfatolj':
                V.speak('lasse', 'Farsans konjaksbruna snurrfåtölj i äkta skinn med fotpall på kromfot.');
                return true;

            case 'rutig_lasfatolj':
                V.speak('conny', 'Snyggt skotskrutigt tyg på den där högryggade fåtöljen!');
                return true;

            case 'cado_barskap':
                if (!gs.getFlag('foundCadoKey')) {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Det hängande sekretärskåpet i Cado-vägghyllan är låst! Det är här inne farsan har låst in sidan med Bultens nummer.'
                        },
                        {
                            speaker: 'conny',
                            text: 'Vi måste snoka rätt på var gubben tappat skåpsnyckeln! Kan det stå nåt på hans skrivmaskin uppe på övervåningen?'
                        }
                    ]);
                    return true;
                }
                if (A) A.playSFX('pickup');
                gs.setFlag('foundBultenNumber', true);
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Jag vrider om lilla nyckeln från klotfåtöljen i Cado-skåpet... Klick! Där ligger den utrivna katalogsidan: "Bultens Bil & Däckbränning – 14 88 22"!'
                    },
                    {
                        speaker: 'conny',
                        text: 'Äntligen! Nu har vi numret! Ut till bakelittelefonen i hallen så ska ja ringa å driva in min hundralapp!'
                    }
                ]);
                return true;

            case 'morkt_vitrinskap':
                V.speak('lasse', 'Ett mörkt vitrinskåp med glasdörr på snedställda 60-talsben.');
                return true;

            case 'teak_sideboard_skjutdorr':
                V.speak('lasse', 'En lång, låg sideboard i teak med skjutdörrar och fyra lådor.');
                return true;

            case 'gron_soffgrupp':
                V.speak('conny', 'Mossgrön finsoffa med teakarmstöd! Här får man inte sitta med oljiga mopedbyxor!');
                return true;

            case 'teak_chefsskrivbord':
                V.speak('lasse', 'Ett exklusivt frisvävande skrivbord i teak med A-formade sidoben.');
                return true;
        }

        return false;
    }
};