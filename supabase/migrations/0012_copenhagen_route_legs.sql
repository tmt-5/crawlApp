-- Walking legs for the København routes in 0011, from OSRM (FOSSGIS foot profile),
-- in the format scripts/compute-route-legs.mjs writes. Computed from the
-- coordinates in 0011 so both files can be run together. Re-run that script
-- after changing a route's stops.

update route_venues rv set
  leg_geometry = '[[12.581542,55.677279],[12.581535,55.677274],[12.581659,55.677216],[12.582251,55.677477],[12.58235,55.677497],[12.582436,55.677514],[12.583052,55.677676],[12.583722,55.677856],[12.58439,55.678023],[12.58413,55.678312],[12.583957,55.678688],[12.584655,55.67874],[12.584853,55.678763],[12.584922,55.678763],[12.584971,55.678759],[12.584978,55.678811],[12.58498,55.678854],[12.58496,55.679144],[12.584941,55.679424],[12.584933,55.679546],[12.584944,55.679602],[12.584998,55.679644],[12.585016,55.679657],[12.585039,55.679674],[12.585029,55.679699],[12.585016,55.67973],[12.584876,55.679717],[12.584741,55.679705]]'::jsonb,
  leg_distance_m = 478,
  leg_duration_s = 384,
  leg_steps = '[{"type":"depart","modifier":"straight","name":null,"distance":11,"duration":9,"location":[12.581538,55.677282]},{"type":"end of road","modifier":"left","name":"Boldhusgade","distance":54,"duration":43,"location":[12.581659,55.677216]},{"type":"new name","modifier":"straight","name":"Laksegade","distance":221,"duration":176,"location":[12.58235,55.677497]},{"type":"end of road","modifier":"right","name":"Vingårdstræde","distance":168,"duration":135,"location":[12.583957,55.678688]},{"type":"turn","modifier":"left","name":null,"distance":6,"duration":5,"location":[12.585039,55.679674]},{"type":"turn","modifier":"left","name":"Lille Kongensgade","distance":18,"duration":16,"location":[12.585016,55.67973]},{"type":"arrive","modifier":"right","name":"Lille Kongensgade","distance":0,"duration":0,"location":[12.584741,55.679705]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'indre-by-rundt'
  and v.name = 'Hviids Vinstue';

update route_venues rv set
  leg_geometry = '[[12.584741,55.679705],[12.584674,55.679699],[12.582984,55.679367],[12.582916,55.679357],[12.582726,55.679644],[12.582619,55.679618],[12.582588,55.679676],[12.582482,55.679638],[12.582366,55.679594],[12.582335,55.679645],[12.581861,55.679482],[12.581811,55.679466],[12.581301,55.679333],[12.581228,55.679318],[12.580839,55.679998],[12.5808,55.680068],[12.580741,55.680148],[12.580727,55.680203],[12.580453,55.680604],[12.580201,55.680858],[12.580098,55.680922],[12.579947,55.680981],[12.579065,55.681258],[12.578872,55.681335],[12.578816,55.681258],[12.578544,55.681082]]'::jsonb,
  leg_distance_m = 590,
  leg_duration_s = 472,
  leg_steps = '[{"type":"depart","modifier":"right","name":"Lille Kongensgade","distance":121,"duration":97,"location":[12.584741,55.679705]},{"type":"turn","modifier":"right","name":null,"distance":34,"duration":27,"location":[12.582916,55.679357]},{"type":"turn","modifier":"left","name":"Østergade","distance":14,"duration":11,"location":[12.582726,55.679644]},{"type":"continue","modifier":"left","name":"Østergade","distance":101,"duration":81,"location":[12.582588,55.679676]},{"type":"turn","modifier":"right","name":"Pilestræde","distance":283,"duration":227,"location":[12.581228,55.679318]},{"type":"turn","modifier":"left","name":"Klareboderne","distance":35,"duration":28,"location":[12.578872,55.681335]},{"type":"arrive","modifier":"left","name":"Klareboderne","distance":0,"duration":0,"location":[12.578544,55.681082]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'indre-by-rundt'
  and v.name = 'Bo-Bi Bar';

update route_venues rv set
  leg_geometry = '[[12.578544,55.681082],[12.578255,55.680894],[12.577979,55.680696],[12.577898,55.680637],[12.578412,55.68045],[12.578339,55.680401],[12.577636,55.679936]]'::jsonb,
  leg_distance_m = 178,
  leg_duration_s = 142,
  leg_steps = '[{"type":"depart","modifier":"left","name":"Klareboderne","distance":64,"duration":51,"location":[12.578544,55.681082]},{"type":"turn","modifier":"left","name":"Købmagergade","distance":39,"duration":31,"location":[12.577898,55.680637]},{"type":"turn","modifier":"right","name":"Valkendorfsgade","distance":75,"duration":60,"location":[12.578412,55.68045]},{"type":"arrive","modifier":"left","name":"Valkendorfsgade","distance":0,"duration":0,"location":[12.577636,55.679936]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'indre-by-rundt'
  and v.name = 'Balderdash';

update route_venues rv set
  leg_geometry = '[[12.577636,55.679936],[12.577176,55.679631],[12.577107,55.679604],[12.577139,55.679548],[12.577179,55.679447],[12.577248,55.679346],[12.577286,55.679304],[12.577505,55.679058],[12.577132,55.678881],[12.576553,55.678734],[12.576529,55.678727],[12.576631,55.67871],[12.576652,55.67864],[12.576683,55.678641],[12.576712,55.678591],[12.576775,55.678485],[12.576866,55.678333],[12.576905,55.678265],[12.576968,55.678162],[12.577016,55.678076],[12.57706,55.677988],[12.577108,55.677888],[12.577136,55.677833],[12.576901,55.677779],[12.57695,55.677704],[12.577253,55.67734],[12.577486,55.677132],[12.577384,55.677068],[12.576722,55.67664]]'::jsonb,
  leg_distance_m = 469,
  leg_duration_s = 375,
  leg_steps = '[{"type":"depart","modifier":"left","name":"Valkendorfsgade","distance":50,"duration":40,"location":[12.577636,55.679936]},{"type":"turn","modifier":"left","name":null,"distance":66,"duration":53,"location":[12.577107,55.679604]},{"type":"end of road","modifier":"right","name":null,"distance":72,"duration":58,"location":[12.577505,55.679058]},{"type":"turn","modifier":"sharp left","name":"Vimmelskaftet","distance":7,"duration":5,"location":[12.576529,55.678727]},{"type":"turn","modifier":"right","name":"Amagertorv","distance":104,"duration":83,"location":[12.576631,55.67871]},{"type":"end of road","modifier":"right","name":"Læderstræde","distance":16,"duration":13,"location":[12.577136,55.677833]},{"type":"turn","modifier":"left","name":"Naboløs","distance":81,"duration":65,"location":[12.576901,55.677779]},{"type":"end of road","modifier":"right","name":"Nybrogade","distance":73,"duration":58,"location":[12.577486,55.677132]},{"type":"arrive","modifier":"right","name":"Nybrogade","distance":0,"duration":0,"location":[12.576722,55.67664]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'indre-by-rundt'
  and v.name = 'Ruby';

update route_venues rv set
  leg_geometry = '[[12.549836,55.674084],[12.549865,55.673857],[12.549927,55.673418],[12.55123,55.673543],[12.55126,55.673552],[12.551285,55.673565],[12.551305,55.67358],[12.551319,55.673599],[12.551544,55.673552],[12.551554,55.673528],[12.551464,55.673519],[12.551384,55.67351],[12.55139,55.673469],[12.551403,55.673375],[12.55141,55.673349],[12.551432,55.67335],[12.551447,55.673242],[12.551671,55.673249],[12.551666,55.673309]]'::jsonb,
  leg_distance_m = 247,
  leg_duration_s = 198,
  leg_steps = '[{"type":"depart","modifier":"left","name":"Værnedamsvej","distance":74,"duration":59,"location":[12.549836,55.674084]},{"type":"turn","modifier":"left","name":"Tullinsgade","distance":92,"duration":73,"location":[12.549927,55.673418]},{"type":"turn","modifier":"right","name":null,"distance":15,"duration":12,"location":[12.551319,55.673599]},{"type":"turn","modifier":"right","name":null,"distance":3,"duration":2,"location":[12.551544,55.673552]},{"type":"turn","modifier":"right","name":null,"distance":63,"duration":50,"location":[12.551554,55.673528]},{"type":"arrive","modifier":null,"name":null,"distance":0,"duration":0,"location":[12.551666,55.673309]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'vesterbro-til-koedbyen'
  and v.name = 'Lidkoeb';

update route_venues rv set
  leg_geometry = '[[12.551666,55.673309],[12.551662,55.673367],[12.551759,55.673375],[12.55177,55.673208],[12.551881,55.673208],[12.551898,55.673208],[12.551901,55.672871],[12.551896,55.672774],[12.551892,55.672706],[12.551888,55.672653],[12.552468,55.672611],[12.552467,55.672564],[12.552543,55.671855]]'::jsonb,
  leg_distance_m = 222,
  leg_duration_s = 178,
  leg_steps = '[{"type":"depart","modifier":null,"name":null,"distance":39,"duration":32,"location":[12.551666,55.673309]},{"type":"turn","modifier":"right","name":null,"distance":62,"duration":49,"location":[12.551898,55.673208]},{"type":"end of road","modifier":"left","name":"Vesterbrogade","distance":37,"duration":29,"location":[12.551888,55.672653]},{"type":"turn","modifier":"right","name":"Dannebrogsgade","distance":84,"duration":68,"location":[12.552468,55.672611]},{"type":"arrive","modifier":"right","name":"Dannebrogsgade","distance":0,"duration":0,"location":[12.552543,55.671855]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'vesterbro-til-koedbyen'
  and v.name = 'Duck and Cover';

update route_venues rv set
  leg_geometry = '[[12.552543,55.671855],[12.552467,55.672564],[12.552468,55.672611],[12.552741,55.672588],[12.55329,55.672537],[12.553667,55.672501],[12.553806,55.672488],[12.553903,55.672447],[12.553935,55.672438],[12.553976,55.672432],[12.554597,55.672366],[12.554673,55.672355],[12.554738,55.672343],[12.554778,55.672335],[12.554884,55.672317],[12.554956,55.672308],[12.555391,55.672263],[12.555417,55.672261],[12.555439,55.672263],[12.555459,55.672268],[12.555518,55.672297],[12.55564,55.67233],[12.555794,55.672351],[12.555903,55.672368],[12.556215,55.672418],[12.556546,55.672479],[12.556916,55.672556],[12.557164,55.672608],[12.557287,55.672633],[12.557315,55.67256],[12.55743,55.672347],[12.557574,55.672098],[12.557641,55.671981]]'::jsonb,
  leg_distance_m = 476,
  leg_duration_s = 385,
  leg_steps = '[{"type":"depart","modifier":"left","name":"Dannebrogsgade","distance":84,"duration":68,"location":[12.552543,55.671855]},{"type":"turn","modifier":"right","name":"Vesterbrogade","distance":85,"duration":68,"location":[12.552468,55.672611]},{"type":"turn","modifier":"slight right","name":null,"distance":113,"duration":90,"location":[12.553806,55.672488]},{"type":"new name","modifier":"straight","name":"Vesterbrogade","distance":118,"duration":98,"location":[12.555518,55.672297]},{"type":"turn","modifier":"right","name":"Viktoriagade","distance":76,"duration":61,"location":[12.557287,55.672633]},{"type":"arrive","modifier":"right","name":"Viktoriagade","distance":0,"duration":0,"location":[12.557641,55.671981]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'vesterbro-til-koedbyen'
  and v.name = 'Mikkeller Bar';

update route_venues rv set
  leg_geometry = '[[12.557641,55.671981],[12.557693,55.671931],[12.557814,55.671833],[12.557921,55.671718],[12.558257,55.67139],[12.558568,55.671078],[12.558615,55.671031],[12.558778,55.670865],[12.558934,55.670725],[12.559003,55.670662],[12.559008,55.670658],[12.559012,55.670654],[12.559285,55.670405],[12.559371,55.670326],[12.559617,55.670101],[12.558975,55.669785],[12.55853,55.669565],[12.558394,55.669495],[12.558238,55.669415],[12.55819,55.669389],[12.557334,55.668947],[12.557036,55.668792],[12.556833,55.668692],[12.556795,55.668674],[12.556541,55.668555],[12.55609,55.668347],[12.555724,55.668174],[12.555683,55.668124],[12.555704,55.668113],[12.555808,55.66804],[12.555908,55.668003],[12.556099,55.667972],[12.556208,55.667858]]'::jsonb,
  leg_distance_m = 622,
  leg_duration_s = 500,
  leg_steps = '[{"type":"depart","modifier":"right","name":"Viktoriagade","distance":244,"duration":195,"location":[12.557641,55.671981]},{"type":"end of road","modifier":"right","name":"Halmtorvet","distance":332,"duration":266,"location":[12.559617,55.670101]},{"type":"turn","modifier":"left","name":"Sønder Boulevard","distance":20,"duration":18,"location":[12.555683,55.668124]},{"type":"turn","modifier":"slight left","name":null,"distance":27,"duration":22,"location":[12.555908,55.668003]},{"type":"arrive","modifier":"left","name":null,"distance":0,"duration":0,"location":[12.556208,55.667858]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'vesterbro-til-koedbyen'
  and v.name = 'Fermentoren';

update route_venues rv set
  leg_geometry = '[[12.556208,55.667858],[12.556378,55.667679],[12.556989,55.667855],[12.557821,55.66748],[12.557955,55.667543],[12.558107,55.667613],[12.558258,55.667679],[12.55803,55.66784],[12.55828,55.667953],[12.558438,55.668024],[12.558638,55.668115],[12.558991,55.668274],[12.559189,55.668363],[12.55937,55.668445],[12.559603,55.668551],[12.559844,55.668551],[12.559915,55.668575]]'::jsonb,
  leg_distance_m = 338,
  leg_duration_s = 271,
  leg_steps = '[{"type":"depart","modifier":"left","name":null,"distance":23,"duration":18,"location":[12.556208,55.667858]},{"type":"turn","modifier":"left","name":"Skelbækgade","distance":110,"duration":88,"location":[12.556378,55.667679]},{"type":"turn","modifier":"left","name":null,"distance":35,"duration":28,"location":[12.557821,55.66748]},{"type":"end of road","modifier":"left","name":"Flæsketorvet","distance":150,"duration":120,"location":[12.558258,55.667679]},{"type":"turn","modifier":"slight right","name":null,"distance":20,"duration":16,"location":[12.559603,55.668551]},{"type":"arrive","modifier":null,"name":null,"distance":0,"duration":0,"location":[12.559915,55.668575]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'vesterbro-til-koedbyen'
  and v.name = 'Warpigs';

update route_venues rv set
  leg_geometry = '[[12.555975,55.691769],[12.555781,55.69165],[12.555717,55.691645],[12.555615,55.691675],[12.555269,55.691476],[12.554851,55.69133],[12.554805,55.691315],[12.554554,55.691197],[12.55395,55.690918],[12.554159,55.690893],[12.554286,55.690808],[12.554541,55.690637],[12.554563,55.690531],[12.55461,55.690515],[12.55465,55.690496],[12.554691,55.690472],[12.55497,55.690288],[12.555071,55.690221],[12.555167,55.690285],[12.555506,55.690515]]'::jsonb,
  leg_distance_m = 317,
  leg_duration_s = 255,
  leg_steps = '[{"type":"depart","modifier":"right","name":null,"distance":29,"duration":24,"location":[12.555975,55.691769]},{"type":"turn","modifier":"left","name":"Guldbergsgade","distance":135,"duration":108,"location":[12.555615,55.691675]},{"type":"turn","modifier":"sharp left","name":null,"distance":63,"duration":50,"location":[12.55395,55.690918]},{"type":"turn","modifier":"left","name":"Nørrebrogade","distance":47,"duration":40,"location":[12.554563,55.690531]},{"type":"turn","modifier":"left","name":"Møllegade","distance":43,"duration":34,"location":[12.555071,55.690221]},{"type":"arrive","modifier":"left","name":"Møllegade","distance":0,"duration":0,"location":[12.555506,55.690515]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'noerrebro-mot-soeerne'
  and v.name = 'Pompette';

update route_venues rv set
  leg_geometry = '[[12.555506,55.690515],[12.556166,55.690961],[12.556331,55.691073],[12.556603,55.691272],[12.557393,55.691797],[12.557506,55.691872],[12.557642,55.691811],[12.558442,55.691472],[12.558634,55.691389],[12.559509,55.690992],[12.559773,55.690878],[12.560107,55.690728],[12.56023,55.690673],[12.560475,55.690839],[12.560637,55.690858],[12.560817,55.690898],[12.560963,55.691003],[12.560987,55.690962],[12.56101,55.690947],[12.561128,55.690872],[12.561315,55.69076],[12.561576,55.690603],[12.562009,55.690395],[12.56245,55.690183],[12.562546,55.69014]]'::jsonb,
  leg_distance_m = 615,
  leg_duration_s = 494,
  leg_steps = '[{"type":"depart","modifier":"left","name":"Møllegade","distance":197,"duration":157,"location":[12.555506,55.690515]},{"type":"turn","modifier":"right","name":"Guldbergsgade","distance":217,"duration":174,"location":[12.557506,55.691872]},{"type":"turn","modifier":"left","name":null,"distance":62,"duration":49,"location":[12.56023,55.690673]},{"type":"turn","modifier":"right","name":"Sankt Hans Gade","distance":139,"duration":113,"location":[12.560963,55.691003]},{"type":"arrive","modifier":"right","name":"Sankt Hans Gade","distance":0,"duration":0,"location":[12.562546,55.69014]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'noerrebro-mot-soeerne'
  and v.name = 'The Barking Dog';

update route_venues rv set
  leg_geometry = '[[12.562546,55.69014],[12.56342,55.689748],[12.563354,55.689702],[12.563096,55.689523],[12.56282,55.689285],[12.562624,55.689125],[12.562544,55.689053]]'::jsonb,
  leg_distance_m = 165,
  leg_duration_s = 132,
  leg_steps = '[{"type":"depart","modifier":"right","name":"Sankt Hans Gade","distance":70,"duration":56,"location":[12.562546,55.69014]},{"type":"turn","modifier":"right","name":"Ravnsborggade","distance":95,"duration":76,"location":[12.56342,55.689748]},{"type":"arrive","modifier":"right","name":"Ravnsborggade","distance":0,"duration":0,"location":[12.562544,55.689053]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'noerrebro-mot-soeerne'
  and v.name = 'Kind of Blue';

update route_venues rv set
  leg_geometry = '[[12.562544,55.689053],[12.562363,55.688889],[12.561943,55.688532],[12.561813,55.688419],[12.561635,55.688264],[12.561308,55.687995],[12.561014,55.687752],[12.560542,55.687927]]'::jsonb,
  leg_distance_m = 210,
  leg_duration_s = 168,
  leg_steps = '[{"type":"depart","modifier":"right","name":"Ravnsborggade","distance":174,"duration":139,"location":[12.562544,55.689053]},{"type":"end of road","modifier":"right","name":"Nørrebrogade","distance":36,"duration":28,"location":[12.561014,55.687752]},{"type":"arrive","modifier":"right","name":"Nørrebrogade","distance":0,"duration":0,"location":[12.560542,55.687927]}]'::jsonb
from routes r, venues v
where rv.route_id = r.id and rv.venue_id = v.id
  and r.city = 'København' and r.slug = 'noerrebro-mot-soeerne'
  and v.name = 'Kassen';
