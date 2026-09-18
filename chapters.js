const CHAPTERS = {
  1: {
    name: "V1",
    title: "Alpha",
    folder: "assets/sounds/chapter1",
    sounds: [
      { id: "lead",    name: "Lead",    category: "beat",   files: ["1-01__Lead_A.mp3"] },
      { id: "deux",    name: "Deux",    category: "beat",   files: ["1-02__Deux_A.mp3"] },
      { id: "kosh",    name: "Kosh",    category: "beat",   files: ["1-03__Kosh_A.mp3"] },
      { id: "shpok",   name: "Shpok",   category: "beat",   files: ["1-04__Shpok_A.mp3"] },
      { id: "tom",     name: "Tom",     category: "beat",   files: ["1-05__Tom_A.mp3"] },

      { id: "nouana",  name: "Nouana",  category: "effect", files: ["1-06__Nouana_A.mp3"] },
      { id: "scratch", name: "Scratch", category: "effect", files: ["1-07__Scratch_A.mp3"] },
      { id: "trill",   name: "Trill",   category: "effect", files: ["1-08__Trill_A.mp3"] },
      { id: "bass",    name: "Bass",    category: "effect", files: ["1-09__Bass_A.mp3"] },
      { id: "uh",      name: "Uh",      category: "effect", files: ["1-10__Uh_A.mp3"] },

      { id: "nugu",    name: "Nugu",    category: "melody", files: ["1-11__Nugu_A.mp3"] },
      { id: "guit",    name: "Guit",    category: "melody", files: ["1-12__Guit_A.mp3"] },
      { id: "tromp",   name: "Tromp",   category: "melody", files: ["1-13__Tromp_A.mp3"] },
      { id: "pouin",   name: "Pouin",   category: "melody", files: ["1-14__Pouin_A.mp3"] },
      { id: "tung",    name: "Tung",    category: "melody", files: ["1-15__Tung_A.mp3"] },

      { id: "aoun",    name: "Aoun",    category: "voice",  files: ["1-16__Aoun_A.mp3"] },
      { id: "hum",     name: "Hum",     category: "voice",  files: ["1-17__Hum_A.mp3"] },
      { id: "get",     name: "Get",     category: "voice",  files: ["1-18__Get_A.mp3"] },
      { id: "tellme",  name: "Tellme",  category: "voice",  files: ["1-19__Tellme_A.mp3"] },
      { id: "make",    name: "Make",    category: "voice",  files: ["1-20__Make_A.mp3"] }
    ],
    bonuses: [
      { id: "choir",  name: "Choir",  predrop: null,                       files: ["1-21__Bonus-Choir.mp3"] },
      { id: "sailor", name: "Sailor", predrop: "1-22__Predrop-Sailor.mp3", files: ["1-23__Bonus-Sailor.mp3"] },
      { id: "santa",  name: "Santa",  predrop: "1-24__Predrop-Santa.mp3",  files: ["1-25__Bonus-Santa.mp3"] }
    ]
  },

  2: {
    name: "V2",
    title: "Little Miss",
    folder: "assets/sounds/chapter2",
    sounds: [
      { id: "boom",     name: "Boom",     category: "beat",   files: ["2-01__Beat1_Boom_A.mp3", "2-02__Beat1_Boom_B.mp3"] },
      { id: "kashi",    name: "Kashi",    category: "beat",   files: ["2-03__Beat2_Kashi_A.mp3", "2-04__Beat2_Kashi_B.mp3"] },
      { id: "paomeu",   name: "Paomeu",   category: "beat",   files: ["2-05__Beat3_Paomeu_A.mp3"] },
      { id: "ptttpeu",  name: "Ptttpeu",  category: "beat",   files: ["2-06__Beat4_Ptttpeu_A.mp3", "2-07__Beat4_Ptttpeu_B.mp3"] },
      { id: "slupttt",  name: "Slupttt",  category: "beat",   files: ["2-08__Beat5_Slupttt_A.mp3"] },

      { id: "poulll",   name: "Poulll",   category: "effect", files: ["2-09__Effet1_Poulll_A.mp3", "2-10__Effet1_Poulll_B.mp3"] },
      { id: "tucati",   name: "Tucati",   category: "effect", files: ["2-11__Effet2_Tucati_A.mp3"] },
      { id: "tuilopta", name: "Tuilopta", category: "effect", files: ["2-12__Effet3_Tuilopta_A.mp3", "2-13__Effet3_Tuilopta_B.mp3"] },
      { id: "tululou",  name: "Tululou",  category: "effect", files: ["2-14__Effet4_Tululou_A.mp3"] },
      { id: "tumttt",   name: "Tumttt",   category: "effect", files: ["2-15__Effet5_Tumttt_A.mp3", "2-16__Effet5_Tumttt_B.mp3"] },

      { id: "nananana", name: "Nananana", category: "melody", files: ["2-17__Melo1_Nananana_A.mp3", "2-18__Melo1_Nananana_B.mp3"] },
      { id: "pelulu",   name: "Pelulu",   category: "melody", files: ["2-19__Melo2_Pelulu_A.mp3", "2-20__Melo2_Pelulu_B.mp3"] },
      { id: "siffle",   name: "Siffle",   category: "melody", files: ["2-21__Melo3_Siffle_A.mp3", "2-22__Melo3_Siffle_B.mp3"] },
      { id: "tatouti",  name: "Tatouti",  category: "melody", files: ["2-23__Melo4_Tatouti_A.mp3", "2-24__Melo4_Tatouti_B.mp3"] },
      { id: "tvutvutvu",name: "Tvutvutvu",category: "melody", files: ["2-25__Melo5_Tvutvutvu_A.mp3", "2-26__Melo5_Tvutvutvu_B.mp3"] },

      { id: "oaaah",       name: "Oaaah",       category: "chorus", files: ["2-27__Coeur1_Oaaah_A.mp3", "2-28__Coeur1_Oaaah_B.mp3"] },
      { id: "cougou",      name: "Cougou",      category: "chorus", files: ["2-29__Coeur2_Cougou_A.mp3", "2-30__Coeur2_Cougou_B.mp3"] },
      { id: "porticoeur",  name: "Porticoeur",  category: "chorus", files: ["2-31__Coeur3_Porticoeur_A.mp3", "2-32__Coeur3_Porticoeur_B.mp3"] },

      { id: "isit", name: "Isit", category: "voice", files: ["2-33__Voix1_Isit_A.mp3", "2-34__Voix1_Isit_B.mp3"] },
      { id: "uare", name: "Uare", category: "voice", files: ["2-35__Voix2_Uare_A.mp3", "2-36__Voix2_Uare_B.mp3"] }
    ],
    bonuses: [
      { id: "satisfy", name: "Satisfy", predrop: "2-37__Predrop.mp3", files: ["2-38__Bonus-Satisfy.mp3"] },
      { id: "miss",    name: "Miss",    predrop: "2-37__Predrop.mp3", files: ["2-39__Bonus-Miss.mp3"] },
      { id: "world",   name: "World",   predrop: "2-37__Predrop.mp3", files: ["2-40__Bonus-World.mp3"] }
    ]
  },

  3: {
    name: "V3",
    title: "Sunrise",
    folder: "assets/sounds/chapter3",
    sounds: [
      { id: "ballet",  name: "Ballet",  category: "beat", files: ["3-01__Drum1_Ballet_A.mp3"] },
      { id: "kick",    name: "Kick",    category: "beat", files: ["3-02__Drum2_Kick_A.mp3"] },
      { id: "snare",   name: "Snare",   category: "beat", files: ["3-03__Drum3_Snare_A.mp3"] },
      { id: "lead3",   name: "Lead",    category: "beat", files: ["3-04__Drum4_Lead_A.mp3"] },
      { id: "charley", name: "Charley", category: "beat", files: ["3-05__Drum5_Charley_A.mp3"] },

      { id: "long",    name: "Long",    category: "effect", files: ["3-06__Effet1_Long_A.mp3", "3-07__Effet1_Long_B.mp3"] },
      { id: "daft1",   name: "Daft1",   category: "effect", files: ["3-08__Effet2_Daft1_A.mp3"] },
      { id: "tududu",  name: "Tududu",  category: "effect", files: ["3-09__Effet3_Tududu_A.mp3"] },
      { id: "daft2",   name: "Daft2",   category: "effect", files: ["3-10__Effet4_Daft2_A.mp3"] },
      { id: "rythme",  name: "Rythme",  category: "effect", files: ["3-11__Effet5_Rythme_A.mp3", "3-12__Effet5_Rythme_B.mp3"] },

      { id: "tuu",     name: "Tuu",     category: "melody", files: ["3-13__Melo1_Tuu_A.mp3"] },
      { id: "indien",  name: "Indien",  category: "melody", files: ["3-14__Melo2_Indien_A.mp3"] },
      { id: "armo",    name: "Armo",    category: "melody", files: ["3-15__Melo3_Armo_A.mp3"] },
      { id: "clav",    name: "Clav",    category: "melody", files: ["3-16__Melo4_Clav_A.mp3", "3-17__Melo4_Clav_B.mp3"] },
      { id: "siffle3", name: "Siffle",  category: "melody", files: ["3-18__Melo5_Siffle_A.mp3"] },

      { id: "waya",    name: "Waya",    category: "voice", files: ["3-19__Voix1_Waya_A.mp3"] },
      { id: "ride",    name: "Ride",    category: "voice", files: ["3-20__Voix2_Ride_A.mp3", "3-21__Voix2_Ride_B.mp3"] },
      { id: "over",    name: "Over",    category: "voice", files: ["3-22__Voix3_Over_A.mp3", "3-23__Voix3_Over_B.mp3"] },
      { id: "colors",  name: "Colors",  category: "voice", files: ["3-24__Voix4_Colors_A.mp3"] },
      { id: "sunrise", name: "Sunrise", category: "voice", files: ["3-25__Voix5_Sunrise_A.mp3", "3-26__Voix5_Sunrise_B.mp3"] }
    ],
    bonuses: [
      { id: "dance",         name: "Dance",   predrop: "3-27__Predrop.mp3", files: ["3-28__Bonus-Dance.mp3"] },
      { id: "child",         name: "Child",   predrop: "3-27__Predrop.mp3", files: ["3-29__Bonus-Child.mp3"] },
      { id: "sunrise_bonus", name: "Sunrise", predrop: "3-27__Predrop.mp3", files: ["3-30__Bonus-Sunrise.mp3"] }
    ]
  },

  4: {
    name: "V4",
    title: "The Love",
    folder: "assets/sounds/chapter4",
    sounds: [
      { id: "kick4",    name: "Kick",    category: "beat", files: ["4-01__Drum1_Kick_A.mp3", "4-02__Drum1_Kick_B.mp3"] },
      { id: "snare4",   name: "Snare",   category: "beat", files: ["4-03__Drum2_Snare_A.mp3", "4-04__Drum2_Snare_B.mp3"] },
      { id: "touti",    name: "Touti",   category: "beat", files: ["4-05__Drum3_Touti_A.mp3"] },
      { id: "charley4", name: "Charley", category: "beat", files: ["4-06__Drum4_Charley_A.mp3"] },
      { id: "chatom",   name: "Chatom",  category: "beat", files: ["4-07__Drum5_Chatom_A.mp3", "4-08__Drum5_Chatom_B.mp3"] },

      { id: "bass4",      name: "Bass",      category: "effect", files: ["4-09__Effect1_Bass_A.mp3", "4-10__Effect1_Bass_B.mp3"] },
      { id: "enigmatic",  name: "Enigmatic", category: "effect", files: ["4-11__Effect2_Enigmatic_A.mp3"] },
      { id: "cry",        name: "Cry",       category: "effect", files: ["4-12__Effect3_Cry_A.mp3"] },
      { id: "odoyouno",   name: "Odoyouno",  category: "effect", files: ["4-13__Effect4_Odoyouno_A.mp3"] },
      { id: "oua",        name: "Oua",       category: "effect", files: ["4-14__Effect5_Oua_A.mp3"] },

      { id: "toun",   name: "Toun",  category: "melody", files: ["4-15__Melo1_Toun_A.mp3", "4-16__Melo1_Toun_B.mp3"] },
      { id: "flute",  name: "Flute", category: "melody", files: ["4-17__Melo2_Flute_A.mp3", "4-18__Melo2_Flute_B.mp3"] },
      { id: "neou",   name: "Neou",  category: "melody", files: ["4-19__Melo3_Neou_A.mp3", "4-20__Melo3_Neou_B.mp3"] },
      { id: "hu",     name: "Hu",    category: "melody", files: ["4-21__Melo4_Hu_A.mp3"] },
      { id: "ah",     name: "Ah",    category: "melody", files: ["4-22__Melo5_Ah_A.mp3"] },

      { id: "feel",     name: "Feel",     category: "voice", files: ["4-23__Voice1_Feel_A.mp3", "4-24__Voice1_Feel_B.mp3"] },
      { id: "chillin",  name: "Chillin",  category: "voice", files: ["4-25__Voice2_Chillin_A.mp3"] },
      { id: "yeah",     name: "Yeah",     category: "voice", files: ["4-26__Voice3_Yeah_A.mp3"] },
      { id: "filback",  name: "Filback",  category: "voice", files: ["4-27__Voice4_Filback_A.mp3", "4-28__Voice4_Filback_B.mp3"] },
      { id: "teylo",    name: "Teylo",    category: "voice", files: ["4-29__Voice5_Teylo_A.mp3"] }
    ],
    bonuses: [
      { id: "love",   name: "Love",   predrop: "4-30__Bonus_Predrop.mp3", files: ["4-31__Bonus1_Love.mp3"] },
      { id: "follow", name: "Follow", predrop: "4-30__Bonus_Predrop.mp3", files: ["4-32__Bonus2_Follow.mp3"] },
      { id: "eagle",  name: "Eagle",  predrop: "4-30__Bonus_Predrop.mp3", files: ["4-33__Bonus3_Eagle.mp3"] }
    ]
  },

  5: {
    name: "V5",
    title: "Brazil",
    folder: "assets/sounds/chapter5",
    sounds: [
      { id: "v5_poum",     name: "Poum",     category: "beat",   files: ["5-01. Poum A.mp3"] },
      { id: "v5_creuki",   name: "Creuki",   category: "beat",   files: ["5-02. Creuki A.mp3"] },
      { id: "v5_shaka",    name: "Shaka",    category: "beat",   files: ["5-03. Shaka A.mp3"] },
      { id: "v5_chouk",    name: "Chouk",    category: "beat",   files: ["5-04. Chouk A.mp3"] },
      { id: "v5_kaliak",   name: "Kaliak",   category: "beat",   files: ["5-05. Kaliak A.mp3"] },

      { id: "v5_tek",      name: "Tek",      category: "effect", files: ["5-06. Tek A.mp3"] },
      { id: "v5_tuk",      name: "Tuk",      category: "effect", files: ["5-07. Tuk A.mp3"] },
      { id: "v5_teung",    name: "Teung",    category: "effect", files: ["5-08. Teung A.mp3"] },
      { id: "v5_ting",     name: "Ting",     category: "effect", files: ["5-09. Ting A.mp3"] },
      { id: "v5_kougou",   name: "Kougou",   category: "effect", files: ["5-10. Kougou A.mp3"] },

      { id: "v5_parimba",  name: "Parimba",  category: "melody", files: ["5-11. Parimba A.mp3"] },
      { id: "v5_coloko",   name: "Coloko",   category: "melody", files: ["5-12. Coloko A.mp3"] },
      { id: "v5_clav",     name: "Clav",     category: "melody", files: ["5-13. Clav A.mp3"] },
      { id: "v5_tromp",    name: "Tromp",    category: "melody", files: ["5-14. Tromp A.mp3"] },
      { id: "v5_trompolo", name: "Trompolo", category: "melody", files: ["5-15. Trompolo A.mp3"] },

      { id: "v5_bass",     name: "Bass",     category: "voice",  files: ["5-16. Bass A.mp3"] },
      { id: "v5_wa",       name: "Wa",       category: "voice",  files: ["5-17. Wa A.mp3"] },
      { id: "v5_ya",       name: "Ya",       category: "voice",  files: ["5-18. Ya A.mp3"] },
      { id: "v5_palapa",   name: "Palapa",   category: "voice",  files: ["5-19. Palapa A.mp3"] },
      { id: "v5_oh",       name: "Oh",       category: "voice",  files: ["5-20. Oh A.mp3"] }
    ],
    bonuses: [
      { id: "felicidade", name: "Felicidade", predrop: null, files: ["5-21. Bonus-Felicidade.mp3"] },
      { id: "chegou",     name: "Chegou",     predrop: null, files: ["5-22. Bonus-Chegou.mp3"] },
      { id: "musica",     name: "Musica",     predrop: null, files: ["5-23. Bonus-Musica.mp3"] }
    ]
  },

  6: {
    name: "V6",
    title: "Alive",
    folder: "assets/sounds/chapter6",
    sounds: [
      { id: "v6_kick",     name: "Kick",     category: "beat",   files: ["6-01. Icka.mp3"] },
      { id: "v6_snare",    name: "Snare",    category: "beat",   files: ["6-02. Narea.mp3"] },
      { id: "v6_kanye",    name: "Kanye",    category: "beat",   files: ["6-03. Anyea.mp3"] },
      { id: "v6_tuctuc",   name: "Tuctuc",   category: "beat",   files: ["6-04. Uctuca.mp3"] },
      { id: "v6_break",    name: "Break",    category: "beat",   files: ["6-05. Reaka.mp3"] },

      { id: "v6_cribasse", name: "Cribasse", category: "effect", files: ["6-06. Ribassea.mp3"] },
      { id: "v6_distotut", name: "Distotut", category: "effect", files: ["6-07. Istotuta.mp3"] },
      { id: "v6_screw",    name: "Screw",    category: "effect", files: ["6-08. Crewa.mp3"] },
      { id: "v6_shaolin",  name: "Shaolin",  category: "effect", files: ["6-09. Haolina.mp3"] },
      { id: "v6_shower",   name: "Shower",   category: "effect", files: ["6-10. Howera.mp3"] },

      { id: "v6_basse",    name: "Basse",    category: "melody", files: ["6-11. Assea.mp3"] },
      { id: "v6_hou",      name: "Hou",      category: "melody", files: ["6-12. Oua.mp3"] },
      { id: "v6_clav",     name: "Clav",     category: "melody", files: ["6-13. Lava.mp3"] },
      { id: "v6_synth",    name: "Synth",    category: "melody", files: ["6-14. Yntha.mp3"] },
      { id: "v6_yah",      name: "Yah",      category: "melody", files: ["6-15. Aha.mp3"] },

      { id: "v6_hurry",    name: "Hurry",    category: "voice",  files: ["6-16. Urrya.mp3"] },
      { id: "v6_good",     name: "Good",     category: "voice",  files: ["6-17. Ooda.mp3"] },
      { id: "v6_mind",     name: "Mind",     category: "voice",  files: ["6-18. Inda.mp3"] },
      { id: "v6_haha",     name: "Haha",     category: "voice",  files: ["6-19. Ahaa.mp3"] },
      { id: "v6_wow",      name: "Wow",      category: "voice",  files: ["6-20. Owa.mp3"] }
    ],
    bonuses: [
      { id: "v6_alive", name: "Alive", predrop: null,                   files: ["6-21. Onus-Alive.mp3"] },
      { id: "v6_busta", name: "Busta", predrop: "6-22. Redrop-Busta.mp3", files: ["6-23. Onus-Busta.mp3"] },
      { id: "v6_vr",    name: "VR",    predrop: "6-24. Redrop-Vr.mp3",    files: ["6-25. Onus-Vr.mp3"] }
    ]
  },

  7: {
    name: "V7",
    title: "Jeevan",
    folder: "assets/sounds/chapter7",
    sounds: [
      { id: "v7_lead",    name: "Lead",    category: "beat",   files: ["7-01. Lead A.mp3"] },
      { id: "v7_pouin",   name: "Pouin",   category: "beat",   files: ["7-02. Pouin A.mp3", "7-03. Pouin B.mp3"] },
      { id: "v7_tung",    name: "Tung",    category: "beat",   files: ["7-04. Tung A.mp3"] },
      { id: "v7_tabla",   name: "Tabla",   category: "beat",   files: ["7-05. Tabla A.mp3"] },
      { id: "v7_tuduki",  name: "Tuduki",  category: "beat",   files: ["7-06. Tuduki A.mp3"] },

      { id: "v7_bass",    name: "Bass",    category: "effect", files: ["7-07. Bass A.mp3", "7-08. Bass B.mp3"] },
      { id: "v7_bourdon", name: "Bourdon", category: "effect", files: ["7-09. Bourdon A.mp3"] },
      { id: "v7_campan",  name: "Campan",  category: "effect", files: ["7-10. Campan A.mp3"] },
      { id: "v7_kum",     name: "Kum",     category: "effect", files: ["7-11. Kum A.mp3", "7-12. Kum B.mp3"] },
      { id: "v7_string",  name: "String",  category: "effect", files: ["7-13. String A.mp3", "7-14. String B.mp3"] },

      { id: "v7_citar",   name: "Citar",   category: "melody", files: ["7-15. Citar A.mp3"] },
      { id: "v7_guit",    name: "Guit",    category: "melody", files: ["7-16. Guit A.mp3"] },
      { id: "v7_tromp",   name: "Tromp",   category: "melody", files: ["7-17. Tromp A.mp3", "7-18. Tromp B.mp3"] },
      { id: "v7_taoung",  name: "Taoung",  category: "melody", files: ["7-19. Taoung A.mp3"] },
      { id: "v7_sifle",   name: "Sifle",   category: "melody", files: ["7-20. Sifle A.mp3", "7-21. Sifle B.mp3"] },

      { id: "v7_djindr",  name: "Djindr",  category: "voice",  files: ["7-22. Djindr A.mp3"] },
      { id: "v7_djinga",  name: "Djinga",  category: "voice",  files: ["7-23. Djinga A.mp3"] },
      { id: "v7_djinta",  name: "Djinta",  category: "voice",  files: ["7-24. Djinta A.mp3"] },
      { id: "v7_jeevan",  name: "Jeevan",  category: "voice",  files: ["7-25. Jeevan A.mp3", "7-26. Jeevan B.mp3"] },
      { id: "v7_yaha",    name: "Yaha",    category: "voice",  files: ["7-27. Yaha A.mp3", "7-28. Yaha B.mp3"] }
    ],
    bonuses: [
      { id: "v7_kofitez",  name: "Kofitez",  predrop: null,                     files: ["7-29. Bonus Kofitez.mp3"] },
      { id: "v7_sapna",    name: "Sapna",    predrop: "7-30. Predrop Sapna.mp3", files: ["7-31. Bonus Sapna.mp3"] },
      { id: "v7_kabikabi", name: "Kabikabi", predrop: null,                     files: ["7-32. Bonus Kabikabi.mp3"] }
    ]
  },

  8: {
    name: "V8",
    title: "Dystopia",
    folder: "assets/sounds/chapter8",
    sounds: [
      { id: "v8_atlanta",  name: "Atlanta",  category: "beat",   files: ["8-01. Atlanta A.mp3", "8-02. Atlanta B.mp3"] },
      { id: "v8_tuctom",   name: "Tuctom",   category: "beat",   files: ["8-03. Tuctom A.mp3", "8-04. Tuctom B.mp3"] },
      { id: "v8_foubreak", name: "Foubreak", category: "beat",   files: ["8-05. Foubreak A.mp3", "8-06. Foubreak B.mp3"] },
      { id: "v8_koukaki",  name: "Koukaki",  category: "beat",   files: ["8-07. Koukaki A.mp3"] },
      { id: "v8_koungou",  name: "Koungou",  category: "beat",   files: ["8-08. Koungou A.mp3"] },

      { id: "v8_bass",     name: "Bass",     category: "effect", files: ["8-09. Bass A.mp3", "8-10. Bass B.mp3"] },
      { id: "v8_monk",     name: "Monk",     category: "effect", files: ["8-11. Monk A.mp3", "8-12. Monk B.mp3"] },
      { id: "v8_sonar",    name: "Sonar",    category: "effect", files: ["8-13. Sonar A.mp3"] },
      { id: "v8_souffle",  name: "Souffle",  category: "effect", files: ["8-14. Souffle A.mp3", "8-15. Souffle B.mp3"] },
      { id: "v8_epifle",   name: "Epifle",   category: "effect", files: ["8-16. Epifle A.mp3", "8-17. Epifle B.mp3"] },

      { id: "v8_arpeg",    name: "Arpeg",    category: "melody", files: ["8-18. Arpeg A.mp3", "8-19. Arpeg B.mp3"] },
      { id: "v8_tromp",    name: "Tromp",    category: "melody", files: ["8-20. Tromp A.mp3", "8-21. Tromp B.mp3"] },
      { id: "v8_pizzi",    name: "Pizzi",    category: "melody", files: ["8-22. Pizzi A.mp3", "8-23. Pizzi B.mp3"] },
      { id: "v8_organ",    name: "Organ",    category: "melody", files: ["8-24. Organ A.mp3", "8-25. Organ B.mp3"] },
      { id: "v8_synth",    name: "Synth",    category: "melody", files: ["8-26. Synth A.mp3", "8-27. Synth B.mp3"] },

      { id: "v8_follow",   name: "Follow",   category: "voice",  files: ["8-28. Follow A.mp3", "8-29. Follow B.mp3"] },
      { id: "v8_choir",    name: "Choir",    category: "voice",  files: ["8-30. Choir A.mp3", "8-31. Choir B.mp3"] },
      { id: "v8_houhou",   name: "Houhou",   category: "voice",  files: ["8-32. Houhou A.mp3", "8-33. Houhou B.mp3"] },
      { id: "v8_reach",    name: "Reach",    category: "voice",  files: ["8-34. Reach A.mp3", "8-35. Reach B.mp3"] },
      { id: "v8_believe",  name: "Believe",  category: "voice",  files: ["8-36. Believe A.mp3", "8-37. Believe B.mp3"] }
    ],
    bonuses: [
      { id: "v8_riviera",    name: "Riviera",    predrop: null, files: ["8-38. Bonus Riviera.mp3"] },
      { id: "v8_zemetekile", name: "Zemetekile", predrop: null, files: ["8-39. Bonus Zemetekile.mp3"] },
      { id: "v8_cumulor",    name: "Cumulor",    predrop: null, files: ["8-40. Bonus Cumulor.mp3"] }
    ]
  },

  9: {
    name: "V9",
    title: "Wekiddy",
    folder: "assets/sounds/chapter9",
    sounds: [
      { id: "v9_boo9",      name: "Boo 9",     category: "beat",   files: ["9-01. Boo 9 A.mp3", "9-02. Boo 9 B.mp3"] },
      { id: "v9_kevin",     name: "Kevin",     category: "beat",   files: ["9-03. Kevin A.mp3", "9-04. Kevin B.mp3"] },
      { id: "v9_doublek",   name: "Double K",  category: "beat",   files: ["9-05. Double K A.mp3", "9-06. Double K B.mp3"] },
      { id: "v9_bluegt",    name: "Blue GT",   category: "beat",   files: ["9-07. Blue Gt A.mp3"] },
      { id: "v9_mj182",     name: "MJ 182",    category: "beat",   files: ["9-08. Mj 182 A.mp3"] },

      { id: "v9_boomfuzz",  name: "Boom Fuzz", category: "effect", files: ["9-09. Boom Fuzz A.mp3", "9-10. Boom Fuzz B.mp3"] },
      { id: "v9_asapbee",   name: "ASAP Bee",  category: "effect", files: ["9-11. Asap Bee A.mp3", "9-12. Asap Bee B.mp3"] },
      { id: "v9_mog",       name: "M.O.G",     category: "effect", files: ["9-13. M O G A.mp3", "9-14. M O G B.mp3"] },
      { id: "v9_arashi",    name: "Arashi",    category: "effect", files: ["9-15. Arashi A.mp3", "9-16. Arashi B.mp3"] },
      { id: "v9_bigduke",   name: "Big Duke",  category: "effect", files: ["9-17. Big Duke A.mp3", "9-18. Big Duke B.mp3"] },

      { id: "v9_swingy",    name: "Swingy",    category: "melody", files: ["9-19. Swingy A.mp3", "9-20. Swingy B.mp3"] },
      { id: "v9_dinvaders", name: "D.Invaders",category: "melody", files: ["9-21. D Invaders A.mp3", "9-22. D Invaders B.mp3"] },
      { id: "v9_doodoo",    name: "Doo Doo",   category: "melody", files: ["9-23. Doo Doo A.mp3"] },
      { id: "v9_8bit",      name: "8-Bit",     category: "melody", files: ["9-24. 8 Bit A.mp3", "9-25. 8 Bit B.mp3"] },
      { id: "v9_kcglow",    name: "KC Glow",   category: "melody", files: ["9-26. Kc Glow A.mp3", "9-27. Kc Glow B.mp3"] },

      { id: "v9_elcoolp",   name: "El Cool P", category: "voice",  files: ["9-28. El Cool P A.mp3", "9-29. El Cool P B.mp3"] },
      { id: "v9_memphis",   name: "Memphis",   category: "voice",  files: ["9-30. Memphis A.mp3", "9-31. Memphis B.mp3"] },
      { id: "v9_joggd",     name: "Jogg D",    category: "voice",  files: ["9-32. Jogg D A.mp3", "9-33. Jogg D B.mp3"] },
      { id: "v9_scooter",   name: "Scooter",   category: "voice",  files: ["9-34. Scooter A.mp3", "9-35. Scooter B.mp3"] },
      { id: "v9_lilblaze",  name: "Lil Blaze", category: "voice",  files: ["9-36. Lil Blaze A.mp3", "9-37. Lil Blaze B.mp3"] }
    ],
    bonuses: [
      { id: "v9_flow", name: "Flow", predrop: "9-38. Predrop Flow.mp3", files: ["9-39. Bonus Flow.mp3"] },
      { id: "v9_urfo", name: "URFO", predrop: "9-40. Predrop Urfo.mp3", files: ["9-41. Bonus Urfo.mp3"] },
      { id: "v9_bdb",  name: "BDB",  predrop: null,                     files: ["9-42. Bonus Bdb.mp3"] }
    ]
  }
};