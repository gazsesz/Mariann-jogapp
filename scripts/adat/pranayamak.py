import json, sys
CH2EL = {1: 'fold', 2: 'viz', 3: 'tuz', 4: 'levego', 5: 'eter'}

CATS = [
 {"id": "alapozo", "name": "Alapozó légzések", "description": "A légzés tudatosítása és a teljes légzőtér használata; minden további pránájáma alapja, bármely óra elejére."},
 {"id": "kiegyensulyozo", "name": "Kiegyensúlyozó légzések", "description": "A be- és kilégzés, a jobb és bal oldal, a napi és holdi energia egyensúlyát teremtik meg."},
 {"id": "nyugtato", "name": "Nyugtató légzések", "description": "A paraszimpatikus idegrendszert aktiválják: lassítanak, ellazítanak, segítik az alvást és a meditációt."},
 {"id": "husito", "name": "Hűsítő légzések", "description": "Hűtik a testet és a kedélyt; meleg időben, erős gyakorlás után, ingerlékenység esetén."},
 {"id": "elenkito", "name": "Élénkítő és tisztító légzések", "description": "Melegítenek, energizálnak, tisztítják a légutakat. Üres gyomorral, nappal gyakorolandók."},
 {"id": "kumbhaka", "name": "Légzésvisszatartások (kumbhaka)", "description": "A be- vagy kilégzés utáni tudatos szünet. Csak megalapozott légzéstechnika után, fokozatosan."},
]

# id, szanszkrit, magyar, angol, kategória, szint, ritmus, lépések, hatás, óvatosság, elsődleges csakra, másodlagos, hatásterületek, ajánlott idő
P = [
 ("legzesmegfigyeles","Śvāsa darśana","A légzés megfigyelése","Breath awareness","alapozo",1,"természetes ritmus",
  ["Ülj vagy feküdj kényelmesen, csukd be a szemed.","Ne változtass a légzéseden, csak figyeld: hol érzed, milyen hosszú a be- és kilégzés, hol vannak szünetek."],
  "Megérkezést, jelenlétet ad; az óra eleji ráhangolódás legegyszerűbb módja.",
  "Nincs különösebb ellenjavallat.",4,[6],["elme","tudo"],"2–5 perc"),
 ("hasi-legzes","Adhama prāṇāyāma","Hasi (rekeszizom-) légzés","Abdominal breathing","alapozo",1,"lassú, 4–6 mp be, 4–6 mp ki",
  ["Feküdj hanyatt, egyik kezed a hasadon, másik a mellkasodon.","Belégzésnél a has emelkedik, a mellkas alig mozdul; kilégzésnél a has lassan visszasüllyed."],
  "Lassítja a pulzust, aktiválja a rekeszizmot és a paraszimpatikus idegrendszert, segíti az emésztést.",
  "Nincs különösebb ellenjavallat.",2,[3],["tudo","emesztes","alvas"],"3–5 perc"),
 ("teljes-joga-legzes","Dīrgha prāṇāyāma","Teljes jógalégzés (háromrészes légzés)","Three-part breath","alapozo",1,"lassú, hullámszerű",
  ["Belégzésnél töltsd meg sorban a hasat, a bordakosarat, majd a felső mellkast.","Kilégzésnél fordított sorrendben engedd ki: felső mellkas, bordák, has."],
  "A teljes tüdőkapacitás használatát tanítja, nyugtat és energizál egyszerre; a pránájáma alapja.",
  "Szédülés esetén lassíts, és térj vissza a természetes légzéshez.",4,[2,3],["tudo","sziv","elme"],"5 perc"),
 ("ujjayi","Ujjāyī prāṇāyāma","Győzedelmes légzés","Victorious breath","alapozo",1,"lassú, egyenletes, hallható",
  ["Orron át lélegezz, a gégét enyhén szűkítsd, mintha suttognál.","A légzés halk, tengerzúgás-szerű hangot ad; be- és kilégzés egyenlő hosszú."],
  "Fókuszt ad, melegít, összeköti a mozgást a légzéssel; vinyásza és ászanagyakorlás kísérője.",
  "Ne szorítsd a torkot; alacsony vérnyomásnál a fekvő változat ajánlott.",5,[4],["tudo","elme","allokepesseg"],"az egész gyakorlás alatt"),
 ("sama-vritti","Sama vṛtti","Egyenlő légzés","Equal breathing","kiegyensulyozo",1,"1:1, pl. 4 mp be, 4 mp ki",
  ["Számolj belégzésre 4-ig, kilégzésre 4-ig, orron át.","Ha könnyen megy, növeld 5–6-ra, de a légzés maradjon erőlködésmentes."],
  "Kiegyensúlyozza az idegrendszert, összeszedettséget és nyugalmat ad.",
  "Nincs különösebb ellenjavallat.",4,[6],["elme","sziv"],"3–5 perc"),
 ("koherens-legzes","Sama vṛtti (koherens ritmus)","Koherens légzés","Coherent breathing","kiegyensulyozo",1,"kb. 5,5 mp be, 5,5 mp ki (5–6 légzés/perc)",
  ["Lélegezz be kb. 5–6 másodpercig, majd ki ugyanannyi ideig, orron át, szünet nélkül.","Tarts ki 5–10 percig, lágy, hasi légzéssel."],
  "A szívritmus-variabilitás javításával összehangolja a szívet és a légzést, csökkenti a stresszt.",
  "Nincs különösebb ellenjavallat.",4,[],["sziv","elme","alvas"],"5–10 perc"),
 ("nadi-shodhana","Nāḍī śodhana","Váltott orrlyukú légzés","Alternate nostril breathing","kiegyensulyozo",1,"1:1, majd 1:2",
  ["Jobb kézzel visnu mudrában (mutató- és középső ujj behajlítva) zárd a jobb orrlyukat, lélegezz be balon.","Zárd a balt, lélegezz ki jobbon; lélegezz be jobbon, zárd, ki balon. Ez egy kör."],
  "Megtisztítja az energiacsatornákat, összehangolja a két agyféltekét, mélyen nyugtat és összpontosít.",
  "Eldugult orrnál várj vele, vagy gyakorold képzeletben.",6,[4],["elme","tudo","alvas"],"5–10 kör"),
 ("anuloma-viloma","Anuloma viloma","Váltott orrlyukú légzés visszatartással","Alternate nostril breathing with retention","kiegyensulyozo",2,"1:4:2 (pl. 4 be, 16 bent, 8 ki)",
  ["A nádí sódhana menetében, a belégzés után mindkét orrlyukat zárd, és tartsd bent a levegőt.","Kezdd 1:2:2 aránnyal, és csak fokozatosan növeld."],
  "Mélyíti a nádí sódhana hatását, növeli a koncentrációt és a légzés feletti uralmat.",
  "Magas vérnyomásnál, szívbetegségnél, várandósság alatt visszatartás nélkül végezd.",6,[7],["elme","tudo"],"5–10 kör"),
 ("surya-bhedana","Sūrya bhedana","Napcsatornás légzés","Right nostril breathing","elenkito",2,"jobbon be, balon ki",
  ["Zárd a bal orrlyukat, lélegezz be a jobbon.","Zárd a jobbat, lélegezz ki a balon. Ismételd."],
  "A napcsatornát (pingala) aktiválja: melegít, élénkít, javítja az éberséget és az emésztést.",
  "Magas vérnyomásnál, szívbetegségnél, szorongásnál, este kerüld.",3,[],["emesztes","allokepesseg"],"5–10 kör"),
 ("chandra-bhedana","Candra bhedana","Holdcsatornás légzés","Left nostril breathing","nyugtato",2,"balon be, jobbon ki",
  ["Zárd a jobb orrlyukat, lélegezz be a balon.","Zárd a balt, lélegezz ki a jobbon. Ismételd."],
  "A holdcsatornát (ida) aktiválja: hűsít, nyugtat, segíti az elalvást.",
  "Alacsony vérnyomásnál, levertségnél, megfázáskor kerüld.",2,[6],["alvas","elme"],"5–10 kör"),
 ("visama-vritti","Viṣama vṛtti","Hosszabbított kilégzés","Extended exhalation","nyugtato",1,"1:2, pl. 4 mp be, 8 mp ki",
  ["Lélegezz be orron 4-ig, majd ki lassan 6–8-ig.","Ha szükséges, kezdd 4:6 aránnyal."],
  "A hosszú kilégzés a paraszimpatikus idegrendszert aktiválja: lassít, ellazít, segíti az alvást.",
  "Ha levegőhiányt érzel, rövidítsd a kilégzést.",4,[2],["alvas","elme","sziv"],"3–5 perc"),
 ("bhramari","Bhrāmarī","Méhecske-légzés","Humming bee breath","nyugtato",1,"normál belégzés, hosszú zümmögő kilégzés",
  ["Ülj egyenesen, a hüvelykujjakkal zárd a fülkagylót (vagy sanmukhí mudrában).","Lélegezz be orron, kilégzéskor zümmögj halkan, csukott szájjal. A rezgést figyeld a fejben."],
  "Gyorsan oldja a feszültséget, a dühöt és a szorongást, nyugtatja az idegrendszert, segíti az alvást.",
  "Fülgyulladásnál kerüld; fekve ne gyakorold.",5,[6],["elme","alvas"],"5–10 kör"),
 ("udgitha","Udgītha (Praṇava)","Óm-légzés","Om chanting breath","nyugtato",1,"normál belégzés, hosszú kilégzés A–U–M hanggal",
  ["Lélegezz be mélyen, kilégzéskor énekeld: A – U – M, a hang a hastól a mellkason át a fejig vándorol.","A végén figyeld a csendet."],
  "Rezgésével nyugtat, egységérzést és összeszedettséget ad; az óra eleje vagy vége.",
  "Nincs különösebb ellenjavallat.",5,[7],["elme","tudo"],"3–7 kör"),
 ("shitali","Śītalī","Hűsítő légzés","Cooling breath","husito",1,"szájon be (csőnyelv), orron ki",
  ["Tedd ki a nyelvet, és hajlítsd csővé.","Lélegezz be rajta keresztül lassan, csukd be a szádat, és lélegezz ki orron."],
  "Hűsít, csillapítja a szomjúságot és az ingerlékenységet, nyugtatja a szívet.",
  "Alacsony vérnyomásnál, asztmánál, megfázáskor, hidegben kerüld.",5,[2],["sziv","elme"],"8–10 kör"),
 ("shitkari","Śītkārī","Szisszenő légzés","Hissing breath","husito",1,"fogakon át be, orron ki",
  ["Harapd finoman össze a fogaidat, az ajkak szétnyílnak.","Lélegezz be a fogak között szisszenve, majd csukd be a szádat, és lélegezz ki orron."],
  "A sítalí változata azoknak, akik nem tudják a nyelvüket csővé hajlítani; hűsít és nyugtat.",
  "Érzékeny fogaknál, alacsony vérnyomásnál, hidegben kerüld.",5,[2],["elme"],"8–10 kör"),
 ("kapalabhati","Kapālabhāti","Koponyafénylés","Skull shining breath","elenkito",2,"aktív, rövid kilégzés, passzív belégzés",
  ["Ülj egyenesen, kezdj 20 rövid, erőteljes kilégzéssel orron át, a hasat befelé rántva.","A belégzés magától történik. Utána pihenj néhány nyugodt légzésig; 3 kör."],
  "Tisztító gyakorlat (kriyá): kitisztítja a légutakat, élénkít, melegít, erősíti a hasizmokat.",
  "Várandósság, menstruáció, magas vérnyomás, szívbetegség, epilepszia, sérv, friss hasi műtét esetén kerüld. Szédülésnél állj meg.",3,[6],["tudo","emesztes","allokepesseg"],"3 × 20–60"),
 ("bhastrika","Bhastrikā","Fújtatólégzés","Bellows breath","elenkito",3,"aktív be- és kilégzés egyenlő erővel",
  ["Ülj egyenesen, lélegezz be és ki erőteljesen, egyenlő ütemben orron át, a has és a mellkas pumpál.","10 légzés után lassú, mély légzés; 3 kör."],
  "Erősen melegít és energizál, növeli az oxigénfelvételt, frissít.",
  "Magas vérnyomás, szívbetegség, várandósság, epilepszia, pánikbetegség esetén kerüld. Szédülésnél állj meg.",3,[1],["tudo","allokepesseg","immun"],"3 × 10"),
 ("agni-sara","Agni sāra","A tűz tisztítása","Fire purification","elenkito",3,"kilégzés utáni visszatartás, a has pumpálása",
  ["Teljes kilégzés után tartsd kint a levegőt, a kezek a combokon.","Gyorsan húzd be és engedd ki a hasat 10–20-szor, majd lélegezz be."],
  "Élénkíti az emésztőtüzet, masszírozza a hasi szerveket, erősíti a hasfalat.",
  "Csak üres gyomorral. Várandósság, menstruáció, magas vérnyomás, szívbetegség, gyomorfekély, sérv esetén kerüld.",3,[],["emesztes","hormon"],"3 kör"),
 ("viloma","Viloma prāṇāyāma","Megszakított légzés","Interrupted breath","kumbhaka",2,"3 részletben be, folyamatosan ki (vagy fordítva)",
  ["Belégzés 3 részletben, mindegyik után 2 mp szünettel, majd hosszú, folyamatos kilégzés.","Változat: folyamatos belégzés, majd 3 részletben kilégzés."],
  "Finomítja a légzés irányítását, előkészíti a hosszabb visszatartásokat; a megszakított kilégzés nyugtat.",
  "Magas vérnyomásnál csak a megszakított kilégzés változatot végezd.",4,[3],["tudo","elme"],"5–10 kör"),
 ("negyszog-legzes","Sama vṛtti kumbhaka","Négyszöglégzés","Box breathing","kumbhaka",2,"4:4:4:4 (be, bent, ki, kint)",
  ["Lélegezz be 4-ig, tartsd bent 4-ig, lélegezz ki 4-ig, tartsd kint 4-ig.","Ha kényelmes, a négy szakasz hossza együtt nőhet."],
  "Fókuszt és nyugalmat ad stresszhelyzetben, erősíti a légzés feletti kontrollt.",
  "Magas vérnyomásnál, szívbetegségnél, várandósság alatt a visszatartásokat hagyd el vagy rövidítsd.",6,[4],["elme","sziv"],"3–5 perc"),
 ("antara-kumbhaka","Antara kumbhaka","Belégzés utáni visszatartás","Retention after inhalation","kumbhaka",3,"1:2:2-től 1:4:2-ig",
  ["Teljes belégzés után tartsd bent a levegőt jálandhara bandhával.","Emeld fel a fejet, és lassan lélegezz ki. Mindig kényelmes határon belül."],
  "Növeli a prána-kapacitást, mélyíti a koncentrációt, energizál.",
  "Magas vérnyomás, szívbetegség, várandósság, glaukóma esetén kerüld.",4,[5],["tudo","elme"],"3–5 kör"),
 ("bahya-kumbhaka","Bāhya kumbhaka","Kilégzés utáni visszatartás","Retention after exhalation","kumbhaka",3,"1:2:1 (be, ki, kint)",
  ["Teljes kilégzés után tartsd kint a levegőt, bandhákkal vagy anélkül.","Ha szükséges, nyugodtan lélegezz be; ne kapkodj levegő után."],
  "Mélyen elcsendesít, erősíti a rekeszizmot és a bandhákat, előkészíti a meditációt.",
  "Magas vérnyomás, szívbetegség, várandósság, szorongás esetén kerüld.",3,[1],["elme","emesztes"],"3–5 kör"),
]

def build():
    items = []
    for (i,sk,hu,en,cat,lv,pat,steps,ben,cau,pc,sc,bn,dur) in P:
        low = [c for c in [pc]+sc if c <= 5]
        prim = CH2EL[low[0]] if low else 'eter'
        sec = []
        for c in low:
            e = CH2EL[c]
            if e != prim and e not in sec: sec.append(e)
        items.append({"id":i,"sanskrit":sk,"hu":hu,"en":en,"category":cat,"level":lv,"pattern":pat,"steps":steps,
            "benefits":ben,"cautions":cau,"chakras":{"primary":pc,"secondary":sc},
            "elements":{"primary":prim,"secondary":sec},"benefitAreas":bn,"duration":dur})
    ids=[x["id"] for x in items]; assert len(ids)==len(set(ids))
    return {"version":1,"kind":"pranayama","categories":CATS,"items":items}

json.dump(build(), open(sys.argv[1],'w'), ensure_ascii=False, indent=1)
print(len(P))
