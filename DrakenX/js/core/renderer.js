/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - WEBGL 2.5D/3D RENDERER v5.1 (renderer.js)
 * HOTFIX: Fixar osynliga karaktärer genom att ersätta r128-känslig Toon-shader
 * med skottsäker Standard-cel-look + svart Outline, samt tvingar kameran att
 * alltid låsa på Lasse och Conny i alla rumsscener!
 * ============================================================================
 */

window.Renderer = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    raycaster: null,
    mouse: null,
    clock: null,

    cameraPanX: 0,
    targetCameraPanX: 0,
    panLimits: { min: -4.2, max: 4.2 },
    cameraDistanceZ: 8.2,
    cameraHeightY: 1.65,

    roomGroup: null,
    actorsGroup: null,
    fxGroup: null,
    clickableMeshes: [],

    lasseActor: null,
    connyActor: null,
    dogActor: null,
    drakenMesh: null,
    smokeParticles: [],
    proceduralTextures: {},

    init() {
        this.canvas = document.getElementById('webgl-canvas');
        if (!this.canvas || typeof THREE === 'undefined') return;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(1280, 1024, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (THREE.sRGBEncoding !== undefined) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        }
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c1017);

        this.camera = new THREE.PerspectiveCamera(34, 1280 / 760, 0.1, 500);
        this.camera.position.set(0, this.cameraHeightY, this.cameraDistanceZ);
        this.camera.lookAt(0, 1.35, 0);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();

        this.roomGroup = new THREE.Group();
        this.actorsGroup = new THREE.Group();
        this.fxGroup = new THREE.Group();
        this.scene.add(this.roomGroup, this.actorsGroup, this.fxGroup);

        this._generateProceduralTextures();
        this.clearScene();
    },

    clearScene(fogColor = 0x101520, fogDensity = 0.015) {
        if (!this.scene) return;

        while (this.roomGroup.children.length > 0) this.roomGroup.remove(this.roomGroup.children[0]);
        while (this.actorsGroup.children.length > 0) this.actorsGroup.remove(this.actorsGroup.children[0]);
        while (this.fxGroup.children.length > 0) this.fxGroup.remove(this.fxGroup.children[0]);

        this.clickableMeshes = [];
        this.smokeParticles = [];
        this.drakenMesh = null;
        this.lasseActor = null;
        this.connyActor = null;
        this.dogActor = null;

        this.cameraPanX = 0;
        this.targetCameraPanX = 0;

        this.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        this.scene.background = new THREE.Color(fogColor);

        this.camera.position.set(0, this.cameraHeightY, this.cameraDistanceZ);
        this.camera.lookAt(0, 1.35, 0);
    },

    screenToWorld(roomX, roomY) {
        const safeX = Number.isFinite(roomX) ? roomX : 520;
        const safeY = Number.isFinite(roomY) ? roomY : 615;
        const worldX = ((safeX - 640) / 640) * 6.8;
        const worldZ = ((safeY - 585) / 180) * 2.1;
        return new THREE.Vector3(worldX, 0, worldZ);
    },

    viewportToRoomX(viewportX) {
        const panOffsetPx = (this.cameraPanX / 6.8) * 640;
        return viewportX + panOffsetPx;
    },

    buildStandardRoom(options = {}) {
        const wallColor = options.wallColor || 0xffffff;
        const floorColor = options.floorColor || 0x8a5a36;
        const ambientIntensity = options.ambientIntensity !== undefined ? options.ambientIntensity : 0.45;

        const hemiLight = new THREE.HemisphereLight(0xffe8c8, 0x261e18, ambientIntensity);
        this.roomGroup.add(hemiLight);

        const mainSpot = new THREE.DirectionalLight(0xfff0d4, 0.78);
        mainSpot.position.set(2.5, 9.5, 6.5);
        mainSpot.castShadow = true;
        mainSpot.shadow.mapSize.width = 2048;
        mainSpot.shadow.mapSize.height = 2048;
        mainSpot.shadow.camera.left = -15;
        mainSpot.shadow.camera.right = 15;
        mainSpot.shadow.camera.top = 10;
        mainSpot.shadow.camera.bottom = -6;
        mainSpot.shadow.camera.near = 0.5;
        mainSpot.shadow.camera.far = 28;
        mainSpot.shadow.bias = -0.0006;
        this.roomGroup.add(mainSpot);

        if (!options.openSky) {
            const warmPoolLeft = new THREE.PointLight(0xffb85c, 0.75, 11.0, 1.6);
            warmPoolLeft.position.set(-3.2, 2.8, -0.8);
            const warmPoolRight = new THREE.PointLight(0xffaa44, 0.80, 11.0, 1.6);
            warmPoolRight.position.set(3.2, 2.8, -0.8);
            const frontActorFill = new THREE.DirectionalLight(0xfff4e0, 0.38);
            frontActorFill.position.set(0, 3.5, 8.0);
            this.roomGroup.add(warmPoolLeft, warmPoolRight, frontActorFill);
        }

        const floorMat = new THREE.MeshStandardMaterial({
            color: options.woodFloor ? 0xffffff : floorColor,
            map: options.woodFloor ? this.proceduralTextures.wood : null,
            bumpMap: options.woodFloor ? this.proceduralTextures.wood : null,
            bumpScale: 0.012,
            roughness: options.roughness || 0.42,
            metalness: 0.06
        });
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 12), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        if (!options.openSky) {
            let wallTex = null;
            if (options.wallpaperType && this.proceduralTextures[options.wallpaperType]) {
                wallTex = this.proceduralTextures[options.wallpaperType];
            } else if (options.wallpaper) {
                wallTex = this.proceduralTextures.wp_host693 || this.proceduralTextures.wallpaper1961;
            }

            const backWallMat = new THREE.MeshStandardMaterial({
                color: wallTex ? 0xffffff : wallColor,
                map: wallTex,
                bumpMap: wallTex,
                bumpScale: 0.005,
                roughness: 0.80
            });

            const backWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), backWallMat);
            backWall.position.set(0, 4.0, -3.5);
            backWall.receiveShadow = true;
            this.roomGroup.add(backWall);

            if (options.wainscoting) {
                const wainscotMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.45 });
                const wainscotPanel = new THREE.Mesh(new THREE.BoxGeometry(26, 1.35, 0.06), wainscotMat);
                wainscotPanel.position.set(0, 0.68, -3.46);
                wainscotPanel.receiveShadow = true;
                this.roomGroup.add(wainscotPanel);

                for (let wx = -10; wx <= 10; wx += 2.0) {
                    const molding = new THREE.Mesh(
                        new THREE.BoxGeometry(1.6, 0.92, 0.08),
                        new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.5 })
                    );
                    molding.position.set(wx, 0.68, -3.45);
                    this.roomGroup.add(molding);
                }
            } else {
                const baseboard = new THREE.Mesh(
                    new THREE.BoxGeometry(26, 0.22, 0.08),
                    new THREE.MeshStandardMaterial({ color: 0x3b2210, roughness: 0.5 })
                );
                baseboard.position.set(0, 0.11, -3.45);
                this.roomGroup.add(baseboard);
            }

            const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), backWallMat);
            leftWall.position.set(-11.5, 4.0, 1.5);
            leftWall.rotation.y = Math.PI / 2;
            this.roomGroup.add(leftWall);

            const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), backWallMat);
            rightWall.position.set(11.5, 4.0, 1.5);
            rightWall.rotation.y = -Math.PI / 2;
            this.roomGroup.add(rightWall);
        }
    },

    registerInteractive(mesh, hotspotData) {
        mesh.userData = {
            ...mesh.userData,
            isInteractive: true,
            id: hotspotData.id,
            name: hotspotData.name,
            walkX: hotspotData.walkX !== undefined ? hotspotData.walkX : 640,
            walkY: hotspotData.walkY !== undefined ? hotspotData.walkY : 600,
            lookAt: hotspotData.lookAt || 'front'
        };
        this.clickableMeshes.push(mesh);
    },

    getHoveredObject(screenX, screenY) {
        if (!this.camera || screenY > 760) return null;

        this.mouse.x = (screenX / 1280) * 2 - 1;
        this.mouse.y = -(screenY / 760) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableMeshes, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData.isInteractive && obj.parent) {
                obj = obj.parent;
            }
            if (obj && obj.userData && obj.userData.isInteractive) {
                return obj.userData;
            }
        }
        return null;
    },

    // ========================================================================
    // KARAKTÄRER MED SVART KONTURLINJE (OUTLINE), BLINKNING & ANDNING
    // Byggda med skottsäkra MeshStandardMaterial så WebGL aldrig döljer dem!
    // ========================================================================
    _addToonOutline(mesh, thickness = 1.055) {
        if (!mesh || !mesh.geometry) return;
        const outlineMat = new THREE.MeshBasicMaterial({
            color: 0x0d0f12,
            side: THREE.BackSide
        });
        const outline = new THREE.Mesh(mesh.geometry, outlineMat);
        outline.scale.setScalar(thickness);
        outline.raycast = () => {}; // Hindrar konturen från att stjäla musklick!
        mesh.add(outline);
    },

    spawnMainActors(showConny = true) {
        const gs = window.GameState;
        if (gs) {
            gs.webgl.cameraMode = 'room_25d';
        }

        // Lasse: Smalare, lite längre
        this.lasseActor = this.createCharacterMesh('lasse', {
            jacketColor: 0x2b5c8f,
            shirtColor: 0xebe4d5,
            pantsColor: 0x1e2733,
            hairColor: 0x8c6836,
            pompadour: false,
            shoulderScale: 0.96,
            heightScale: 1.03,
            jawWidth: 0.90
        });
        const lPos = this.screenToWorld(gs ? gs.player.x : 520, gs ? gs.player.y : 620);
        this.lasseActor.group.position.copy(lPos);
        this.actorsGroup.add(this.lasseActor.group);

        if (showConny) {
            // Conny: Bredaxlad med markerad käke och brylkrämslugg!
            this.connyActor = this.createCharacterMesh('conny', {
                jacketColor: 0x7c431e,
                shirtColor: 0xffffff,
                pantsColor: 0x161d26,
                hairColor: 0x14110f,
                pompadour: true,
                shoulderScale: 1.14,
                heightScale: 0.98,
                jawWidth: 1.08
            });
            const cPos = this.screenToWorld(gs ? gs.companion.x : 740, gs ? gs.companion.y : 595);
            this.connyActor.group.position.copy(cPos);
            this.actorsGroup.add(this.connyActor.group);

            this.registerInteractive(this.connyActor.hitbox, {
                id: 'conny_npc',
                name: 'Conny (Flipperspelskung)',
                walkX: (gs ? gs.companion.x : 740) - 100,
                walkY: (gs ? gs.companion.y : 595) + 10
            });
        }
    },

    createCharacterMesh(id, style = {}) {
        const group = new THREE.Group();
        const sScale = style.shoulderScale || 1.0;
        const hScale = style.heightScale || 1.0;
        group.scale.set(1.0, hScale, 1.0);

        const skinMat = new THREE.MeshStandardMaterial({
            color: style.skinColor || 0xf2c29b,
            roughness: 0.55,
            metalness: 0.05
        });
        const jacketMat = new THREE.MeshStandardMaterial({
            color: style.jacketColor || 0x4a525d,
            map: this.proceduralTextures.fabric,
            roughness: 0.68,
            metalness: 0.08
        });
        const zipperMat = new THREE.MeshStandardMaterial({
            color: 0xd8e0e8,
            metalness: 0.85,
            roughness: 0.25
        });
        const pantsMat = new THREE.MeshStandardMaterial({
            color: style.pantsColor || 0x181c22,
            map: this.proceduralTextures.fabric,
            roughness: 0.82
        });
        const shoeMat = new THREE.MeshStandardMaterial({
            color: 0x18120e,
            roughness: 0.45
        });
        const soleMat = new THREE.MeshStandardMaterial({
            color: 0x4a4238,
            roughness: 0.75
        });
        const hairMat = new THREE.MeshStandardMaterial({
            color: style.hairColor || 0x7a5c32,
            roughness: style.pompadour ? 0.18 : 0.55,
            metalness: style.pompadour ? 0.28 : 0.06
        });

        // 1. HÖFTER / BÄCKEN
        const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * sScale, 0.22, 0.22, 16), pantsMat);
        pelvis.scale.set(1.15, 1, 0.75);
        pelvis.position.set(0, 0.90, 0);
        pelvis.castShadow = true;
        this._addToonOutline(pelvis, 1.05);
        group.add(pelvis);

        // 2. BEN MED KNÄLED & SKOR
        const buildLeg = (isLeft) => {
            const hipPivot = new THREE.Group();
            hipPivot.position.set(isLeft ? -0.14 * sScale : 0.14 * sScale, 0.86, 0);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.095, 0.42, 14), pantsMat);
            thigh.position.y = -0.20;
            thigh.castShadow = true;
            this._addToonOutline(thigh, 1.06);
            hipPivot.add(thigh);

            const kneeJoint = new THREE.Group();
            kneeJoint.position.set(0, -0.40, 0);
            const kneeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.092, 12, 12), pantsMat);
            kneeJoint.add(kneeSphere);

            const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.075, 0.40, 14), pantsMat);
            calf.position.y = -0.20;
            calf.castShadow = true;
            this._addToonOutline(calf, 1.06);
            kneeJoint.add(calf);

            const footGroup = new THREE.Group();
            footGroup.position.set(0, -0.41, 0.05);
            const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.24), shoeMat);
            const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), shoeMat);
            shoeToe.scale.set(1.0, 0.65, 1.2);
            shoeToe.position.set(0, -0.01, 0.11);
            const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.025, 0.28), soleMat);
            sole.position.set(0, -0.045, 0.02);
            this._addToonOutline(shoeUpper, 1.06);
            footGroup.add(shoeUpper, shoeToe, sole);

            kneeJoint.add(footGroup);
            hipPivot.add(kneeJoint);
            hipPivot.userData = { kneeJoint };
            return hipPivot;
        };

        const leftLegGroup = buildLeg(true);
        const rightLegGroup = buildLeg(false);
        group.add(leftLegGroup, rightLegGroup);

        // 3. ÖVERKROPP / TORSO
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 1.32, 0);

        const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.31 * sScale, 0.25, 0.74, 18), jacketMat);
        chest.scale.set(1.12, 1.0, 0.68);
        chest.castShadow = true;
        this._addToonOutline(chest, 1.045);
        torsoGroup.add(chest);

        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16, 1, true), jacketMat);
        collar.position.set(0, 0.39, 0);
        torsoGroup.add(collar);

        const zipperLine = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.72, 0.02), zipperMat);
        zipperLine.position.set(0, 0.0, 0.195);
        torsoGroup.add(zipperLine);

        group.add(torsoGroup);

        // 4. ARMAR MED ARMBÅGSLED & HÄNDER
        const buildArm = (isLeft) => {
            const shoulderPivot = new THREE.Group();
            shoulderPivot.position.set(isLeft ? -0.35 * sScale : 0.35 * sScale, 1.60, 0);
            shoulderPivot.rotation.z = isLeft ? 0.14 : -0.14;

            const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 12), jacketMat);
            shoulderPivot.add(shoulderCap);

            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.080, 0.34, 12), jacketMat);
            upperArm.position.y = -0.17;
            upperArm.castShadow = true;
            this._addToonOutline(upperArm, 1.06);
            shoulderPivot.add(upperArm);

            const elbowJoint = new THREE.Group();
            elbowJoint.position.set(0, -0.34, 0);
            elbowJoint.rotation.x = -0.14;

            const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.065, 0.32, 12), jacketMat);
            foreArm.position.y = -0.16;
            foreArm.castShadow = true;
            this._addToonOutline(foreArm, 1.06);
            elbowJoint.add(foreArm);

            const handGroup = new THREE.Group();
            handGroup.position.set(0, -0.36, 0);
            const palm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.085), skinMat);
            const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.06, 8), skinMat);
            thumb.position.set(isLeft ? 0.02 : -0.02, 0.01, 0.045);
            thumb.rotation.x = 0.6;
            this._addToonOutline(palm, 1.06);
            handGroup.add(palm, thumb);

            elbowJoint.add(handGroup);
            shoulderPivot.add(elbowJoint);
            shoulderPivot.userData = { elbowJoint };
            return shoulderPivot;
        };

        const leftArmGroup = buildArm(true);
        const rightArmGroup = buildArm(false);
        group.add(leftArmGroup, rightArmGroup);

        // 5. HALS, HUVUD, BLINKANDE ÖGONLOCK, ÖGONBRYN & MUN
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.098, 0.18, 14), skinMat);
        neck.position.set(0, 1.74, 0);
        group.add(neck);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.94, 0);

        const jawW = style.jawWidth || 0.95;
        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 20), skinMat);
        cranium.scale.set(0.92 * jawW, 1.12, 0.98);
        cranium.castShadow = true;
        this._addToonOutline(cranium, 1.045);
        headGroup.add(cranium);

        const jawChin = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), skinMat);
        jawChin.scale.set(jawW, 0.90, 0.95);
        jawChin.position.set(0, -0.10, 0.04);
        headGroup.add(jawChin);

        [-0.195 * jawW, 0.195 * jawW].forEach(earX => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), skinMat);
            ear.scale.set(0.45, 1.15, 0.75);
            ear.position.set(earX, -0.01, 0.0);
            headGroup.add(ear);
        });

        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.11, 10), skinMat);
        nose.rotation.x = Math.PI * 0.42;
        nose.position.set(0, -0.01, 0.215);
        headGroup.add(nose);

        const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const irisMat = new THREE.MeshBasicMaterial({ color: 0x2b5c8f });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        const eyelids = [];
        const eyebrows = [];

        [-0.072, 0.072].forEach((ex, i) => {
            const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), scleraMat);
            sclera.scale.set(1.1, 0.88, 0.6);
            sclera.position.set(ex, 0.045, 0.185);

            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.020, 10, 10), irisMat);
            iris.position.set(ex, 0.045, 0.203);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), pupilMat);
            pupil.position.set(ex, 0.045, 0.211);

            const eyelid = new THREE.Mesh(
                new THREE.SphereGeometry(0.039, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
                skinMat
            );
            eyelid.position.set(ex, 0.045, 0.186);
            eyelid.scale.set(1.12, 0.12, 0.65);
            eyelids.push(eyelid);

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.018, 0.025), hairMat);
            brow.position.set(ex, 0.095, 0.198);
            brow.rotation.z = i === 0 ? 0.08 : -0.08;
            eyebrows.push(brow);

            headGroup.add(sclera, iris, pupil, eyelid, brow);
        });

        // Rundad, uttrycksfull mun (SphereGeometry stöds i alla Three.js-versioner!)
        const mouthMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.038, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0x6e1e1e })
        );
        mouthMesh.scale.set(1.2, 0.35, 0.5);
        mouthMesh.position.set(0, -0.105, 0.198);
        headGroup.add(mouthMesh);

        // HÅR MED OUTLINE
        const hairCrown = new THREE.Mesh(
            new THREE.SphereGeometry(0.218, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
            hairMat
        );
        hairCrown.scale.set(0.96 * jawW, 1.12, 1.02);
        hairCrown.position.y = 0.02;
        this._addToonOutline(hairCrown, 1.04);
        headGroup.add(hairCrown);

        const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.28, 14), hairMat);
        backHair.scale.set(0.95, 1.0, 0.65);
        backHair.position.set(0, -0.06, -0.08);
        headGroup.add(backHair);

        [-0.18 * jawW, 0.18 * jawW].forEach(hx => {
            const sideLock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.12), hairMat);
            sideLock.position.set(hx, -0.04, 0.02);
            headGroup.add(sideLock);
        });

        if (style.pompadour) {
            const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), hairMat);
            quiff.scale.set(1.18, 0.88, 1.38);
            quiff.position.set(0, 0.20, 0.12);
            quiff.rotation.x = -0.22;
            this._addToonOutline(quiff, 1.05);
            headGroup.add(quiff);
        } else {
            const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), hairMat);
            fringe.scale.set(1.3, 0.55, 0.8);
            fringe.position.set(0, 0.15, 0.14);
            headGroup.add(fringe);
        }

        group.add(headGroup);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 2.25, 0.65),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.set(0, 1.12, 0);
        group.add(hitbox);

        return {
            id,
            group,
            torsoGroup,
            headGroup,
            mouthMesh,
            eyelids,
            eyebrows,
            blinkOffset: Math.random() * 4.0,
            leftLeg: leftLegGroup,
            rightLeg: rightLegGroup,
            leftArm: leftArmGroup,
            rightArm: rightArmGroup,
            hitbox
        };
    },

    createDraken3D() {
        const draken = new THREE.Group();
        const aluMat = new THREE.MeshStandardMaterial({
            color: 0xd8dee6,
            map: this.proceduralTextures.aircraftSkin,
            bumpMap: this.proceduralTextures.aircraftSkin,
            bumpScale: 0.01,
            metalness: 0.82,
            roughness: 0.24
        });
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x2b3036, metalness: 0.75, roughness: 0.4 });
        const canopyMat = new THREE.MeshPhysicalMaterial({ color: 0x66b2ff, transmission: 0.68, opacity: 0.85, transparent: true, roughness: 0.1 });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, 6.2, 20), aluMat);
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        draken.add(body);

        const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.6, 20), darkMetalMat);
        noseCone.rotation.x = Math.PI / 2;
        noseCone.position.z = 4.4;
        draken.add(noseCone);

        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 2.2);
        wingShape.lineTo(1.75, -0.2);
        wingShape.lineTo(3.9, -2.5);
        wingShape.lineTo(3.9, -2.9);
        wingShape.lineTo(0, -2.7);
        wingShape.lineTo(-3.9, -2.9);
        wingShape.lineTo(-3.9, -2.5);
        wingShape.lineTo(-1.75, -0.2);
        wingShape.closePath();

        const wings = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.05 }), aluMat);
        wings.rotation.x = Math.PI / 2;
        wings.position.y = -0.05;
        wings.castShadow = true;
        draken.add(wings);

        const roundelMat = new THREE.MeshBasicMaterial({ map: this.proceduralTextures.treKronor });
        [-2.35, 2.35].forEach(rx => {
            const roundel = new THREE.Mesh(new THREE.CircleGeometry(0.52, 24), roundelMat);
            roundel.rotation.x = -Math.PI / 2;
            roundel.position.set(rx, 0.045, -1.55);
            draken.add(roundel);
        });

        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 2.4, 16, 1, false, 0, Math.PI), canopyMat);
        canopy.rotation.z = Math.PI / 2;
        canopy.rotation.y = Math.PI / 2;
        canopy.position.set(0, 0.42, 1.35);
        draken.add(canopy);

        const afterburnerFlame = new THREE.Mesh(
            new THREE.ConeGeometry(0.40, 4.2, 16),
            new THREE.MeshBasicMaterial({ color: 0x33bbff, transparent: true, opacity: 0.88 })
        );
        afterburnerFlame.rotation.x = -Math.PI / 2;
        afterburnerFlame.position.z = -5.4;
        afterburnerFlame.visible = false;
        draken.add(afterburnerFlame);

        const ebkLight = new THREE.PointLight(0x33bbff, 0, 12);
        ebkLight.position.set(0, 0, -4.5);
        draken.add(ebkLight);

        draken.userData = { afterburnerFlame, ebkLight };
        this.drakenMesh = draken;
        return draken;
    },

    createCar3D(type = 'cheva57') {
        const car = new THREE.Group();
        const isPolice = type === 'police61';
        const bodyMat = new THREE.MeshStandardMaterial({ color: isPolice ? 0x111317 : 0x1a1715, roughness: 0.25, metalness: 0.65 });
        const roofMat = new THREE.MeshStandardMaterial({ color: isPolice ? 0xf5f5f5 : 0xb52222, roughness: 0.3 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.1 });
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x99ccff, transmission: 0.72, opacity: 0.6, transparent: true, roughness: 0.1 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.66, 1.58), bodyMat);
        chassis.position.y = 0.56;
        chassis.castShadow = true;
        car.add(chassis);

        [-0.80, 0.80].forEach(cz => {
            const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.05, 0.03), chromeMat);
            sideTrim.position.set(0, 0.62, cz);
            car.add(sideTrim);
        });

        const windowBlock = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.46, 1.36), glassMat);
        windowBlock.position.set(-0.2, 1.10, 0);
        const roofTop = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.08, 1.42), roofMat);
        roofTop.position.set(-0.2, 1.35, 0);
        car.add(windowBlock, roofTop);

        [[-1.08, 0.66], [0.68, 0.66], [-1.08, -0.66], [0.68, -0.66]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.50, 8), roofMat);
            pillar.position.set(px, 1.10, pz);
            car.add(pillar);
        });

        [-0.72, 0.72].forEach(fz => {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.34, 0.08), isPolice ? bodyMat : roofMat);
            fin.position.set(-1.35, 0.92, fz);
            fin.rotation.z = -0.18;
            const tailLight = new THREE.Mesh(
                new THREE.ConeGeometry(0.07, 0.18, 10),
                new THREE.MeshBasicMaterial({ color: 0xff1111 })
            );
            tailLight.rotation.z = Math.PI / 2;
            tailLight.position.set(-1.98, 0.85, fz);
            car.add(fin, tailLight);
        });

        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 1.68), chromeMat);
        frontBumper.position.set(1.95, 0.38, 0);
        const grille = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.24, 1.15), chromeMat);
        grille.position.set(1.94, 0.56, 0);
        car.add(frontBumper, grille);

        [-0.58, 0.58].forEach(hz => {
            const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 14), chromeMat);
            bezel.rotation.z = Math.PI / 2;
            bezel.position.set(1.95, 0.68, hz);
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.10, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xfff4bb })
            );
            bulb.position.set(2.00, 0.68, hz);
            car.add(bezel, bulb);
        });

        [[-1.25, 0.78], [1.25, 0.78], [-1.25, -0.78], [1.25, -0.78]].forEach(([wx, wz]) => {
            const wheelGroup = new THREE.Group();
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.36, 0.36, 0.24, 18),
                new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.85 })
            );
            tire.rotation.x = Math.PI / 2;
            const whitewall = new THREE.Mesh(
                new THREE.CylinderGeometry(0.27, 0.27, 0.25, 18),
                new THREE.MeshBasicMaterial({ color: 0xf5f5f0 })
            );
            whitewall.rotation.x = Math.PI / 2;
            const hubcap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.26, 14),
                chromeMat
            );
            hubcap.rotation.x = Math.PI / 2;
            wheelGroup.add(tire, whitewall, hubcap);
            wheelGroup.position.set(wx, 0.36, wz);
            car.add(wheelGroup);
        });

        return car;
    },

    _animateActorLife(actor, otherActor, isTalking, isWalking, elapsed) {
        if (!actor) return;

        const blinkCycle = (elapsed + actor.blinkOffset) % 3.8;
        const isBlinking = blinkCycle > 3.64;
        if (actor.eyelids) {
            actor.eyelids.forEach(lid => {
                lid.scale.y = isBlinking ? 1.05 : 0.12;
            });
        }

        if (actor.torsoGroup && !isWalking) {
            const breath = Math.sin(elapsed * 2.4 + actor.blinkOffset);
            actor.torsoGroup.position.y = 1.32 + breath * 0.012;
            actor.torsoGroup.scale.set(1.0 + breath * 0.015, 1.0, 1.0 + breath * 0.02);
        }

        if (actor.headGroup) {
            let targetHeadYaw = 0;
            let targetHeadPitch = Math.sin(elapsed * 1.5 + actor.blinkOffset) * 0.03;

            if (otherActor && (isTalking || (window.GameState && (window.GameState.player.isTalking || window.GameState.companion.isTalking)))) {
                const dx = otherActor.group.position.x - actor.group.position.x;
                targetHeadYaw = THREE.MathUtils.clamp(dx * 0.18, -0.38, 0.38) - actor.group.rotation.y * 0.5;
            }
            if (isTalking) {
                targetHeadPitch += Math.sin(elapsed * 14) * 0.045;
            }

            actor.headGroup.rotation.y += (targetHeadYaw - actor.headGroup.rotation.y) * 0.12;
            actor.headGroup.rotation.x += (targetHeadPitch - actor.headGroup.rotation.x) * 0.15;
        }

        if (actor.eyebrows) {
            const browLift = isTalking ? Math.abs(Math.sin(elapsed * 10)) * 0.018 : 0;
            actor.eyebrows.forEach((b, idx) => {
                b.position.y = 0.095 + browLift;
                b.rotation.z = (idx === 0 ? 0.08 : -0.08) + (isTalking ? (idx === 0 ? 0.06 : -0.06) : 0);
            });
        }

        if (actor.mouthMesh) {
            if (isTalking) {
                const openY = 0.45 + Math.abs(Math.sin(elapsed * 20)) * 1.65;
                const openX = 1.05 + Math.abs(Math.cos(elapsed * 15)) * 0.35;
                actor.mouthMesh.scale.set(openX, openY, 0.5);
            } else {
                actor.mouthMesh.scale.set(1.2, 0.35, 0.5);
            }
        }
    },

    renderFrame() {
        if (!this.renderer || !this.scene || !this.camera) return;

        const elapsed = this.clock.getElapsedTime();
        const gs = window.GameState;

        if (this.lasseActor && gs) {
            this.lasseActor.group.visible = true;
            const pos = this.screenToWorld(gs.player.x, gs.player.y);
            this.lasseActor.group.position.copy(pos);

            // Om karaktärerna finns i rummet ska kameran ALLTID följa dem i 2.5D-vy!
            this.targetCameraPanX = THREE.MathUtils.clamp(
                pos.x * 0.72,
                this.panLimits.min,
                this.panLimits.max
            );
            this.cameraPanX += (this.targetCameraPanX - this.cameraPanX) * 0.10;
            this.camera.position.set(this.cameraPanX, this.cameraHeightY, this.cameraDistanceZ);
            this.camera.lookAt(this.cameraPanX, 1.32, 0);

            const targetRotY = gs.player.direction === 'left' ? -0.65
                : gs.player.direction === 'right' ? 0.65 : 0;
            this.lasseActor.group.rotation.y += (targetRotY - this.lasseActor.group.rotation.y) * 0.2;

            if (gs.player.isWalking) {
                const swing = Math.sin(elapsed * 12) * 0.48;
                this.lasseActor.leftLeg.rotation.x = swing;
                this.lasseActor.rightLeg.rotation.x = -swing;
                this.lasseActor.leftArm.rotation.x = -swing * 0.7;
                this.lasseActor.rightArm.rotation.x = swing * 0.7;

                if (this.lasseActor.leftLeg.userData.kneeJoint) {
                    this.lasseActor.leftLeg.userData.kneeJoint.rotation.x = Math.max(0, -swing * 1.15);
                    this.lasseActor.rightLeg.userData.kneeJoint.rotation.x = Math.max(0, swing * 1.15);
                }

                this.lasseActor.group.position.y = Math.abs(Math.cos(elapsed * 12)) * 0.045;
            } else {
                this.lasseActor.leftLeg.rotation.x *= 0.8;
                this.lasseActor.rightLeg.rotation.x *= 0.8;
                this.lasseActor.leftArm.rotation.x *= 0.8;
                this.lasseActor.rightArm.rotation.x *= 0.8;
                if (this.lasseActor.leftLeg.userData.kneeJoint) {
                    this.lasseActor.leftLeg.userData.kneeJoint.rotation.x *= 0.8;
                    this.lasseActor.rightLeg.userData.kneeJoint.rotation.x *= 0.8;
                }
            }

            this._animateActorLife(this.lasseActor, this.connyActor, gs.player.isTalking, gs.player.isWalking, elapsed);
        }

        if (this.connyActor && gs) {
            this.connyActor.group.visible = true;
            const cPos = this.screenToWorld(gs.companion.x, gs.companion.y);
            this.connyActor.group.position.copy(cPos);
            this.connyActor.group.rotation.y = gs.companion.direction === 'left' ? -0.45 : 0.45;
            this._animateActorLife(this.connyActor, this.lasseActor, gs.companion.isTalking, false, elapsed);
        }

        this.renderer.setViewport(0, 264, 1280, 760);
        this.renderer.setScissor(0, 264, 1280, 760);
        this.renderer.setScissorTest(true);
        this.renderer.render(this.scene, this.camera);
    },

    _makeTiledTexture(canvas, repeatX, repeatY) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        if (THREE.sRGBEncoding !== undefined) {
            tex.encoding = THREE.sRGBEncoding;
        }
        if (this.renderer && this.renderer.capabilities) {
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        }
        return tex;
    },

    _generateProceduralTextures() {
        const woodCanvas = document.createElement('canvas');
        woodCanvas.width = 1024;
        woodCanvas.height = 1024;
        const wCtx = woodCanvas.getContext('2d');
        wCtx.fillStyle = '#7c4a25';
        wCtx.fillRect(0, 0, 1024, 1024);
        const plankTones = ['#7a4722', '#875129', '#6e3f1d', '#8f582e', '#734320'];
        for (let row = 0; row < 32; row++) {
            const offset = (row % 2) * 128;
            for (let col = -1; col < 5; col++) {
                const px = col * 256 + offset;
                const py = row * 32;
                wCtx.fillStyle = plankTones[(row * 3 + col + 10) % plankTones.length];
                wCtx.fillRect(px + 1, py + 1, 254, 30);
                wCtx.fillStyle = 'rgba(40, 18, 5, 0.14)';
                for (let g = 4; g < 28; g += 6) {
                    wCtx.fillRect(px + 6, py + g, 242, 1.5);
                }
                wCtx.strokeStyle = 'rgba(30, 12, 3, 0.45)';
                wCtx.lineWidth = 1.5;
                wCtx.strokeRect(px, py, 256, 32);
            }
        }
        this.proceduralTextures.wood = this._makeTiledTexture(woodCanvas, 14, 6);

        const bersaC = document.createElement('canvas');
        bersaC.width = 256;
        bersaC.height = 256;
        const bCtx = bersaC.getContext('2d');
        bCtx.fillStyle = '#f4f1e8';
        bCtx.fillRect(0, 0, 256, 256);
        for (let col = 32; col < 256; col += 64) {
            bCtx.strokeStyle = '#1f381e';
            bCtx.lineWidth = 2.5;
            bCtx.beginPath();
            bCtx.moveTo(col, 0); bCtx.lineTo(col, 256);
            bCtx.stroke();

            for (let row = 20; row < 256; row += 42) {
                [-16, 16].forEach(dx => {
                    bCtx.fillStyle = '#2e7d26';
                    bCtx.beginPath();
                    bCtx.ellipse(col + dx, row, 13, 9, dx < 0 ? -0.25 : 0.25, 0, Math.PI * 2);
                    bCtx.fill();
                    bCtx.strokeStyle = '#132612';
                    bCtx.lineWidth = 1.5;
                    bCtx.beginPath();
                    bCtx.moveTo(col, row);
                    bCtx.lineTo(col + dx * 1.5, row);
                    bCtx.stroke();
                });
            }
        }
        this.proceduralTextures.wp_bersa = this._makeTiledTexture(bersaC, 12, 4);

        const hostC = document.createElement('canvas');
        hostC.width = 256;
        hostC.height = 256;
        const hCtx = hostC.getContext('2d');
        hCtx.fillStyle = '#ece2c8';
        hCtx.fillRect(0, 0, 256, 256);
        for (let y = 24; y < 256; y += 52) {
            for (let x = 24; x < 256; x += 52) {
                const rot = ((x + y) % 3 - 1) * 0.65;
                hCtx.save();
                hCtx.translate(x + (y % 2) * 14, y);
                hCtx.rotate(rot);
                hCtx.fillStyle = '#f4ebd4';
                hCtx.strokeStyle = '#1e1c1a';
                hCtx.lineWidth = 2.2;
                hCtx.beginPath();
                hCtx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
                hCtx.fill();
                hCtx.stroke();
                hCtx.beginPath();
                hCtx.moveTo(-22, 0); hCtx.lineTo(22, 0);
                for (let vx = -14; vx <= 14; vx += 7) {
                    hCtx.moveTo(vx, 0); hCtx.lineTo(vx + 5, -11);
                    hCtx.moveTo(vx, 0); hCtx.lineTo(vx + 5, 11);
                }
                hCtx.stroke();
                hCtx.restore();
            }
        }
        this.proceduralTextures.wp_host693 = this._makeTiledTexture(hostC, 10, 4);
        this.proceduralTextures.wallpaper1961 = this.proceduralTextures.wp_host693;

        const nervC = document.createElement('canvas');
        nervC.width = 256;
        nervC.height = 256;
        const nCtx = nervC.getContext('2d');
        nCtx.fillStyle = '#f5f5f0';
        nCtx.fillRect(0, 0, 256, 256);
        for (let y = 32; y < 256; y += 64) {
            for (let x = 32; x < 256; x += 64) {
                nCtx.save();
                nCtx.translate(x + (Math.floor(y / 64) % 2) * 24, y);
                nCtx.fillStyle = 'rgba(62, 118, 68, 0.62)';
                nCtx.beginPath();
                nCtx.arc(0, 0, 14, 0, Math.PI * 2);
                nCtx.fill();
                nCtx.strokeStyle = '#222622';
                nCtx.lineWidth = 1.4;
                nCtx.beginPath();
                nCtx.arc(0, 0, 24, 0, Math.PI * 2);
                for (let a = 0; a < Math.PI * 2; a += 0.35) {
                    nCtx.moveTo(0, 0);
                    nCtx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
                }
                nCtx.stroke();
                nCtx.restore();
            }
        }
        this.proceduralTextures.wp_nervblad = this._makeTiledTexture(nervC, 10, 4);

        const medC = document.createElement('canvas');
        medC.width = 256;
        medC.height = 256;
        const mCtx = medC.getContext('2d');
        mCtx.fillStyle = '#c8d6c9';
        mCtx.fillRect(0, 0, 256, 256);
        for (let y = 32; y < 256; y += 64) {
            for (let x = 32; x < 256; x += 64) {
                mCtx.fillStyle = '#82a087';
                mCtx.beginPath();
                mCtx.arc(x, y, 26, 0, Math.PI * 2);
                mCtx.fill();
                mCtx.strokeStyle = '#e8f0e9';
                mCtx.lineWidth = 2.2;
                mCtx.beginPath();
                mCtx.arc(x, y, 16, 0, Math.PI * 2);
                mCtx.stroke();
            }
        }
        this.proceduralTextures.wp_medaljong = this._makeTiledTexture(medC, 11, 4);

        const dropC = document.createElement('canvas');
        dropC.width = 256;
        dropC.height = 256;
        const dCtx = dropC.getContext('2d');
        dCtx.fillStyle = '#8c9270';
        dCtx.fillRect(0, 0, 256, 256);
        const dotColors = ['#faf6eb', '#3b4229', '#dfb668'];
        for (let colIdx = 0, x = 20; x < 256; x += 32, colIdx++) {
            dCtx.strokeStyle = 'rgba(35, 40, 25, 0.65)';
            dCtx.lineWidth = 1.6;
            dCtx.beginPath();
            dCtx.moveTo(x, 0); dCtx.lineTo(x, 256);
            dCtx.stroke();

            for (let rowIdx = 0, y = 24; y < 256; y += 48, rowIdx++) {
                const offset = (colIdx % 2) * 20;
                const colorIndex = Math.floor(colIdx + rowIdx) % dotColors.length;
                dCtx.fillStyle = dotColors[colorIndex];
                dCtx.beginPath();
                dCtx.arc(x, (y + offset) % 248, (colIdx % 2 === 0) ? 10 : 6, 0, Math.PI * 2);
                dCtx.fill();
            }
        }
        this.proceduralTextures.wp_droppar = this._makeTiledTexture(dropC, 10, 3);

        const flwC = document.createElement('canvas');
        flwC.width = 256;
        flwC.height = 256;
        const flCtx = flwC.getContext('2d');
        flCtx.fillStyle = '#5c4338';
        flCtx.fillRect(0, 0, 256, 256);
        const petalCols = ['#ffffff', '#e6c229', '#d64527', '#e07a2b'];
        for (let y = 32; y < 256; y += 64) {
            for (let x = 32; x < 256; x += 64) {
                const pCol = petalCols[Math.floor((x + y) / 64) % petalCols.length];
                flCtx.fillStyle = pCol;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
                    flCtx.beginPath();
                    flCtx.ellipse(x + Math.cos(a) * 14, y + Math.sin(a) * 14, 9, 5, a, 0, Math.PI * 2);
                    flCtx.fill();
                }
                flCtx.fillStyle = '#d9a726';
                flCtx.beginPath();
                flCtx.arc(x, y, 7, 0, Math.PI * 2);
                flCtx.fill();
            }
        }
        this.proceduralTextures.wp_blom_brun = this._makeTiledTexture(flwC, 9, 3);

        const tkC = document.createElement('canvas');
        tkC.width = 256;
        tkC.height = 256;
        const tkCtx = tkC.getContext('2d');
        tkCtx.fillStyle = '#ffcb00';
        tkCtx.beginPath(); tkCtx.arc(128, 128, 124, 0, Math.PI * 2); tkCtx.fill();
        tkCtx.fillStyle = '#005293';
        tkCtx.beginPath(); tkCtx.arc(128, 128, 108, 0, Math.PI * 2); tkCtx.fill();
        tkCtx.fillStyle = '#ffcb00';
        [[84, 96], [172, 96], [128, 168]].forEach(([cx, cy]) => {
            tkCtx.beginPath();
            tkCtx.moveTo(cx - 24, cy + 14);
            tkCtx.lineTo(cx - 28, cy - 12);
            tkCtx.lineTo(cx - 10, cy + 2);
            tkCtx.lineTo(cx, cy - 16);
            tkCtx.lineTo(cx + 10, cy + 2);
            tkCtx.lineTo(cx + 28, cy - 12);
            tkCtx.lineTo(cx + 24, cy + 14);
            tkCtx.closePath();
            tkCtx.fill();
        });
        this.proceduralTextures.treKronor = new THREE.CanvasTexture(tkC);

        const skinC = document.createElement('canvas');
        skinC.width = 256;
        skinC.height = 256;
        const sCtx = skinC.getContext('2d');
        sCtx.fillStyle = '#d8dee6';
        sCtx.fillRect(0, 0, 256, 256);
        sCtx.strokeStyle = 'rgba(40, 50, 60, 0.45)';
        sCtx.lineWidth = 2;
        for (let i = 0; i < 256; i += 64) {
            sCtx.strokeRect(i, 0, 64, 128);
            sCtx.strokeRect(0, i, 256, 64);
        }
        this.proceduralTextures.aircraftSkin = this._makeTiledTexture(skinC, 4, 4);

        const rugCanvas = document.createElement('canvas');
        rugCanvas.width = 512;
        rugCanvas.height = 256;
        const rCtx = rugCanvas.getContext('2d');
        rCtx.fillStyle = '#8c261b';
        rCtx.fillRect(0, 0, 512, 256);
        rCtx.strokeStyle = '#e6d7b8';
        rCtx.lineWidth = 8;
        rCtx.strokeRect(16, 16, 480, 224);
        for (let x = 48; x < 460; x += 64) {
            rCtx.fillStyle = '#d99b38';
            rCtx.beginPath();
            rCtx.moveTo(x + 24, 48); rCtx.lineTo(x + 48, 128); rCtx.lineTo(x + 24, 208); rCtx.lineTo(x, 128);
            rCtx.closePath();
            rCtx.fill();
        }
        this.proceduralTextures.rug1961 = this._makeTiledTexture(rugCanvas, 1, 1);

        const fabCanvas = document.createElement('canvas');
        fabCanvas.width = 128;
        fabCanvas.height = 128;
        const fCtx = fabCanvas.getContext('2d');
        fCtx.fillStyle = '#cccccc';
        fCtx.fillRect(0, 0, 128, 128);
        for (let y = 0; y < 128; y += 2) {
            for (let x = 0; x < 128; x += 2) {
                fCtx.fillStyle = (x + y) % 4 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)';
                fCtx.fillRect(x, y, 2, 2);
            }
        }
        this.proceduralTextures.fabric = this._makeTiledTexture(fabCanvas, 6, 6);
    }
};