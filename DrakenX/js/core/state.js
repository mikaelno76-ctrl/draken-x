/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - GLOBAL GAMESTATE & INVENTORY (state.js)
 * Komplett med Prolog-start (scene0_intro), Lerhjärtat från lekskolan,
 * Märklin-tågbaneflaggor samt Filmrullen & Skamfotot på Bulten från Mörkrummet!
 * ============================================================================
 */

window.GameState = {
    currentScene: 'scene0_intro',

    settings: {
        voiceEnabled: true,
        sfxEnabled: true,
        filmFilter: true
    },

    webgl: {
        cameraMode: 'room_25d', // 'room_25d' | 'cockpit_3d' | 'cutscene_3d'
        dayTime: 'evening_1961',
        afterburnerActive: false,
        smokeTrailActive: false,
        cameraShake: 0.0
    },

    player: {
        name: 'Lasse',
        x: 520,
        y: 620,
        z: 0,
        targetX: 520,
        targetY: 620,
        speed: 4.6,
        direction: 'right',
        isWalking: false,
        isTalking: false,
        walkCallback: null
    },

    companion: {
        name: 'Conny',
        x: 760,
        y: 595,
        z: -15,
        direction: 'left',
        isTalking: false,
        visible: true
    },

    interaction: {
        currentVerb: 'GÅ TILL',
        selectedItem: null,
        hoveredObject: null,
        sentenceText: 'Gå till',
        inDialogue: false,
        activeDialogueTree: null
    },

    subtitle: {
        active: false,
        speaker: '',
        text: '',
        color: '#ffffff',
        timer: 0
    },

    // ========================================================================
    // INVENTARIUM & FÖREMÅLSKATALOG
    // ========================================================================
    inventory: [],

    itemCatalog: {
        'messing_nyckel': {
            id: 'messing_nyckel',
            name: 'Mässingsnyckel ("Tors Vrede")',
            description: 'En tung mässingsbricka med texten "Draken X – Tors Vrede". Nyckeln till SAAB:s hemligaste överljudsprototyp.',
            icon: 'key_brass'
        },
        'skogaholms_messmor': {
            id: 'skogaholms_messmor',
            name: 'Messmörsmacka',
            description: 'En tjock skiva Skogaholmslimpa med ett rejält lager fjällbrynt messmör. Connys mage mullrar bara han ser den.',
            icon: 'sandwich_messmor'
        },
        'skolatlas_1954': {
            id: 'skolatlas_1954',
            name: 'Skolatlas 1954',
            description: 'Folkskolans Stora Världsatlas (1954 års upplaga) med intorkade smörfläckar. Visar vägen ner till Katanga.',
            icon: 'atlas_1954'
        },
        'betyg_engelska': {
            id: 'betyg_engelska',
            name: 'Engelskabetyg (Ba+)',
            description: 'Lasses vårterminsbetyg från magister Karlsson med en stark trea i engelska. Oumbärligt för utrikesdiplomati.',
            icon: 'report_card'
        },
        'pilsner_tom': {
            id: 'pilsner_tom',
            name: 'Pilsnerflaska',
            description: 'En klirrande brun pilsnerflaska från Lasses slitna läderväska.',
            icon: 'bottle_pilsner'
        },
        'lerhjarta_dagis': {
            id: 'lerhjarta_dagis',
            name: 'Skevt lerhjärta',
            description: 'Ett kantstött, rödglaserat hjärta i bränd lera som Lasse gjorde på lekskolan som femåring. Tant Karin hade sparat det i köket.',
            icon: 'clay_heart'
        },
        'bulten_negativ': {
            id: 'bulten_negativ',
            name: 'Oframkallad filmrulle',
            description: 'En 35mm svartvit filmrulle som Conny gömt i morsans sybord. Måste framkallas i Mörkrummet i källaren!',
            icon: 'film_roll'
        },
        'bulten_skamfoto': {
            id: 'bulten_skamfoto',
            name: 'Skamfoto på Bulten',
            description: 'Nyframkallat svartvitt foto från mörkrummet: Raggarkungen Bulten i blommigt förkläde med saftglas och sugrör. Ultimat hållhake!',
            icon: 'photo_bulten'
        },
        'tito_champagne': {
            id: 'tito_champagne',
            name: 'Jugoslaviskt bubbelvin',
            description: 'En exklusiv flaska statsbankett-champagne med guldetikett från marskalk Titos bord i Belgrad.',
            icon: 'champagne_tito'
        },
        'selassie_amulett': {
            id: 'selassie_amulett',
            name: 'Etiopisk lejonamulett',
            description: 'En gyllene amulett med Juda lejon som Lasse fick av den etiopiska prinsessan vid palatsfontänen i Addis Abeba.',
            icon: 'amulet_lion'
        }
    },

    // ========================================================================
    // STORY-FLAGGOR FÖR HELA VILLAN & SAAB
    // ========================================================================
    flags: {
        // Pojkrummet & Uppstarten
        boyroomStartIntro: false,
        playedShadowsRecord: false,
        talkedGirlsAndFootball: false,
        dadCameHome: false,

        // Hallen, Radion, Mellanölen & Badrummet
        villaIntroPlayed: false,
        listenedToRadio: false,
        checkedCellarDoor: false,
        drankNerveBeer: false,
        needsBathroom: false,
        bathroomClueFound: false,

        // Köksuppdraget med Connys mamma & Lerhjärtat
        helpedMomInKitchen: false,
        receivedClayHeart: false,

        // Källaren: Märklin-tågbanan & Mörkrummet
        trainRunning: false,
        trainOverdrive: false,
        developedBultenPhoto: false,

        // Möbler & Flerstegspussel för Bultens nummer
        readFacitClue: false,
        foundCadoKey: false,
        foundBultenNumber: false,
        tookKeyAndSandwich: false,
        openedSchoolBag: false,
        connyAgreedToFly: false,
        calledBulten: false,

        // Scen 2: SAAB-grinden
        gateIntroPlayed: false,
        talkedToGrumpyCops: false,
        bultenTriggered: false,
        fenceUnlocked: false
    },

    hasItem(itemId) {
        return this.inventory.includes(itemId);
    },

    addItem(itemId) {
        if (this.itemCatalog[itemId] && !this.hasItem(itemId)) {
            this.inventory.push(itemId);
            if (window.AudioEngine) window.AudioEngine.playSFX('pickup');
            return true;
        }
        return false;
    },

    removeItem(itemId) {
        const idx = this.inventory.indexOf(itemId);
        if (idx !== -1) {
            this.inventory.splice(idx, 1);
            if (this.interaction.selectedItem === itemId) {
                this.interaction.selectedItem = null;
            }
            return true;
        }
        return false;
    },

    setFlag(flagName, value = true) {
        this.flags[flagName] = value;
    },

    getFlag(flagName) {
        return !!this.flags[flagName];
    },

    resetVerb() {
        this.interaction.currentVerb = 'GÅ TILL';
        this.interaction.selectedItem = null;
        this.updateSentenceBar();
    },

    updateSentenceBar() {
        const verb = this.interaction.currentVerb;
        const item = this.interaction.selectedItem ? this.itemCatalog[this.interaction.selectedItem].name : null;
        const hover = this.interaction.hoveredObject ? this.interaction.hoveredObject.name : null;

        if (verb === 'ANVÄND' && item) {
            this.interaction.sentenceText = hover ? `Använd ${item} med ${hover}` : `Använd ${item} med ...`;
        } else {
            this.interaction.sentenceText = hover ? `${verb} ${hover}` : `${verb}`;
        }
    }
};