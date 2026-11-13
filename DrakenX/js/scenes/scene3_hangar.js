/**
 * DRAKEN X — SCEN 3: BERGHANGAREN
 * Första spelbara prototypen. Alla nya tillstånd ligger i GameState.flags.
 * Ingen ändring i grafikmotorn krävs.
 */
window.Engine.registerScene('scene3_hangar', {
    revealTime: 0,
    lamps: [],
    jet: null,
    visitor: null,
    visitorTimer: 0,
    visitStarted: false,
    completed: false,

    init() {
        const R = window.Renderer, gs = window.GameState;
        R.clearScene(0x030811, 0.009, {
            exposure: 2.5, bloom: 0.78, bloomThreshold: 0.78,
            vignette: 0.55, saturation: 1.06,
            shadowTint: [0.64, 0.82, 1.20], highTint: [1.18, 1.10, 0.89]
        });
        gs.webgl.cameraMode = 'room_25d';
        gs.player.x = 150; gs.player.y = 650;
        gs.companion.x = 80; gs.companion.y = 625;
        this.revealTime = 0;
        this.visitorTimer = 0;
        this.visitStarted = false;
        this.completed = false;
        this.lamps = [];
        const room = R.roomGroup;
        const mat = (color, metalness = 0.1, roughness = 0.75) =>
            new THREE.MeshStandardMaterial({color, metalness, roughness});
        const block = (w,h,d,x,y,z,m,parent=room) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true;
            parent.add(mesh); return mesh;
        };
        const concrete = mat(0x232d39), dark = mat(0x111b27), steel = mat(0x7f99ad,0.85,0.28);
        block(32,0.35,19,0,-0.2,-3,concrete);
        block(32,15,0.6,0,7,-12,dark);
        block(0.6,15,19,-16,7,-3,concrete);
        block(0.6,15,19,16,7,-3,concrete);
        for (let x=-14; x<=14; x+=4) {
            block(0.32,13,0.5,x,6.5,-11.5,steel);
            block(0.4,0.4,18,x,12,-3,steel);
        }
        // Det mäktiga, öppna bergrummet: två rader lampor som vaknar i sekvens.
        for (let x=-12; x<=12; x+=4) {
            for (const z of [-8,2]) {
                const lamp = new THREE.PointLight(0xffe9b3,0,12,2);
                lamp.position.set(x,10.5,z); room.add(lamp); this.lamps.push(lamp);
                const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.75,0.22,16),
                    new THREE.MeshStandardMaterial({color:0xb9b8a4,emissive:0x554b2d,emissiveIntensity:0.3}));
                shade.position.copy(lamp.position); room.add(shade);
            }
        }
        const blue = new THREE.DirectionalLight(0x7fa8ef,1.6);
        blue.position.set(-5,10,8); room.add(blue);
        const edge = new THREE.DirectionalLight(0xffd89d,1.1);
        edge.position.set(8,12,-7); room.add(edge);

        // Stor dubbel-deltavingad 35X-siluett, uppbyggd i riktig 3D.
        this.jet = new THREE.Group();
        const titanium = mat(0x9baebc,0.88,0.24);
        const silver = mat(0xc6d5dc,0.85,0.22);
        const shadow = mat(0x273645,0.8,0.3);
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.7,1.05,13,24),titanium);
        fuselage.rotation.x = Math.PI/2; fuselage.position.set(0,2.35,-3.2); this.jet.add(fuselage);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.7,3.8,24),silver);
        nose.rotation.x = Math.PI/2; nose.position.set(0,2.35,5.1); this.jet.add(nose);
        const wingShape = new THREE.Shape();
        wingShape.moveTo(-0.7,3.5); wingShape.lineTo(-8,-2.2);
        wingShape.lineTo(-7.3,-4.2); wingShape.lineTo(-1,-2.8);
        wingShape.lineTo(1,-2.8); wingShape.lineTo(7.3,-4.2);
        wingShape.lineTo(8,-2.2); wingShape.lineTo(0.7,3.5); wingShape.closePath();
        const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape),silver);
        wing.rotation.x = -Math.PI/2; wing.position.set(0,2.15,-2.3);
        wing.material.side = THREE.DoubleSide; this.jet.add(wing);
        const fin = new THREE.Mesh(new THREE.ConeGeometry(1.45,3.4,3),titanium);
        fin.rotation.y = Math.PI/2; fin.position.set(0,4.0,-7.3); this.jet.add(fin);
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.85,20,12),
            new THREE.MeshStandardMaterial({color:0x162a44,metalness:0.55,roughness:0.12,transparent:true,opacity:0.85}));
        canopy.scale.set(1,0.65,2.1); canopy.position.set(0,3.02,0.8); this.jet.add(canopy);
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.85,0.4,24),shadow);
        exhaust.rotation.x=Math.PI/2; exhaust.position.set(0,2.35,-9.85); this.jet.add(exhaust);
        for(const x of [-2.5,2.5]) {
            const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.46,0.18,10,20),shadow);
            wheel.position.set(x,0.75,-2); wheel.rotation.y=Math.PI/2; this.jet.add(wheel);
            block(0.12,1.25,0.12,x,1.45,-2,steel,this.jet);
        }
        this.jet.position.set(0,0,-2);
        this.jet.rotation.y = -0.12;
        room.add(this.jet);

        // Arbetspunkter: verktyg, bränslepump, panel och cockpit.
        const crate = block(1.9,0.9,1.2,-9,0.5,2,mat(0x66533b));
        const toolbox = block(1.15,0.45,0.7,-9,1.15,2,mat(0xb34b29,0.55));
        const pump = block(1.1,2.2,1.0,9,1.1,0,mat(0x596a66,0.55));
        const panel = block(1.3,1.6,0.5,6,0.9,-5,mat(0x596577,0.65));
        const hiding = block(2.3,2.1,1.7,-12,1.05,-6,mat(0x39434c));
        const hatch = block(1.2,0.22,1.2,0,2.9,0.6,shadow,this.jet);
        const exit = block(2.8,3.6,0.4,13,1.8,-10,mat(0x39434c));
        const interactive = (mesh,id,name,x) => R.registerInteractive(mesh,{
            id,name,walkX:x,walkY:625,lookAt:'front'
        });
        interactive(toolbox,'hangar_tools','Verktygslåda med momentnyckel',230);
        interactive(pump,'hangar_fuel','Bränsleaggregat och slang',1060);
        interactive(panel,'hangar_panel','Servicepanel för flygplanets hydraulik',930);
        interactive(hiding,'hangar_hide','Skuggig förrådsnisch',120);
        interactive(hatch,'hangar_cockpit','J 35X Tors Vrede — cockpit',645);
        interactive(exit,'hangar_exit','Servicedörr mot korridoren',1180);
        const figure = R.createCharacterMesh('pappa',{
            jacketColor:0x48586a,shirtColor:0xc6c2b2,pantsColor:0x30363e,hairColor:0x999999
        });
        this.visitor=figure.group; this.visitor.position.set(8,0,-6); this.visitor.visible=false;
        R.actorsGroup.add(this.visitor);
        R.spawnMainActors(true);
    },

    onEnter() {
        const gs=window.GameState;
        if(gs.getFlag('hangarIntroPlayed')) return;
        gs.setFlag('hangarIntroPlayed');
        window.VoiceEngine.speakSequence([
            {speaker:'lasse',text:'Conny... är det där verkligen ett flygplan?'},
            {speaker:'conny',text:'Nä, Lasse. Det är en katedral som har fått vingar. Herregud, titta på henne!'},
            {speaker:'lasse',text:'J trettiofem X. Tors Vrede. Och vi tänker flyga hela vägen till Afrika med den där.'},
            {speaker:'conny',text:'Om vi får loss servicelåsen och får igång maskineriet först. Det står ju verktyg överallt!'}
        ]);
    },

    update(dt,timestamp) {
        this.revealTime += dt;
        // Strålkastarna tänds i vågor. Långsam ljussättning gör avslöjandet filmiskt.
        this.lamps.forEach((lamp,i)=>{
            const phase=Math.max(0,Math.min(1,(this.revealTime-i*0.17)/1.15));
            lamp.intensity=phase*1.9;
        });
        if(this.jet) this.jet.position.y=Math.sin(timestamp*0.00045)*0.012;
        if(this.visitStarted && !this.completed) {
            this.visitorTimer+=dt;
            if(this.visitorTimer>5 && this.visitor) this.visitor.visible=true;
        }
    },

    onInteract(id,verb) {
        const gs=window.GameState,V=window.VoiceEngine;
        const say=(speaker,text)=>V.speak(speaker,text);
        if(id==='hangar_tools'){
            if(!gs.getFlag('hangarToolsFound')){
                gs.setFlag('hangarToolsFound');
                say('conny','En momentnyckel! Och en servicelapp: säkra hydrauliken innan start. Jag visste att min praktik på cykelverkstan skulle komma till nytta!');
            } else say('lasse','Vi har redan verktygen. Conny ser farligt självsäker ut.');
            return true;
        }
        if(id==='hangar_panel'){
            if(!gs.getFlag('hangarToolsFound')){
                say('lasse','Panelen är lös. Vi behöver nog en ordentlig nyckel, inte Connys fickkniv.');
            } else if(!gs.getFlag('hangarHydraulicsFixed')){
                gs.setFlag('hangarHydraulicsFixed');
                say('conny','Så! Servicepanelen sitter. Hydrauliken är säkrad. Det här är nästan som att skruva på en Crescent, fast med dödligare konsekvenser.');
            } else say('lasse','Hydrauliken är redan klar.');
            return true;
        }
        if(id==='hangar_fuel'){
            if(!gs.getFlag('hangarHydraulicsFixed')){
                say('lasse','Vi ska nog inte röra bränslet innan hydrauliken är säkrad.');
            } else if(!gs.getFlag('hangarFuelReady')){
                gs.setFlag('hangarFuelReady');
                say('conny','Bränsleaggregatet är klart! Om någon frågar är vi två väldigt kortväxta flygtekniker.');
                if(!this.visitStarted && !gs.getFlag('hangarVisitorHandled')){
                    this.visitStarted=true;this.visitorTimer=0;
                    V.speakSequence([
                        {speaker:'lasse',text:'Vänta. Hör du? Någon kommer genom korridoren!'},
                        {speaker:'conny',text:'In bakom förrådsskåpet! Nu!'}
                    ]);
                }
            } else say('lasse','Bränslet är klart.');
            return true;
        }
        if(id==='hangar_hide'){
            if(this.visitStarted && !gs.getFlag('hangarVisitorHandled')){
                gs.setFlag('hangarVisitorHandled');
                this.completed=true;
                if(this.visitor) this.visitor.visible=false;
                V.speakSequence([
                    {speaker:'pappa',text:'Var tusan lade jag ritningarna? Jaha. Här är de. Och varför luktar det messmör i bergrummet?'},
                    {speaker:'conny',text:'Viska, Lasse! Han gick. Jag tror inte han såg oss.'},
                    {speaker:'lasse',text:'Då har vi inte många minuter på oss. Till cockpit!'}
                ]);
            } else say('lasse','En mörk nisch. Bra gömställe, om någon kommer.');
            return true;
        }
        if(id==='hangar_cockpit'){
            if(!gs.getFlag('hangarHydraulicsFixed')||!gs.getFlag('hangarFuelReady')){
                say('lasse','Tors Vrede är inte startklar. Vi måste göra klart servicen först.');
            } else if(this.visitStarted&&!gs.getFlag('hangarVisitorHandled')){
                say('conny','Vi kan inte klättra in när en ingenjör står här och letar efter sina papper! Göm dig!');
            } else if(!gs.hasItem('messing_nyckel')){
                say('lasse','Vi saknar mässingsnyckeln till prototypen!');
            } else {
                gs.setFlag('hangarReadyForTakeoff');
                V.speakSequence([
                    {speaker:'lasse',text:'Conny. Vi sitter faktiskt i Tors Vrede.'},
                    {speaker:'conny',text:'Då får du väl hitta startknappen. Och om det finns en knapp märkt Katanga, tryck på den.'},
                    {speaker:'lasse',text:'Först behöver vi lära oss hur man flyger henne. Fortsättning följer!'}
                ]);
            }
            return true;
        }
        if(id==='hangar_exit'){
            say('conny','Tillbaka ut? Efter att vi hittat Sveriges hemligaste flygplan? Inte en chans!');
            return true;
        }
        return false;
    }
});
