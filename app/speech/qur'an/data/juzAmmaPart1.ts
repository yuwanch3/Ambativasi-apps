export type QuranVerse = {
  ayah: number;
  text: string;
  latin: string;
};

export type SurahOption = {
  name: string;
  number: number;
  verses: QuranVerse[];
};

export const JUZ_AMMA_PART_1: SurahOption[] = [
   {
    name: 'Al-Fatihah',
    number: 1,
    verses: [
      {
        ayah: 1,
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        latin: 'Bismillāhir-raḥmānir-raḥīm',
      },
      {
        ayah: 2,
        text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        latin: 'Al-ḥamdu lillāhi rabbil-‘ālamīn',
      },
      {
        ayah: 3,
        text: 'الرَّحْمَٰنِ الرَّحِيمِ',
        latin: 'Ar-raḥmānir-raḥīm',
      },
      {
        ayah: 4,
        text: 'مَالِكِ يَوْمِ الدِّينِ',
        latin: 'Māliki yaumid-dīn',
      },
      {
        ayah: 5,
        text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        latin: 'Iyyāka na‘budu wa iyyāka nasta‘īn',
      },
      {
        ayah: 6,
        text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        latin: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
      },
      {
        ayah: 7,
        text:
          'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ' +
          'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ ' +
          'وَلَا الضَّالِّينَ',
        latin:
          'Ṣirāṭallażīna an‘amta ‘alaihim, ' +
          'gairil-magḍūbi ‘alaihim ' +
          'wa laḍ-ḍāllīn',
      },
    ],
  },
   {
    name: 'An-Nas',
    number: 114,
    verses: [
      {
        ayah: 1,
        text: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ',
        latin: 'qul a‘ûdzu birabbin-nâs',
      },
      {
        ayah: 2,
        text: 'مَلِكِ النَّاسِ',
        latin: 'malikin-nâs',
      },
      {
        ayah: 3,
        text: 'إِلَٰهِ النَّاسِ',
        latin: 'ilâhin-nâs',
      },
      {
        ayah: 4,
        text: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        latin: 'min syarril-waswâsil-khannâs',
      },
      {
        ayah: 5,
        text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        latin: 'alladzī yuwaswisu fī ṣudūrin-nâs',
      },
      {
        ayah: 6,
        text: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        latin: 'minal-jinnati wan-nâs',
      },
    ],
  },
   {
    name: 'Al-Falaq',
    number: 113,
    verses: [
      {
        ayah: 1,
        text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَق',
        latin: 'qul a‘ûdzu birabbil-falaq',
      },
      {
        ayah: 2,
        text: 'مِنْ شَرِّ مَا خَلَقَ',
        latin: 'min syarri mā khalaq',
      },
      {
        ayah: 3,
        text: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        latin: 'wa min syarri ghāsiqīn idzā waqab', // Sepertinya belum benar
      },
      {
        ayah: 4,
        text: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        latin: 'wa min syarrin-naffāsāti fīl-‘uqad',
      },
      {
        ayah: 5,
        text: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        latin: 'wa min syarri-ḥāsidin idzā ḥasad',
      },
    ],
  },
  {
  name: 'Al-Ikhlas',
  number: 112,
  verses: [
    {
      ayah: 1,
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      latin: 'qul huwallāhu aḥad',
    },
    {
      ayah: 2,
      text: 'اللَّهُ الصَّمَدُ',
      latin: 'allāhuṣh-ṣhamad',
    },
    {
      ayah: 3,
      text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      latin: 'lam yalid wa lam yūlad', // Sepertinya belum benar
    },
    {
      ayah: 4,
      text: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
      latin: 'wa lam yakul lahu kufuwan aḥad',
    },
  ],
},
  {
  name: 'Al-Lahab',
  number: 111,
  verses: [
    {
      ayah: 1,
      text: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَّتَبَّ',
      latin: 'tabbat yada abi lahabiw watabb',
    },
    {
      ayah: 2,
      text: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ',
      latin: 'ma aghna ‘an-hu maaluhu wa ma kasab',
    },
    {
      ayah: 3,
      text: 'سَيَصْلٰى نَارًا ذَاتَ لَهَبٍ',
      latin: 'sayashlā nāran dzāta lahab',
    },
    {
      ayah: 4,
      text: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ',
      latin: 'wamra’atuh ḥammālatal-ḥaṭhab',
    },
    {
      ayah: 5,
      text: 'فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ',
      latin: 'fī jīdihā ḥablum mim masad',
    },
  ],
},
{
  name: 'An-Nasr',
  number: 110,
  verses: [
    {
      ayah: 1,
      text: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
      latin: 'idzā jā’a naṣrullāhi wal-fat-ḥ',
    },
    {
      ayah: 2,
      text: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
      latin: 'wa ra’aitan-nāsa yadkhulūna fī dīnillāhi afwājā',
    },
    {
      ayah: 3,
      text: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا',
      latin: 'fa sabbiḥ biḥamdi rabbika waastaghfir-h innahu kāna tawwāba',
    },
  ],
},
{
  name: 'Al-Kafirun',
  number: 109,
  verses: [
    {
      ayah: 1,
      text: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
      latin: 'qul yā ayyuhal-kāfirūn'
    },
    {
      ayah: 2,
      text: 'لَا أَعْبُدُ مَا تَعْبُدُونَ',
      latin: 'lā a‘budu mā ta‘budūn',
    },
    {
      ayah: 3,
      text: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
      latin: 'wa lā antum ‘ābidūna mā a‘bud',
    },
    {
      ayah: 4,
      text: 'وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ',
      latin: 'wa lā anā ‘ābidum mā ‘abattum',
    },
    {
      ayah: 5,
      text: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
      latin: 'wa lā antum ‘ābidūna mā a‘bud',
    },
    {
      ayah: 6,
      text: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
      latin: 'lakum dīnukum wa liyā dīn'
    },
  ],
},
{
  name: 'Al-Kautsar',
  number: 108,
  verses: [
    {
      ayah: 1,
      text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      latin: 'innā a‘ṭhainākal-kautsar',
    },
    {
      ayah: 2,
      text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      latin: 'fa ṣhalli lirabbika wan-ḥar',
    },
    {
      ayah: 3,
      text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      latin: 'innā syāni’aka huwal-abtar',
    },
  ],
},
{
  name: 'Al-Maun',
  number: 107,
  verses: [
    {
      ayah: 1,
      text: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ',
      latin: 'a rā’aitalladzī yukadzdzibu bid-dīn',
    },
    {
      ayah: 2,
      text: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ',
      latin: 'fa dzālikalladzī yadū‘ul-yatīm',
    },
    {
      ayah: 3,
      text: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ',
      latin: 'wa lā yaḥuḍḍu ‘alā ṭha‘āmil-miskīn',
    },
    {
      ayah: 4,
      text: 'فَوَيْلٌ لِلْمُصَلِّينَ',
      latin: 'fa wailul lil-muṣallīn',
    },
    {
      ayah: 5,
      text: 'الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ',
      latin: 'alladzīna hum ‘an ṣalātihim sāhūn',
    },
    {
      ayah: 6,
      text: 'الَّذِينَ هُمْ يُرَاءُونَ',
      latin: 'alladzīna hum yurā’ūn',
    },
    {
      ayah: 7,
      text: 'وَيَمْنَعُونَ الْمَاعُونَ',
      latin: 'wa yamna‘ūnal-mā‘ūn',
    },
  ],
},
{
  name: 'Quraisy',
  number: 106,
  verses: [
    {
      ayah: 1,
      text: 'لِإِيلَافِ قُرَيْشٍ',
      latin: 'li’īlāfi qurayš',
    },
    {
      ayah: 2,
      text: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ',
      latin: 'īlāfihim riḥlatasy-syitā’i waṣh-ṣhaif',
    },
    {
      ayah: 3,
      text: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ',
      latin: 'falya‘budū rabba hādzāl-bait', // Sepertinya belum benar
    },
    {
      ayah: 4,
      text: 'الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَّآمَنَهُمْ مِنْ خَوْفٍ',
      latin: 'alladzī aṭh‘amahum min jū‘iw wa āmanahum min khauf',
    },
  ],
},
{
  name: 'Al-Fil',
  number: 105,
  verses: [
    {
      ayah: 1,
      text: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
      latin: 'alam tara kaifa fa‘ala rabbuka bi’aṣḥ-hābil-fīl',
    },
    {
      ayah: 2,
      text: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ',
      latin: 'a lam yaj‘al kaidahum fī taḍlīl',
    },
    {
      ayah: 3,
      text: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ',
      latin: 'wa arsalā ‘alaihim ṭairan abābīl',
    },
    {
      ayah: 4,
      text: 'تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ',
      latin: 'tarmihim biḥijāratim min sijjīl', 
    },
    {
      ayah: 5,
      text: 'فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ',
      latin: 'fa ja‘alahum ka‘aṣhfim ma’kūl',
    },
  ],
},
{
  name: 'Al-Humazah',
  number: 104,
  verses: [
    {
      ayah: 1,
      text: 'وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ',
      latin: 'wailul likulli humazatil lumazah',
    },
    {
      ayah: 2,
      text: 'الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ',
      latin: 'alladzī jama‘a mālaw wa ‘addadah', // Stuck
    },
    {
      ayah: 3,
      text: 'يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ',
      latin: 'yaḥsabū anna mālahu akhladah',
    },
    {
      ayah: 4,
      text: 'كَلَّا لَيُنْبَذَنَّ فِي الْحُطَمَةِ',
      latin: 'kallā layumbadzana fīl-ḥuṭhamah', // Susah
    },
    {
      ayah: 5,
      text: 'وَمَا أَدْرَاكَ مَا الْحُطَمَةُ',
      latin: 'wa mā adrāka māl-ḥuṭhamah',
    },
    {
      ayah: 6,
      text: 'نَارُ اللَّهِ الْمُوقَدَةُ',
      latin: 'nārullāhil-mūqadah',
    },
    {
      ayah: 7,
      text: 'الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ',
      latin: 'allatī taṭhṭali‘u ‘alāl-af’idah',
    },
    {
      ayah: 8,
      text: 'إِنَّهَا عَلَيْهِمْ مُؤْصَدَةٌ',
      latin: 'innahā ‘alaihim mu’ṣhadah',
    },
    {
      ayah: 9,
      text: 'فِي عَمَدٍ مُمَدَّدَةٍ',
      latin: 'fī ‘amadim mumaddadah',
    },
  ],
},
{
  name: 'Al-Asr',
  number: 103,
  verses: [
    {
      ayah: 1,
      text: 'وَالْعَصْرِ',
      latin: 'wal-‘aṣhr',
    },
    {
      ayah: 2,
      text: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
      latin: 'innal-insāna lafī khusr',
    },
    {
      ayah: 3,
      text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
      latin: 'illāalladzīna āmanū wa ‘amilūṣh-ṣhāliḥāti wa tawāṣhau bil-ḥaqqi wa tawāṣhau biṣh-ṣhabr',
    },
  ],
},
{
  name: 'At-Takatsur',
  number: 102,
  verses: [
    {
      ayah: 1,
      text: 'أَلْهَاكُمُ التَّكَاثُرُ',
      latin: 'alhākumut-takātsur',
    },
    {
      ayah: 2,
      text: 'حَتَّىٰ زُرْتُمُ الْمَقَابِرَ',
      latin: 'ḥattā zurtumūl-maqābir',
    },
    {
      ayah: 3,
      text: 'كَلَّا سَوْفَ تَعْلَمُونَ',
      latin: 'kallā saufa ta‘lamūn',
    },
    {
      ayah: 4,
      text: 'ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ',
      latin: 'tsumma kallā saufa ta‘lamūn',
    },
    {
      ayah: 5,
      text: 'كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ',
      latin: 'kallā lau ta‘lamūn ‘ilmā l-yaqīn',
    },
    {
      ayah: 6,
      text: 'لَتَرَوُنَّ الْجَحِيمَ',
      latin: 'latarawunnal-jahīm',
    },
    {
      ayah: 7,
      text: 'ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ',
      latin: 'tsumma latarawunnahā ‘aināl-yaqīn',
    },
    {
      ayah: 8,
      text: 'ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ',
      latin: 'tsumma latus’alunna yauma’idzin ‘anin-na‘īm',
    },
  ],
},
{
  name: 'Al-Qariah',
  number: 101,
  verses: [
    {
      ayah: 1,
      text: 'الْقَارِعَةُ',
      latin: 'al-qāri‘ah',
    },
    {
      ayah: 2,
      text: 'مَا الْقَارِعَةُ',
      latin: 'māl-qāri‘ah',
    },
    {
      ayah: 3,
      text: 'وَمَا أَدْرَاكَ مَا الْقَارِعَةُ',
      latin: 'wa mā adrāka māl-qāri‘ah',
    },
    {
      ayah: 4,
      text: 'يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ',
      latin: 'yauma yakūnun-nāsu kal-farāsyil-mabtsūts',
    },
    {
      ayah: 5,
      text: 'وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنْفُوشِ',
      latin: 'wa takūnul-jibālu kal-‘ihnil-manfūsy',
    },
    {
      ayah: 6,
      text: 'فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ',
      latin: 'fa ammā man tsaqulat mawāzīnuh',
    },
    {
      ayah: 7,
      text: 'فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ',
      latin: 'fa huwa fī ‘īsyatir rāḍiyah',
    },
    {
      ayah: 8,
      text: 'وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ',
      latin: 'wa ammā man khaffat mawāzīnuh',
    },
    {
      ayah: 9,
      text: 'فَأُمُّهُ هَاوِيَةٌ',
      latin: 'fa ummuhu hāwiyah',
    },
    {
      ayah: 10,
      text: 'وَمَا أَدْرَاكَ مَا هِيَهْ',
      latin: 'wa mā adrāka mā hiyah',
    },
    {
      ayah: 11,
      text: 'نَارٌ حَامِيَةٌ',
      latin: 'nārun ḥāmiyah',
    },
  ],
},
{
  name: 'Al-Adiyat',
  number: 100,
  verses: [
    {
      ayah: 1,
      text: 'وَالْعَادِيَاتِ ضَبْحًا',
      latin: 'wal-‘ādiyāti ḍlab-ḥa',
    },
    {
      ayah: 2,
      text: 'فَالْمُورِيَاتِ قَدْحًا',
      latin: 'fal-mūriyāti qad-ḥa',
    },
    {
      ayah: 3,
      text: 'فَالْمُغِيرَاتِ صُبْحًا',
      latin: 'fal-mughīrāti ṣub-ḥa',
    },
    {
      ayah: 4,
      text: 'فَأَثَرْنَ بِهِ نَقْعًا',
      latin: 'fa atsarna bihi naq‘a',
    },
    {
      ayah: 5,
      text: 'فَوَسَطْنَ بِهِ جَمْعًا',
      latin: 'fa wasaṭhna bihi jam‘a',
    },
    {
      ayah: 6,
      text: 'إِنَّ الْإِنْسَانَ لِرَبِّهِ لَكَنُودٌ',
      latin: 'innal-insāna lirabbihi lakanūd',
    },
    {
      ayah: 7,
      text: 'وَإِنَّهُ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ',
      latin: 'wa innahu ‘alā dzālika lasyahīd',
    },
    {
      ayah: 8,
      text: 'وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ',
      latin: 'wa innahu liḥubbil-khairi lasyadīd',
    },
    {
      ayah: 9,
      text: 'أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِي الْقُبُورِ',
      latin: 'a fa lā ya‘lamu idzā bu‘tsira mā fīl-qubūr',
    },
    {
      ayah: 10,
      text: 'وَحُصِّلَ مَا فِي الصُّدُورِ',
      latin: 'wa ḥuṣhṣhila mā fīṣh-ṣhudūr',
    },
    {
      ayah: 11,
      text: 'إِنَّ رَبَّهُمْ بِهِمْ يَوْمَئِذٍ لَخَبِيرٌ',
      latin: 'inna rabbahum bihim yauma’idzil lakhabīr',
    },
  ],
},
{
  name: 'Az-Zalzalah',
  number: 99,
  verses: [
    {
      ayah: 1,
      text: 'إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا',
      latin: 'idhā zulzilatil-arḍlu zilzālahā',
    },
    {
      ayah: 2,
      text: 'وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا',
      latin: 'wa akhrajatil-arḍu atsqālahā',
    },
    {
      ayah: 3,
      text: 'وَقَالَ الْإِنْسَانُ مَا لَهَا',
      latin: 'wa qālal-insānu mā lahā',
    },
    {
      ayah: 4,
      text: 'يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا',
      latin: 'yauma’idzin tuḥadditsu akhbārahā',
    },
    {
      ayah: 5,
      text: 'بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا',
      latin: 'bi’anna rabbaka auḥā lahā',
    },
    {
      ayah: 6,
      text: 'يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِيُرَوْا أَعْمَالَهُمْ',
      latin: 'yauma’idziy yaṣdurun-nāsu ašytātal liyurāu a‘mālahum',
    },
    {
      ayah: 7,
      text: 'فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
      latin: 'fa may ya‘mal mitsqāla dzarratin khairay yarah',
    },
    {
      ayah: 8,
      text: 'وَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ',
      latin: 'wa may ya‘mal mitsqāla dzarratin syarray yarah',
    },
  ],
},
{
  name: 'Al-Bayyinah',
  number: 98,
  verses: [
    {
      ayah: 1,
      text: 'لَمْ يَكُنِ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ وَالْمُشْرِكِينَ مُنْفَكِّينَ حَتَّىٰ تَأْتِيَهُمُ الْبَيِّنَةُ',
      latin: 'lam yakunilladzīna kafarū min ahlil-kitābi wal-musyrikīna munfakkīna ḥattā ta’tīyahumul-bayyinah',
    },
    {
      ayah: 2,
      text: 'رَسُولٌ مِنَ اللَّهِ يَتْلُو صُحُفًا مُطَهَّرَةً',
      latin: 'rasūlum minallāhi yatlū ṣuḥufam muṭahharah',
    },
    {
      ayah: 3,
      text: 'فِيهَا كُتُبٌ قَيِّمَةٌ',
      latin: 'fīhā kutubun qayyimah',
    },
    {
      ayah: 4,
      text: 'وَمَا تَفَرَّقَ الَّذِينَ أُوتُوا الْكِتَابَ إِلَّا مِنْ بَعْدِ مَا جَاءَتْهُمُ الْبَيِّنَةُ',
      latin: 'wa mā tafarraqalladzīna ūtūl-kitāba illā min ba‘di mā jā’at-humul-bayyinah',
    },
    {
      ayah: 5,
      text: 'وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ وَذَٰلِكَ دِينُ الْقَيِّمَةِ',
      latin: 'wa mā umirū illā liya‘būdūllāha mukhliṣīna lahud-dīna ḥunafā’a wa yuqīmūṣh-ṣhalāta wa yu’tūz-zakāta wa dzālika dīnul-qayyimah',
    },
    {
      ayah: 6,
      text: 'إِنَّ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ وَالْمُشْرِكِينَ فِي نَارِ جَهَنَّمَ خَالِدِينَ فِيهَا أُولَٰئِكَ هُمْ شَرُّ الْبَرِيَّةِ',
      latin: 'innalladzīna kafarū min ahlil-kitābi wal-mushrikīna fī nāri jahannama khālidīna fīhā ulā’ika hum syarrul-barīyyah',
    },
    {
      ayah: 7,
      text: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أُولَٰئِكَ هُمْ خَيْرُ الْبَرِيَّةِ',
      latin: 'innalladzīna āmanū wa ‘amilūṣh-ṣhāliḥāti ulā’ika hum khairul-barīyyah',
    },
    {
      ayah: 8,
      text: 'جَزَاؤُهُمْ عِنْدَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا أَبَدًاۗ  رَضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُۗ ذَٰلِكَ لِمَنْ خَشِيَ رَبَّهُ',
      latin: 'jazā’uhum ‘inda rabbihim jannātu ‘adnin tajrī min taḥtihāl-an-ḥāru khālidīna fīhā abada, raḍiyallāhu ‘an-hum wa raḍū ‘anh, dhālika liman khasyiya rabbah',
    },
  ],
},
{
  name: 'Al-Qadr',
  number: 97,
  verses: [
    {
      ayah: 1,
      text: 'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
      latin: 'innā anzalnāhu fī lailatil-qadr',
    },
    {
      ayah: 2,
      text: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ',
      latin: 'wa mā adrāka mā lailatul-qadr',
    },
    {
      ayah: 3,
      text: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ',
      latin: 'lailatul-qadri khairum min alfi syahr',
    },
    {
      ayah: 4,
      text: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ',
      latin: 'tanazzalul-malā’ikatu war-rūḥu fīhā bi’idzni rabbihim min kulli amri',
    },
    {
      ayah: 5,
      text: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
      latin: 'salāmun hiya ḥattā maṭla‘il-fajr',
    },
  ],
},
{
  name: 'Al-Alaq',
  number: 96,
  verses: [
    {
      ayah: 1,
      text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      latin: 'iqrā’ bismi rabbikalladzī khalaq',
    },
    {
      ayah: 2,
      text: 'خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ',
      latin: 'khalaqal-insāna min ‘alaq',
    },
    {
      ayah: 3,
      text: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',
      latin: 'iqrā’ wa rabbukal-akram',
    },
    {
      ayah: 4,
      text: 'الَّذِي عَلَّمَ بِالْقَلَمِ',
      latin: 'alladzī ‘allama bil-qalam',
    },
    {
      ayah: 5,
      text: 'عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ',
      latin: '‘allamal-insāna mā lam ya‘lam',
    },
    {
      ayah: 6,
      text: 'كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ',
      latin: 'kallā innal-insāna layāṭghā',
    },
    {
      ayah: 7,
      text: 'أَنْ رَآهُ اسْتَغْنَىٰ',
      latin: 'ar rā’ahū istaghnā',
    },
    {
      ayah: 8,
      text: 'إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ',
      latin: 'inna ilā rabbikar-ruj‘ā',
    },
    {
      ayah: 9,
      text: 'أَرَأَيْتَ الَّذِي يَنْهَىٰ',
      latin: 'ara’aitalladzī yan-ḥā',
    },
    {
      ayah: 10,
      text: 'عَبْدًا إِذَا صَلَّىٰ',
      latin: 'ʿabdan idhā ṣhallā',
    },
    {
      ayah: 11,
      text: 'أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ',
      latin: 'a ra’aita in kāna ‘alāl-hudā',
    },
    {
      ayah: 12,
      text: 'أَوْ أَمَرَ بِالتَّقْوَىٰ',
      latin: 'au amara bit-taqwā',
    },
    {
      ayah: 13,
      text: 'أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ',
      latin: 'ara’aita in kādzdzaba wa tawallā',
    },
    {
      ayah: 14,
      text: 'أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ',
      latin: 'a lam ya‘lam bi’annallāha yarā',
    },
    {
      ayah: 15,
      text: 'كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ',
      latin: 'kallā la’il lam yantahi lanasfa‘am bin-nāṣhiyah',
    },
    {
      ayah: 16,
      text: 'نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ',
      latin: 'nāṣhiyating kādzībatin khāṭhi’ah',
    },
    {
      ayah: 17,
      text: 'فَلْيَدْعُ نَادِيَهُ',
      latin: 'fal-yad‘u nādīyah',
    },
    {
      ayah: 18,
      text: 'سَنَدْعُ الزَّبَانِيَةَ',
      latin: 'sanad‘uz-zabānīyah',
    },
    {
      ayah: 19,
      text: 'كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ',
      latin: 'kallā lā tuṭhi‘hu wasjud waqtarib',
    },
  ],
},
{
  name: 'At-Tin',
  number: 95,
  verses: [
    {
      ayah: 1,
      text: 'وَالتِّينِ وَالزَّيْتُونِ',
      latin: 'wat-tīni waz-zaitūn',
    },
    {
      ayah: 2,
      text: 'وَطُورِ سِينِينَ',
      latin: 'wa ṭhūri sīnīn',
    },
    {
      ayah: 3,
      text: 'وَهَٰذَا الْبَلَدِ الْأَمِينِ',
      latin: 'wa hādzāl-baladil-amīn',
    },
    {
      ayah: 4,
      text: 'لَقَدْ خَلَقْنَا الْإِنْسَانَ فِي أَحْسَنِ تَقْوِيمٍ',
      latin: 'laqad khalaqnāl-insāna fī aḥsani taqwīm',
    },
    {
      ayah: 5,
      text: 'ثُمَّ رَدَدْنَاهُ أَسْفَلَ سَافِلِينَ',
      latin: 'tsumma radadnāhu asfalā sāfilīn',
    },
    {
      ayah: 6,
      text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ',
      latin: 'illālladzīna āmanū wa ‘amilūṣh-ṣhāliḥāti fa lahum ajrun ghairu mamnūn',
    },
    {
      ayah: 7,
      text: 'فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ',
      latin: 'fa mā yukadzdzibuka ba‘du bid-dīn',
    },
    {
      ayah: 8,
      text: 'أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَاكِمِينَ',
      latin: 'a laisallāhu bi’aḥkamil-ḥākimīn',
    },
  ],
},
{
  name: 'Al-insyirah',
  number: 94,
  verses: [
    {
      ayah: 1,
      text: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
      latin: 'a lam nasyraḥ laka ṣhadrak',
    },
    {
      ayah: 2,
      text: 'وَوَضَعْنَا عَنْكَ وِزْرَكَ',
      latin: 'wa waḍa‘nā ‘anka wizrak',
    },
    {
      ayah: 3,
      text: 'الَّذِي أَنْقَضَ ظَهْرَكَ',
      latin: 'alladzī anqaḍa dhahrak',
    },
    {
      ayah: 4,
      text: 'وَرَفَعْنَا لَكَ ذِكْرَكَ',
      latin: 'wa rafa‘nā laka dzikrak',
    },
    {
      ayah: 5,
      text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      latin: 'fa inna ma‘al-‘usri yusra',
    },
    {
      ayah: 6,
      text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      latin: 'inna ma‘al-‘usri yusra',
    },
    {
      ayah: 7,
      text: 'فَإِذَا فَرَغْتَ فَانْصَبْ',
      latin: 'fa idzā faraghta fanshab',
    },
    {
      ayah: 8,
      text: 'وَإِلَىٰ رَبِّكَ فَارْغَبْ',
      latin: 'wa ilā rabbika farghab',
    },
  ],
},
{
  name: 'Adh-Dhuha',
  number: 93,
  verses: [
    {
      ayah: 1,
      text: 'وَالضُّحَىٰ',
      latin: 'wad-duḥā',
    },
    {
      ayah: 2,
      text: 'وَاللَّيْلِ إِذَا سَجَىٰ',
      latin: 'wal-laili idzā sajā',
    },
    {
      ayah: 3,
      text: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
      latin: 'mā wadda‘aka rabbuka wa mā qalā',
    },
    {
      ayah: 4,
      text: 'وَلَلْآخِرَةُ خَيْرٌ لَكَ مِنَ الْأُولَىٰ',
      latin: 'wa lal-ākhiratu khairul laka minal-ūlā',
    },
    {
      ayah: 5,
      text: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
      latin: 'wa lasaufa yu‘ṭhīka rabbuka fa tarḍā',
    },
    {
      ayah: 6,
      text: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ',
      latin: 'a lam yajidka yatīman fa āwā',
    },
    {
      ayah: 7,
      text: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
      latin: 'wa wajadaka ḍāllan fa hadā',
    },
    {
      ayah: 8,
      text: 'وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ',
      latin: 'wa wajadaka ‘ā’ilan fa aghnā',
    },
    {
      ayah: 9,
      text: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ',
      latin: 'fa ammāl-yatīma fa lā taq-har',
    },
    {
      ayah: 10,
      text: 'وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ',
      latin: 'wa ammās-sā’ila fa lā tan-har',
    },
    {
      ayah: 11,
      text: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
      latin: 'wa ammā bini‘mati rabbika fa-hadits',
    },
  ],
},
{
  name: 'Al-Lail',
  number: 92,
  verses: [
    {
      ayah: 1,
      text: 'وَاللَّيْلِ إِذَا يَغْشَىٰ',
      latin: 'wal-laili idzā yaghsyā',
    },
    {
      ayah: 2,
      text: 'وَالنَّهَارِ إِذَا تَجَلَّىٰ',
      latin: 'wan-nahāri idzā tajallā',
    },
    {
      ayah: 3,
      text: 'وَمَا خَلَقَ الذَّكَرَ وَالْأُنْثَىٰ',
      latin: 'wa mā khalaqadz-dzakara wal-untsā',
    },
    {
      ayah: 4,
      text: 'إِنَّ سَعْيَكُمْ لَشَتَّىٰ',
      latin: 'inna sa‘yākum lasyattā',
    },
    {
      ayah: 5,
      text: 'فَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ',
      latin: 'fa ammā man a‘ṭhā waittaqā',
    },
    {
      ayah: 6,
      text: 'وَصَدَّقَ بِالْحُسْنَىٰ',
      latin: 'wa ṣhaddaqa bil-ḥusnā',
    },
    {
      ayah: 7,
      text: 'فَسَنُيَسِّرُهُ لِلْيُسْرَىٰ',
      latin: 'fa sanuyassiruhu lil-yusrā',
    },
    {
      ayah: 8,
      text: 'وَأَمَّا مَنْ بَخِلَ وَاسْتَغْنَىٰ',
      latin: 'wa ammā man bakhila wasṭaghna',
    },
    {
      ayah: 9,
      text: 'وَكَذَّبَ بِالْحُسْنَىٰ',
      latin: 'wa kadzdzaba bil-ḥusnā',
    },
    {
      ayah: 10,
      text: 'فَسَنُيَسِّرُهُ لِلْعُسْرَىٰ',
      latin: 'fa sanuyassiruhu lil-‘usrá',
    },
    {
      ayah: 11,
      text: 'وَمَا يُغْنِي عَنْهُ مَالُهُ إِذَا تَرَدَّىٰ',
      latin: 'wa mā yughni ‘anhu māluhu idzā taraddā',
    },
    {
      ayah: 12,
      text: 'إِنَّ عَلَيْنَا لَلْهُدَىٰ',
      latin: 'inna ‘alaina lal-hudā',
    },
    {
      ayah: 13,
      text: 'وَإِنَّ لَنَا لَلْآخِرَةَ وَالْأُولَىٰ',
      latin: 'wa inna lanā lal-ākhirata wal-ūlā',
    },
    {
      ayah: 14,
      text: 'فَأَنْذَرْتُكُمْ نَارًا تَلَظَّىٰ',
      latin: 'fa andzartukum nāran taladhdhā',
    },
    {
      ayah: 15,
      text: 'لَا يَصْلَاهَا إِلَّا الْأَشْقَى',
      latin: 'lā yaṣlāhā illāl-asyqā',
    },
    {
      ayah: 16,
      text: 'الَّذِي كَذَّبَ وَتَوَلَّىٰ',
      latin: 'alladzī kadzdzaba wa tawallā',
    },
    {
      ayah: 17,
      text: 'وَسَيُجَنَّبُهَا الْأَتْقَى',
      latin: 'wa sayujannabuhal-atqā',
    },
    {
      ayah: 18,
      text: 'الَّذِي يُؤْتِي مَالَهُ يَتَزَكَّىٰ',
      latin: 'alladhī yu’tī mālahu yatzakkā',
    },
    {
      ayah: 19,
      text: 'وَمَا لِأَحَدٍ عِنْدَهُ مِنْ نِعْمَةٍ تُجْزَىٰ',
      latin: 'wa mā li’aḥadin ‘indahu min ni‘mātin tujzā',
    },
    {
      ayah: 20,
      text: 'إِلَّا ابْتِغَاءَ وَجْهِ رَبِّهِ الْأَعْلَىٰ',
      latin: 'illābtighā’a waj-hi rabbihil-a‘lā',
    },
    {
      ayah: 21,
      text: 'وَلَسَوْفَ يَرْضَىٰ',
      latin: 'wa lasaufa yarḍā',
    },
  ],
},
{
  name: 'Asy-Syams',
  number: 91,
  verses: [
    {
      ayah: 1,
      text: 'وَالشَّمْسِ وَضُحَاهَا',
      latin: 'wasy-syamsi wa ḍuḥāhā',
    },
    {
      ayah: 2,
      text: 'وَالْقَمَرِ إِذَا تَلَاهَا',
      latin: 'wal-qamari idzā talāhā',
    },
    {
      ayah: 3,
      text: 'وَالنَّهَارِ إِذَا جَلَّاهَا',
      latin: 'wan-nahāri idzā jallāhā',
    },
    {
      ayah: 4,
      text: 'وَاللَّيْلِ إِذَا يَغْشَاهَا',
      latin: 'wal-laili idzā yaghsyāhā',
    },
    {
      ayah: 5,
      text: 'وَالسَّمَاءِ وَمَا بَنَاهَا',
      latin: 'was-samā’i wa mā banāhā',
    },
    {
      ayah: 6,
      text: 'وَالْأَرْضِ وَمَا طَحَاهَا',
      latin: 'wal-arḍi wa mā ṭaḥāhā',
    },
    {
      ayah: 7,
      text: 'وَنَفْسٍ وَمَا سَوَّاهَا',
      latin: 'wa nafsiw wa mā sawwāhā',
    },
    {
      ayah: 8,
      text: 'فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا',
      latin: 'fa al-hamahā fujūrahā wa taqwāhā',
    },
    {
      ayah: 9,
      text: 'قَدْ أَفْلَحَ مَنْ زَكَّاهَا',
      latin: 'qad aflaha man zakkāhā',
    },
    {
      ayah: 10,
      text: 'وَقَدْ خَابَ مَنْ دَسَّاهَا',
      latin: 'wa qad khāba man dassāhā',
    },
    {
      ayah: 11,
      text: 'كَذَّبَتْ ثَمُودُ بِطَغْوَاهَا',
      latin: 'kadzdzabats tsamūdu biṭhaghwāhā',
    },
    {
      ayah: 12,
      text: 'إِذِ انْبَعَثَ أَشْقَاهَا',
      latin: 'idzimba‘atsa asyqāhā',
    },
    {
      ayah: 13,
      text: 'فَقَالَ لَهُمْ رَسُولُ اللَّهِ نَاقَةَ اللَّهِ وَسُقْيَاهَا',
      latin: 'fa qāla lahum rasūlullāhi nāqatallāhi wa suqyāhā',
    },
    {
      ayah: 14,
      text: 'فَكَذَّبُوهُ فَعَقَرُوهَا فَدَمْدَمَ عَلَيْهِمْ رَبُّهُمْ بِذَنْبِهِمْ فَسَوَّاهَا',
      latin: 'fa kadzdzabūhū fa-‘aqarūhā fa damdama ‘alaihim rabbuhum bidzambihim fasawwāhā'
    },
    {
      ayah: 15,
      text: 'وَلَا يَخَافُ عُقْبَاهَا',
      latin: 'wa lā yakhāfu ‘uqbāhā',
    },
  ],
},
{
  name: 'Al-Balad',
  number: 90,
  verses: [
    {
      ayah: 1,
      text: 'لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ',
      latin: 'lā uqsimu bihādzāl-balad',
    },
    {
      ayah: 2,
      text: 'وَأَنْتَ حِلٌّ بِهَٰذَا الْبَلَدِ',
      latin: 'wa anta ḥillum bihādzāl-balad',
    },
    {
      ayah: 3,
      text: 'وَوَالِدٍ وَمَا وَلَدَ',
      latin: 'wa wālidiw wa mā walad',
    },
    {
      ayah: 4,
      text: 'لَقَدْ خَلَقْنَا الْإِنْسَانَ فِي كَبَدٍ',
      latin: 'laqad khalaqnāl-insāna fī kabad',
    },
    {
      ayah: 5,
      text: 'أَيَحْسَبُ أَنْ لَنْ يَقْدِرَ عَلَيْهِ أَحَدٌ',
      latin: 'a yāḥsabū al lay yaqdirā ‘alaihī aḥad',
    },
    {
      ayah: 6,
      text: 'يَقُولُ أَهْلَكْتُ مَالًا لُبَدًا',
      latin: 'yaqūlu ahlaktū mālal lubadā',
    },
    {
      ayah: 7,
      text: 'أَيَحْسَبُ أَنْ لَمْ يَرَهُ أَحَدٌ',
      latin: 'a yāḥsabū al lam yarahū aḥad',
    },
    {
      ayah: 8,
      text: 'أَلَمْ نَجْعَلْ لَهُ عَيْنَيْنِ',
      latin: 'a lam naj‘al lahu ‘ainain',
    },
    {
      ayah: 9,
      text: 'وَلِسَانًا وَشَفَتَيْنِ',
      latin: 'wa lisānāw wa syafatain',
    },
    {
      ayah: 10,
      text: 'وَهَدَيْنَاهُ النَّجْدَيْنِ',
      latin: 'wa hadaināhūn-najdain',
    },
    {
      ayah: 11,
      text: 'فَلَا اقْتَحَمَ الْعَقَبَةَ',
      latin: 'fa lāqtaḥamal-‘aqabah',
    },
    {
      ayah: 12,
      text: 'وَمَا أَدْرَاكَ مَا الْعَقَبَةُ',
      latin: 'wa mā adrāka māl-‘aqabah',
    },
    {
      ayah: 13,
      text: 'فَكُّ رَقَبَةٍ',
      latin: 'fakkū raqabah',
    },
    {
      ayah: 14,
      text: 'أَوْ إِطْعَامٌ فِي يَوْمٍ ذِي مَسْغَبَةٍ',
      latin: 'au iṭh‘āmun fī yaumīn dzī masghabah',
    },
    {
      ayah: 15,
      text: 'يَتِيمًا ذَا مَقْرَبَةٍ',
      latin: 'yatīman dzā maqrabah',
    },
    {
      ayah: 16,
      text: 'أَوْ مِسْكِينًا ذَا مَتْرَبَةٍ',
      latin: 'au miskīnan dzā matrabah',
    },
    {
      ayah: 17,
      text: 'ثُمَّ كَانَ مِنَ الَّذِينَ آمَنُوا وَتَوَاصَوْا بِالصَّبْرِ وَتَوَاصَوْا بِالْمَرْحَمَةِ',
      latin: 'tsumma kāna minalladzīna āmanū wa tawāṣhau biṣh-ṣhabri wa tawāṣhau bil-mar-ḥamah',
    },
    {
      ayah: 18,
      text: 'أُولَٰئِكَ أَصْحَابُ الْمَيْمَنَةِ',
      latin: 'ulā’ika aṣh-ḥābul-maimanah',
    },
    {
      ayah: 19,
      text: 'وَالَّذِينَ كَفَرُوا بِآيَاتِنَا هُمْ أَصْحَابُ الْمَشْأَمَةِ',
      latin: 'walladzīna kafarū bi’āyātinā hum aṣḥ-hābul-mašy’amah',
    },
    {
      ayah: 20,
      text: 'عَلَيْهِمْ نَارٌ مُؤْصَدَةٌ',
      latin: 'ʿalaihim nārum mu’ṣhadah',
    },
  ],
},
{
  name: 'Al-Fajr',
  number: 89,
  verses: [
    {
      ayah: 1,
      text: 'وَالْفَجْرِ',
      latin: 'wal-fajr',
    },
    {
      ayah: 2,
      text: 'وَلَيَالٍ عَشْرٍ',
      latin: 'wa layālin ‘asyr',
    },
    {
      ayah: 3,
      text: 'وَالشَّفْعِ وَالْوَتْرِ',
      latin: 'wasy-syaf‘i wal-watr',
    },
    {
      ayah: 4,
      text: 'وَاللَّيْلِ إِذَا يَسْرِ',
      latin: 'wal-laili idzā yasr',
    },
    {
      ayah: 5,
      text: 'هَلْ فِي ذَٰلِكَ قَسَمٌ لِذِي حِجْرٍ',
      latin: 'hal fī dzālika qasamul lidzī ḥijr',
    },
    {
      ayah: 6,
      text: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ',
      latin: 'a lam tarā kaifa fa‘ala rabbuka bi‘Ād',
    },
    {
      ayah: 7,
      text: 'إِرَمَ ذَاتِ الْعِمَادِ',
      latin: 'irama dzātil-‘imād',
    },
    {
      ayah: 8,
      text: 'الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ',
      latin: 'allatī lam yukhlaq mitsluhā fīl-bilād',
    },
    {
      ayah: 9,
      text: 'وَثَمُودَ الَّذِينَ جَابُوا الصَّخْرَ بِالْوَادِ',
      latin: 'wa tsamūdālladzīna jābūṣh-ṣhakhra bil-wād',
    },
    {
      ayah: 10,
      text: 'وَفِرْعَوْنَ ذِي الْأَوْتَادِ',
      latin: 'wa fir‘auna dzīl-autād',
    },
    {
      ayah: 11,
      text: 'الَّذِينَ طَغَوْا فِي الْبِلَادِ',
      latin: 'alladzīna ṭaghau fīl-bilād',
    },
    {
      ayah: 12,
      text: 'فَأَكْثَرُوا فِيهَا الْفَسَادَ',
      latin: 'fa aktsarū fīhāl-fasād',
    },
    {
      ayah: 13,
      text: 'فَصَبَّ عَلَيْهِمْ رَبُّكَ سَوْطَ عَذَابٍ',
      latin: 'fa ṣhabba ‘alaihim rabbuka sauṭa ‘adzāb',
    },
    {
      ayah: 14,
      text: 'إِنَّ رَبَّكَ لَبِالْمِرْصَادِ',
      latin: 'inna rabbaka labīl-mirṣhād',
    },
    {
      ayah: 15,
      text: 'فَأَمَّا الْإِنْسَانُ إِذَا مَا ابْتَلَاهُ رَبُّهُ فَأَكْرَمَهُ وَنَعَّمَهُ فَيَقُولُ رَبِّي أَكْرَمَنِ',
      latin: 'fa ammāl-insānu idzā mābtalāhu rabbuhu fa akramahu wa na‘amahu fa yaqūlu rabbi akraman',
    },
    {
      ayah: 16,
      text: 'وَأَمَّا إِذَا مَا ابْتَلَاهُ فَقَدَرَ عَلَيْهِ رِزْقَهُ فَيَقُولُ رَبِّي أَهَانَنِ',
      latin: 'wa ammā idzā mābtalāhu fa qadara ‘alaihi rizqahu fa yaqūlu rabbi ahānan',
    },
    {
      ayah: 17,
      text: 'كَلَّا بَلْ لَا تُكْرِمُونَ الْيَتِيمَ',
      latin: 'kallā bal lā tukrimūnal-yatīm',
    },
    {
      ayah: 18,
      text: 'وَلَا تَحَاضُّونَ عَلَىٰ طَعَامِ الْمِسْكِينِ',
      latin: 'wa lā taḥāḍḍūna ʿalā ṭhaʿāmil-miskīn',
    },
    {
      ayah: 19,
      text: 'وَتَأْكُلُونَ التُّرَاثَ أَكْلًا لَمًّا',
      latin: 'wa ta’kulūnat-turātsa aklal lammā',
    },
    {
      ayah: 20,
      text: 'وَتُحِبُّونَ الْمَالَ حُبًّا جَمًّا',
      latin: 'wa tuḥibbūnal-māla ḥubban jammā',
    },
    {
      ayah: 21,
      text: 'كَلَّا إِذَا دُكَّتِ الْأَرْضُ دَكًّا دَكًّا',
      latin: 'kallā idzā dukkatil-arḍu dakkan dakka',
    },
    {
      ayah: 22,
      text: 'وَجَاءَ رَبُّكَ وَالْمَلَكُ صَفًّا صَفًّا',
      latin: 'wa jā’a rabbuka wal-malaku ṣhaffan ṣaffa',
    },
    {
      ayah: 23,
      text: 'وَجِيءَ يَوْمَئِذٍ بِجَهَنَّمَ يَوْمَئِذٍ يَتَذَكَّرُ الْإِنْسَانُ وَأَنَّىٰ لَهُ الذِّكْرَىٰ',
      latin: 'wa jī’a yauma’idzim bijahannama yauma’idziy yatadzakkarul-insānu wa-annā lahudz-dzikra',
    },
    {
      ayah: 24,
      text: 'يَقُولُ يَا لَيْتَنِي قَدَّمْتُ لِحَيَاتِي',
      latin: 'yaqulu laitanī qaddamtu liḥayātī',
    },
    {
      ayah: 25,
      text: 'فَيَوْمَئِذٍ لَا يُعَذِّبُ عَذَابَهُ أَحَدٌ',
      latin: 'fa yauma’idzil lā yu‘adzdzibu ‘adzābahu aḥad',
    },
    {
      ayah: 26,
      text: 'وَلَا يُوثِقُ وَثَاقَهُ أَحَدٌ',
      latin: 'wa lā yūtsiqu watsāqahu aḥad',
    },
    {
      ayah: 27,
      text: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ',
      latin: 'yā ayyatuhān-nafsul-muṭhma’innah',
    },
    {
      ayah: 28,
      text: 'ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَرْضِيَّةً',
      latin: 'irji‘ī ilā rabbiki rāḍiyatam marḍiyyah',
    },
    {
      ayah: 29,
      text: 'فَادْخُلِي فِي عِبَادِي',
      latin: 'fadkhulī fī ʿibādī',
    },
    {
      ayah: 30,
      text: 'وَادْخُلِي جَنَّتِي',
      latin: 'wadkhulī jannatī',
    },
  ],
},
{
  name: 'Al-Ghasyiyah',
  number: 88,
  verses: [
    {
      ayah: 1,
      text: 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ',
      latin: 'hal atāka ḥadītsul-ghāsyiyah',
    },
    {
      ayah: 2,
      text: 'وُجُوهٌ يَوْمَئِذٍ خَاشِعَةٌ',
      latin: 'wujūhuy yauma’idzin khāsyi‘ah',
    },
    {
      ayah: 3,
      text: 'عَامِلَةٌ نَاصِبَةٌ',
      latin: 'ʿāmilatun nāṣhibah',
    },
    {
      ayah: 4,
      text: 'تَصْلَىٰ نَارًا حَامِيَةً',
      latin: 'taṣhlā nāran ḥāmiyah',
    },
    {
      ayah: 5,
      text: 'تُسْقَىٰ مِنْ عَيْنٍ آنِيَةٍ',
      latin: 'tusqā min ‘ainin āniyah',
    },
    {
      ayah: 6,
      text: 'لَيْسَ لَهُمْ طَعَامٌ إِلَّا مِنْ ضَرِيعٍ',
      latin: 'laisa lahum ṭha‘āmun illā min ḍarī‘',
    },
    {
      ayah: 7,
      text: 'لَا يُسْمِنُ وَلَا يُغْنِي مِنْ جُوعٍ',
      latin: 'lā yusminu wa lā yughni min jū‘',
    },
    {
      ayah: 8,
      text: 'وُجُوهٌ يَوْمَئِذٍ نَاعِمَةٌ',
      latin: 'wujūhuy yauma’idzin nā‘imah',
    },
    {
      ayah: 9,
      text: 'لِسَعْيِهَا رَاضِيَةٌ',
      latin: 'lisa‘yihā rāḍiyah',
    },
    {
      ayah: 10,
      text: 'فِي جَنَّةٍ عَالِيَةٍ',
      latin: 'fī jannatin ‘āliyah',
    },
    {
      ayah: 11,
      text: 'لَا تَسْمَعُ فِيهَا لَاغِيَةً',
      latin: 'lā tasma‘u fīhā lāghiyah',
    },
    {
      ayah: 12,
      text: 'فِيهَا عَيْنٌ جَارِيَةٌ',
      latin: 'fīhā ‘ainun jāriyah',
    },
    {
      ayah: 13,
      text: 'فِيهَا سُرُرٌ مَرْفُوعَةٌ',
      latin: 'fīhā sururum marfū‘ah',
    },
    {
      ayah: 14,
      text: 'وَأَكْوَابٌ مَوْضُوعَةٌ',
      latin: 'wa akwābum mauḍū‘ah',
    },
    {
      ayah: 15,
      text: 'وَنَمَارِقُ مَصْفُوفَةٌ',
      latin: 'wa namāriqu maṣhfūfah',
    },
    {
      ayah: 16,
      text: 'وَزَرَابِيُّ مَبْثُوثَةٌ',
      latin: 'wa zarābīyyu mabtsūtsah',
    },
    {
      ayah: 17,
      text: 'أَفَلَا يَنْظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ',
      latin: 'a fa lā yandhurūna ilāl-ibili kaifa khuliqat',
    },
    {
      ayah: 18,
      text: 'وَإِلَى السَّمَاءِ كَيْفَ رُفِعَتْ',
      latin: 'wa ilās-samā’i kaifa rufi‘at',
    },
    {
      ayah: 19,
      text: 'وَإِلَى الْجِبَالِ كَيْفَ نُصِبَتْ',
      latin: 'wa ilāl-jibāli kaifa nuṣhibat',
    },
    {
      ayah: 20,
      text: 'وَإِلَى الْأَرْضِ كَيْفَ سُطِحَتْ',
      latin: 'wa ilāl-arḍi kaifa suṭhiḥat',
    },
    {
      ayah: 21,
      text: 'فَذَكِّرْ إِنَّمَا أَنْتَ مُذَكِّرٌ',
      latin: 'fa dzakkir innamā anta mudzakkir',
    },
    {
      ayah: 22,
      text: 'لَسْتَ عَلَيْهِمْ بِمُصَيْطِرٍ',
      latin: 'lasta ‘alaihim bimuṣaiṭhir',
    },
    {
      ayah: 23,
      text: 'إِلَّا مَنْ تَوَلَّىٰ وَكَفَرَ',
      latin: 'illā man tawallā wa kafar',
    },
    {
      ayah: 24,
      text: 'فَيُعَذِّبُهُ اللَّهُ الْعَذَابَ الْأَكْبَرَ',
      latin: 'fa yu‘adzdzibuhullāhul-‘adzābal-akbar',
    },
    {
      ayah: 25,
      text: 'إِنَّ إِلَيْنَا إِيَابَهُمْ',
      latin: 'innā ilāina iyābahum',
    },
    {
      ayah: 26,
      text: 'ثُمَّ إِنَّ عَلَيْنَا حِسَابَهُمْ',
      latin: 'tsumma innā ‘alaina ḥisābahum',
    },
  ],
},
{
  name: 'Al-Ala',
  number: 87,
  verses: [
    {
      ayah: 1,
      text: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى',
      latin: 'sabbihisma rabbikal-a‘lā',
    },
    {
      ayah: 2,
      text: 'الَّذِي خَلَقَ فَسَوَّىٰ',
      latin: 'alladzī khalaqa fa sawwā',
    },
    {
      ayah: 3,
      text: 'وَالَّذِي قَدَّرَ فَهَدَىٰ',
      latin: 'walladzī qaddara fa hadā',
    },
    {
      ayah: 4,
      text: 'وَالَّذِي أَخْرَجَ الْمَرْعَىٰ',
      latin: 'walladzī akhrajal-mar‘ā',
    },
    {
      ayah: 5,
      text: 'فَجَعَلَهُ غُثَاءً أَحْوَىٰ',
      latin: 'fa ja‘alahu ghutsā’an aḥwā',
    },
    {
      ayah: 6,
      text: 'سَنُقْرِئُكَ فَلَا تَنْسَىٰ',
      latin: 'sanuqri’uka fa lā tansa',
    },
    {
      ayah: 7,
      text: 'إِلَّا مَا شَاءَ اللَّهُ إِنَّهُ يَعْلَمُ الْجَهْرَ وَمَا يَخْفَىٰ',
      latin: 'illā mā syā’allāhu innahu ya‘lamul-jahrā wa mā yakhfā',
    },
    {
      ayah: 8,
      text: 'وَنُيَسِّرُكَ لِلْيُسْرَىٰ',
      latin: 'wa nuyassiruka lil-yusrā',
    },
    {
      ayah: 9,
      text: 'فَذَكِّرْ إِنْ نَفَعَتِ الذِّكْرَىٰ',
      latin: 'fa dzakkir in nafā’atidz-dzikrā',
    },
    {
      ayah: 10,
      text: 'سَيَذَّكَّرُ مَنْ يَخْشَىٰ',
      latin: 'sayadzdzakaru may yakhshā',
    },
    {
      ayah: 11,
      text: 'وَيَتَجَنَّبُهَا الْأَشْقَى',
      latin: 'wa yatajannabuhal-asyqā',
    },
    {
      ayah: 12,
      text: 'الَّذِي يَصْلَى النَّارَ الْكُبْرَىٰ',
      latin: 'alladzī yaṣhlān-nāral-kubrā',
    },
    {
      ayah: 13,
      text: 'ثُمَّ لَا يَمُوتُ فِيهَا وَلَا يَحْيَىٰ',
      latin: 'tsumma lā yamūtu fīhā wa lā yaḥyā',
    },
    {
      ayah: 14,
      text: 'قَدْ أَفْلَحَ مَنْ تَزَكَّىٰ',
      latin: 'qad aflaha man tazakkā',
    },
    {
      ayah: 15,
      text: 'وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ',
      latin: 'wa dzakarasma rabbihi fa ṣhallā',
    },
    {
      ayah: 16,
      text: 'بَلْ تُؤْثِرُونَ الْحَيَاةَ الدُّنْيَا',
      latin: 'bal tu’tsirūnal-ḥayātad-dun-yā',
    },
    {
      ayah: 17,
      text: 'وَالْآخِرَةُ خَيْرٌ وَأَبْقَىٰ',
      latin: 'wal-ākhiratu khairuw wa abqā',
    },
    {
      ayah: 18,
      text: 'إِنَّ هَٰذَا لَفِي الصُّحُفِ الْأُولَىٰ',
      latin: 'innā hādzā lafīsh-shuḥufil-ūlā',
    },
    {
      ayah: 19,
      text: 'صُحُفِ إِبْرَاهِيمَ وَمُوسَىٰ',
      latin: 'ṣhuḥufi ibrāhīma wa mūsā',
    },
  ],
},
];

//File Baru