# Grafikförbättringar (Claude)

- **Färghantering** (`js/core/colorspace.js`): rätt sRGB-färger i three.js r128, inga urblekta färger.
- **Efterbehandling** (`js/core/postfx.js`): bloom, filmisk färgton (ACES), gradering per rum, vinjett, korn. Faller tillbaka till vanlig rendering om webbläsaren inte stöder WebGL2.
- **Nya karaktärer** (`js/core/characters.js`): Lasse, Conny, Mamma, Polisen och legosoldater med leder, andning, blinkningar, ögonrörelser och pratande mun.
- **Atmosfär** (`js/core/atmosphere.js`): golvtexturer, kontaktskuggor, damm, ljus per rum.
- **Badrummet** fick riktig inredning (kar, toalett, handfat, spegelskåp).
- **Prologen** (Katanga/Ndola) byggd om: himmel, dagbrott, koboltådror, legosoldater, djungel, eld och rök.
- Allt testat i mjukvaru-WebGL (headless), inte på riktigt grafikkort.
