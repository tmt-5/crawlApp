-- Crawl: København as a second city, with three curated routes.
-- Venues, addresses and coordinates are from OpenStreetMap (Nominatim).
-- Opening hours are from each venue's own website where it lists them,
-- checked 8 October 2026, and left empty where sources disagree.
-- Run 0012_copenhagen_route_legs.sql after this file: rewriting the stops
-- below clears their walking legs.

insert into venues (city, name, tagline, description, fun_fact, category, opening_hours_note, address, latitude, longitude, last_verified_at) values
  -- Indre By
  ('København', 'Ved Stranden 10',
    'Vinbar ved kanalen, rett overfor Christiansborg.',
    'Vinbutikk og bar i rolige stuer ved Gammel Strand. Ost og spekemat til glasset. Stenger 22, så start kvelden her.',
    null,
    'vinbar', 'Man–fre 15–22, lør 12–22. Stengt søndag.',
    'Ved Stranden 10, København', 55.67731, 12.58160, '2026-10-08'),
  ('København', 'Hviids Vinstue',
    'Københavns eldste vinstue, fra 1723.',
    'Mørke, lave stuer på hjørnet av Kongens Nytorv. Øl og vin uten dikkedarer, og gløgg når det blir kaldt.',
    'Lokalene er nesten 300 år gamle, fra den gang Nyhavn var en travel havn.',
    'pub', 'Man–tors 10–01, fre–lør 10–02, søn 10–20.',
    'Kongens Nytorv 19, København', 55.67978, 12.58472, '2026-10-08'),
  ('København', 'Bo-Bi Bar',
    'Brun bar med rød tapet, åpnet i 1917.',
    'Liten og trang bodega der lite er endret på hundre år. Flaskeøl og lave priser. Det røykes inne, og det kan lønne seg å ha kontanter.',
    'Skal ha blitt startet av en sjømann som gikk i land i 1917 og kjøpte byens første bardisk.',
    'bar', null,
    'Klareboderne 14, København', 55.68101, 12.57869, '2026-10-08'),
  ('København', 'Balderdash',
    'Lekne cocktails i den eldste delen av byen.',
    'Koselig cocktailbar med egne vrier på klassikerne og en meny som byttes ofte. Bare å komme innom. Er dere seks eller flere, lønner det seg å reservere.',
    null,
    'cocktailbar', 'Ons–lør fra 17. Stengt søn–tirs.',
    'Valkendorfsgade 11, København', 55.67990, 12.57771, '2026-10-08'),
  ('København', 'Ruby',
    'Cocktailbar i et byhus ved kanalen.',
    'Stuer med skinnsofaer oppe og kjellerbar under. Klassiske cocktails og en meny som følger sesongen. Døra er umerket, så se etter nummer 10. Kom tidlig i helgene.',
    'Huset er fra 1740 og har rommet både boktrykkeri, privatbank og deler av Kulturministeriet.',
    'cocktailbar', 'Søn–ons 17–01, tors 16–01, fre–lør 16–02.',
    'Nybrogade 10, København', 55.67669, 12.57662, '2026-10-08'),

  -- Vesterbro
  ('København', 'Falernum',
    'Bistro og vinbar på Værnedamsvej.',
    'Fransk bistrostemning, lang vinliste og småretter. Et godt sted å samles og få noe i magen før turen går videre.',
    'Værnedamsvej går for å være Københavns lille Paris.',
    'vinbar', 'Man–tors 12–24, fre–lør 12–02, søn 12–23.',
    'Værnedamsvej 16, København', 55.67409, 12.54998, '2026-10-08'),
  ('København', 'Lidkoeb',
    'Cocktailbar over tre etasjer i en bakgård.',
    'Gå gjennom porten fra Vesterbrogade og inn i bakgården. Lang bar og peis nede, og whiskybar på loftet fredag og lørdag.',
    'Huset var laboratoriet til Vesterbro Apotek. Folkene bak Ruby åpnet baren i 2012.',
    'cocktailbar', 'Man 18–24, tirs 16–24, ons–lør 16–02. Stengt søndag.',
    'Vesterbrogade 72B, København', 55.67331, 12.55171, '2026-10-08'),
  ('København', 'Duck and Cover',
    'Lavmælt cocktailbar i kjelleren.',
    'Møbler fra midten av forrige århundre, dempet lys og en meny som følger sesongen med lokale råvarer.',
    null,
    'cocktailbar', 'Man 18–24, tirs–tors 16–01, fre–lør 16–02, søn 18–24.',
    'Dannebrogsgade 6, København', 55.67185, 12.55239, '2026-10-08'),
  ('København', 'Mikkeller Bar',
    'Den aller første Mikkeller-baren.',
    'Liten ølbar i Viktoriagade med rundt 20 kraner, mest eget øl og noen gjester. Be om en smak hvis dere er i tvil.',
    'Herfra har Mikkeller vokst til barer i byer over hele verden.',
    'ølbar', 'Man–tors 15–24, fre 15–01, lør 12–01, søn 14–23.',
    'Viktoriagade 8B, København', 55.67196, 12.55755, '2026-10-08'),
  ('København', 'Fermentoren',
    'Ølbar i kjelleren på Halmtorvet.',
    'Stearinlys, sofaer og 24 kraner som byttes jevnlig. Uteservering mot torget når været holder.',
    'Noe av ølet på fat kommer fra husets eget bryggeri, Dry & Bitter.',
    'ølbar', 'Åpent til 02 fredag og lørdag.',
    'Halmtorvet 29C, København', 55.66791, 12.55638, '2026-10-08'),
  ('København', 'Warpigs',
    'Bryggeri og Texas-barbecue i Kødbyen.',
    'Stor ølhall med langbord og 23 kraner med øl brygget på stedet. Kjøttet røykes lenge og blir ofte utsolgt utpå kvelden. Kjøkkenet stenger 22.',
    'Startet av Mikkeller sammen med det amerikanske bryggeriet 3 Floyds.',
    'bryggeri', 'Man–ons 11.30–24, tors 11.30–02, fre 11.30–03, lør 11.30–02, søn 11.30–23.',
    'Flæsketorvet 25, København', 55.66857, 12.55992, '2026-10-08'),

  -- Nørrebro
  ('København', 'BRUS',
    'Bryggeri, bar og spisested fra To Øl.',
    'Stort lokale med bryggetanker i rommet, mange kraner og mat fra eget kjøkken. God plass til hele gjengen.',
    'Bygget var jernstøperi og lokomotivfabrikk før det ble bryggeri.',
    'bryggeri', 'Søn–tors 12–24, fre–lør 12–02.',
    'Guldbergsgade 29F, København', 55.69187, 12.55578, '2026-10-08'),
  ('København', 'Pompette',
    'Naturvin på glass i Møllegade.',
    'Liten og populær vinbar med vinbutikk, uformell stemning og småretter. Det fylles fort opp i helgene.',
    'Pompette er fransk for å være lett brisen.',
    'vinbar', 'Alle dager 12–24.',
    'Møllegade 3, København', 55.69056, 12.55541, '2026-10-08'),
  ('København', 'The Barking Dog',
    'Cocktailbar med sans for mezcal.',
    'Uformell bar i sidegata mellom Sankt Hans Torv og Søerne. Mange av drinkene er blandet på forhånd, så dere slipper å vente lenge.',
    null,
    'cocktailbar', 'Åpent til 02 fredag og lørdag.',
    'Sankt Hans Gade 19, København', 55.69010, 12.56249, '2026-10-08'),
  ('København', 'Kind of Blue',
    'Intim musikkbar i Ravnsborggade.',
    'Her står musikken i sentrum. Øl, vin og gode drinker, og plass til å bli sittende en stund.',
    null,
    'bar', 'Man–ons 16–24, tors–lør 16–02. Stengt søndag.',
    'Ravnsborggade 17, København', 55.68910, 12.56241, '2026-10-08'),
  ('København', 'Kassen',
    'Cocktailbar på Nørrebrogade for sene kvelder.',
    'Høylytt og uhøytidelig, med rimelige drinker og to-for-én tidlig på kvelden. Spør i baren hva som gjelder.',
    null,
    'cocktailbar', null,
    'Nørrebrogade 18B, København', 55.68802, 12.56065, '2026-10-08')
on conflict (city, name) do update set
  tagline = excluded.tagline,
  description = excluded.description,
  fun_fact = excluded.fun_fact,
  category = excluded.category,
  opening_hours_note = excluded.opening_hours_note,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  last_verified_at = excluded.last_verified_at;

insert into routes (city, slug, name, tagline, description, neighborhood, sort_order) values
  ('København', 'indre-by-rundt', 'Indre By rundt',
    'Vin ved kanalen, byens eldste vinstue og cocktails til slutt.',
    'Starter med et glass vin ved Gammel Strand, går innom to av byens eldste barer og ender med cocktails ved kanalen. Første stopp stenger 22, så kom i gang tidlig.',
    'Indre By', 1),
  ('København', 'vesterbro-til-koedbyen', 'Vesterbro til Kødbyen',
    'Fra Værnedamsvej til bryggeriet i Kødbyen.',
    'Vin og en matbit først, to cocktailbarer i sidegatene og så øl hele veien ned til Kødbyen. Den lengste ruta, med god plass til store grupper på slutten.',
    'Vesterbro', 2),
  ('København', 'noerrebro-mot-soeerne', 'Nørrebro mot Søerne',
    'Fra bryggeriet i Guldbergsgade ned mot Dronning Louises Bro.',
    'Starter med øl og mat hos BRUS, fortsetter med naturvin og cocktails rundt Sankt Hans Torv og ender på Nørrebrogade. Korte etapper og sene åpningstider.',
    'Nørrebro', 3)
on conflict (city, slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  neighborhood = excluded.neighborhood,
  sort_order = excluded.sort_order;

-- Rewrite the stops for the seeded routes so this file can be re-run.
delete from route_venues
where route_id in (
  select id from routes
  where city = 'København'
    and slug in ('indre-by-rundt', 'vesterbro-til-koedbyen', 'noerrebro-mot-soeerne')
);

insert into route_venues (route_id, venue_id, order_index, note)
select r.id, v.id, s.order_index, s.note
from (values
  ('indre-by-rundt', 'Ved Stranden 10', 0, 'Stenger 22 og holder stengt søndag.'),
  ('indre-by-rundt', 'Hviids Vinstue', 1, null),
  ('indre-by-rundt', 'Bo-Bi Bar', 2, 'Det røykes inne. Ta med kontanter for sikkerhets skyld.'),
  ('indre-by-rundt', 'Balderdash', 3, 'Åpent onsdag til lørdag.'),
  ('indre-by-rundt', 'Ruby', 4, null),
  ('vesterbro-til-koedbyen', 'Falernum', 0, 'Spis noe her. Resten av ruta er mest drikke.'),
  ('vesterbro-til-koedbyen', 'Lidkoeb', 1, 'Inngangen er gjennom porten og inn i bakgården.'),
  ('vesterbro-til-koedbyen', 'Duck and Cover', 2, null),
  ('vesterbro-til-koedbyen', 'Mikkeller Bar', 3, null),
  ('vesterbro-til-koedbyen', 'Fermentoren', 4, null),
  ('vesterbro-til-koedbyen', 'Warpigs', 5, 'Kjøkkenet stenger 22.'),
  ('noerrebro-mot-soeerne', 'BRUS', 0, 'Spis her før dere går videre.'),
  ('noerrebro-mot-soeerne', 'Pompette', 1, null),
  ('noerrebro-mot-soeerne', 'The Barking Dog', 2, null),
  ('noerrebro-mot-soeerne', 'Kind of Blue', 3, 'Stengt søndag.'),
  ('noerrebro-mot-soeerne', 'Kassen', 4, null)
) as s (slug, venue_name, order_index, note)
join routes r on r.city = 'København' and r.slug = s.slug
join venues v on v.city = 'København' and v.name = s.venue_name;
