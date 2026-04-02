const { initDB, queryAll, queryOne, runSQL } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database with 100% original website data...');
  await initDB();

  // Clear existing data
  const tables = ['admin_activities','notifications','favorites','trips','images','reviews','places','admins','users','menu_items','business_owners','bookings'];
  tables.forEach(t => { try { runSQL(`DELETE FROM ${t}`); } catch(e){} });

  // Create default users with roles
  const adminPass = bcrypt.hashSync('admin123', 10);
  const userPass = bcrypt.hashSync('user123', 10);
  
  // Admin
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Admin', 'admin@tourguide.dz', adminPass, 'admin']);
  
  // Hotel Owner
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['صاحب فندق بلفيدير', 'owner_hotel@example.com', userPass, 'hotel_owner']);
  
  // Restaurant Owner
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['صاحب مطعم خيمة حمّة', 'owner_rest@example.com', userPass, 'restaurant_owner']);
  
  // Tourists
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['أحمد بن سعيد', 'ahmed@example.com', userPass, 'tourist']);
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['فاطمة الزهراء', 'fatima@example.com', userPass, 'tourist']);
  runSQL(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Mohammed K.', 'mohammed@example.com', userPass, 'tourist']);

  // Insert ALL 39 places matching the original website!
  const places = [
    ['Great Mosque of Ghardaia','المسجد الكبير بغرداية','Grande Mosquée de Ghardaïa','mosque',
     'The Great Mosque dating back to the 10th century with its iconic truncated pyramid minaret.',
     'المسجد الكبير بغرداية معلم أيقوني يعود للقرن العاشر. مئذنته المميزة على شكل هرم مقطوع هي رمز وادي ميزاب.',
     'La Grande Mosquée de Ghardaïa, monument du Xe siècle.',
     32.4912,3.6741,'وسط مدينة غرداية',null,'free','مفتوح يومياً',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Beni Isguen','بني يزقن','Beni Isguen','landmark',
     'The most traditional city in M\'zab Valley, known as the Holy City.',
     'بني يزقن الأكثر تقليدية في وادي ميزاب. تُعرف بالمدينة المقدسة وتتميز بسوق المزاد التقليدي وبرج بوليلة.',
     'Beni Isguen, la plus traditionnelle des cinq cités.',
     32.4730,3.6550,'بني يزقن، غرداية',null,'free','من الفجر إلى المغرب',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/BeniIsguen.jpg/1280px-BeniIsguen.jpg'],
    ['El Atteuf','العطف','El Atteuf','landmark',
     'The oldest city in M\'zab Valley, founded in 1012 AD.',
     'العطف أقدم المدن الخمس في وادي ميزاب، تأسست عام 1012م. تضم مسجد سيدي إبراهيم التاريخي.',
     'El Atteuf, la plus ancienne des cinq cités, fondée en 1012.',
     32.4650,3.7200,'العطف، غرداية',null,'free','مفتوح يومياً',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Melika','مليكة','Mélika','landmark',
     'Famous for its ancient cemeteries and hilltop panoramic views.',
     'مليكة مشهورة بمقابرها القديمة وإطلالاتها البانورامية الخلابة. مقبرة سيدي عيسى موقع ثقافي مهم.',
     'Mélika, célèbre pour ses cimetières anciens.',
     32.4870,3.6650,'مليكة، غرداية',null,'free','مفتوح يومياً',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Bounoura','بونورة','Bounoura','landmark',
     'Offers fascinating insights into ancient water management.',
     'بونورة تقدم رؤى رائعة حول أنظمة إدارة المياه القديمة والتخطيط الحضري الصحراوي التقليدي.',
     'Bounoura, village fortifié historique.',
     32.4800,3.6800,'بونورة، غرداية',null,'free','مفتوح يومياً',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Palm Groves','واحة النخيل','La Palmeraie','landmark',
     'Lush palm groves with an ingenious ancient water distribution system.',
     'واحات النخيل الخضراء هي واحة حياة في الصحراء. تتميز بنظام توزيع مياه قديم وتنتج تموراً عالية الجودة.',
     'Les palmeraies luxuriantes de la vallée du M\'zab.',
     32.4950,3.6700,'حي واحة النخيل، غرداية',null,'free','مفتوح يومياً',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Souk El Gharbia','سوق الغربية','Souk El Gharbia','market',
     'Main traditional market with authentic Mozabite handicrafts.',
     'السوق التقليدي الرئيسي في قلب غرداية. سجاد منسوج، فخار، جلود، تمور وتوابل عطرية.',
     'Le principal marché traditionnel de Ghardaïa.',
     32.4900,3.6720,'وسط مدينة غرداية',null,'$$','08:00 - 18:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Hotel Belveder','فندق بلفيدير','Hôtel Belvédère','hotel',
     'Popular hotel with comfortable rooms and beautiful city views.',
     'فندق شهير يوفر غرفاً مريحة ومطعماً وإطلالات جميلة على المدينة.',
     'Un hôtel populaire avec des vues sur la ville.',
     32.4920,3.6780,'شارع الأمير عبد القادر، غرداية','+213 29 88 12 34','$$$','24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Le Garden Ghardaia','لو جاردن غرداية','Le Garden Ghardaïa','hotel',
     'Known for its beautiful garden setting and swimming pool.',
     'يشتهر بحديقته الجميلة ومسبحه المنعش. مرافق حديثة مع أجواء تقليدية.',
     'Connu pour son jardin et sa piscine.',
     32.4880,3.6820,'حي النور، غرداية','+213 29 88 56 78','$$$','24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Mzab Hotel','فندق ميزاب','Hôtel M\'zab','hotel',
     'Well-known hotel in the center with an outdoor pool.',
     'فندق معروف في وسط غرداية مع مسبح في الهواء الطلق. قاعدة مريحة لاستكشاف مواقع اليونسكو.',
     'Un hôtel central avec piscine extérieure.',
     32.4905,3.6750,'وسط المدينة، غرداية','+213 29 88 90 00','$$','24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Khaima Hamma','خيمة حمّة','Khaïma Hamma','restaurant',
     'Authentic traditional restaurant in a tent-style setting.',
     'مطعم تقليدي أصيل يقدم الكسكس والطاجين والأطباق الصحراوية في أجواء خيمة تقليدية.',
     'Restaurant traditionnel dans un cadre de tente.',
     32.4935,3.6700,'حي الواحة، غرداية','+213 29 88 33 22','$$','11:00 - 23:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Al Nawras Tent','خيمة النوارس','Tente Al Nawras','restaurant',
     'Popular spot for traditional sweets and mint tea.',
     'مكان شهير للحلويات التقليدية والمعجنات. يشتهر بشاي النعناع والحلويات القائمة على اللوز.',
     'Endroit populaire pour les sucreries traditionnelles.',
     32.4890,3.6710,'شارع الاستقلال، غرداية','+213 29 88 44 55','$','09:00 - 22:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['L\'escale Street Food','مطعم ليسكال','L\'Escale Street Food','restaurant',
     'Casual dining with pizza, pasta, grilled meats and local flavors.',
     'مكان طعام عصري يقدم البيتزا والمعكرونة واللحوم المشوية والنكهات المحلية. مثالي للعائلات.',
     'Restauration décontractée avec pizzas et pâtes.',
     32.4915,3.6760,'شارع الحرية، غرداية','+213 29 88 77 88','$','10:00 - 00:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Maison d\'Hôtes Taskift','دار الضيافة تاسكيفت','Maison d\'Hôtes Taskift','hotel',
     'Highly-rated guesthouse with authentic Mozabite experience.',
     'دار ضيافة عالية التقييم توفر تجربة ميزابية أصيلة. عمارة تقليدية وحسن ضيافة.',
     'Maison d\'hôtes avec expérience mozabite authentique.',
     32.4750,3.6580,'بني يزقن، غرداية','+213 29 88 11 22','$$','24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/BeniIsguen.jpg/1280px-BeniIsguen.jpg'],
    ['Restaurant du Centre', 'مطعم المركز', 'Restaurant du Centre', 'restaurant',
     'A great restaurant located right in the heart of Ghardaia.',
     'مطعم يقع في قلب مدينة غرداية يقدم أطباقاً محلية وعالمية ممتازة.',
     'Un restaurant situé en plein cœur de Ghardaïa.',
     32.4901, 3.6732, 'وسط مدينة غرداية', '+213 29 88 11 11', '$$', '11:00 - 23:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Le Tajine d\'Or', 'طاجين الذهب', 'Le Tajine d\'Or', 'restaurant',
     'Experience the best traditional Tajine in the center of the city.',
     'جرب أفضل أطباق الطاجين التقليدية في وسط المدينة.',
     'Découvrez le meilleur Tajine traditionnel.',
     32.4910, 3.6740, 'وسط مدينة غرداية', '+213 29 89 22 33', '$$', '12:00 - 22:30',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Ghardaia Palace Restaurant', 'مطعم قصر غرداية', 'Restaurant Palais de Ghardaïa', 'restaurant',
     'Luxurious dining experience featuring Mozabite specialties.',
     'تجربة طعام فاخرة في وسط المدينة تتميز بالمأكولات الميزابية المتخصصة.',
     'Expérience culinaire en centre-ville.',
     32.4895, 3.6725, 'وسط مدينة غرداية', '+213 29 88 99 00', '$$$', '13:00 - 00:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Gare Routière de Ghardaïa', 'محطة نقل المسافرين بغرداية', 'Gare Routière de Ghardaïa', 'transport',
     'The main bus station connecting Ghardaia to other wilayas.',
     'محطة الحافلات الرئيسية التي تربط غرداية بالولايات الأخرى والوجهات الوطنية.',
     'La principale gare routière.',
     32.4860, 3.6660, 'المنطقة الصناعية، غرداية', '+213 29 88 00 00', null, '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ["Gare Routière d'El Guerrara", 'محطة نقل المسافرين بالقرارة', "Gare Routière d'El Guerrara", 'transport',
     'The main bus station in El Guerrara.',
     'محطة الحافلات وسيارات الأجرة الرئيسية في بلدية القرارة.',
     "La principale gare routière d'El Guerrara.",
     32.7890, 4.4980, 'القرارة', null, null, '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Gare Routière de Berriane', 'محطة نقل المسافرين ببريان', 'Gare Routière de Berriane', 'transport',
     'The main transport station serving Berriane municipality.',
     'محطة النقل الرئيسية التي تخدم سكان بلدية بريان.',
     'La principale station de transport desservant Berriane.',
     32.8330, 3.7660, 'بريان', null, null, '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Gare Routière de Metlili', 'محطة نقل المسافرين بمتليلي', 'Gare Routière de Metlili', 'transport',
     'Metlili bus and taxi station.',
     'محطة الحافلات وسيارات الأجرة في بلدية متليلي الشعانبة.',
     'Gare de bus et de taxis de Metlili.',
     32.2660, 3.6330, 'متليلي', null, null, '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Transport Station El Atteuf', 'محطة النقل بالعطف', 'Station de Transport El Atteuf', 'transport',
     'Local transport station for El Atteuf.',
     'محطة النقل المحلي لبلدية العطف.',
     'Station de transport local pour El Atteuf.',
     32.4650, 3.7200, 'العطف', null, null, '06:00 - 20:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/BeniIsguen.jpg/1280px-BeniIsguen.jpg'],
    ['Gare Routière de Zelfana', 'محطة نقل المسافرين بزلفانة', 'Gare Routière de Zelfana', 'transport',
     'Transport station for the thermal city of Zelfana.',
     'محطة المسافرين الخاصة بمدينة زلفانة السياحية والحموية.',
     'Station de transport pour la ville thermale de Zelfana.',
     32.3990, 4.2330, 'زلفانة', null, null, '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Transport Station Daya Ben Dahoua', 'محطة النقل بضاية بن ضحوة', 'Station de Transport Daya Ben Dahoua', 'transport',
     'Local transport station for Daya Ben Dahoua.',
     'محطة النقل المحلي لبلدية ضاية بن ضحوة.',
     'Station de transport local pour Daya Ben Dahoua.',
     32.5330, 3.6660, 'ضاية بن ضحوة', null, null, '06:00 - 20:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Transport Station Bounoura', 'محطة النقل ببونورة', 'Station de Transport Bounoura', 'transport',
     'Local transport station for Bounoura.',
     'محطة النقل المحلي لبلدية بونورة.',
     'Station de transport local pour Bounoura.',
     32.4800, 3.6800, 'بونورة', null, null, '06:00 - 20:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Transport Station Sebseb', 'محطة النقل بسبسب', 'Station de Transport Sebseb', 'transport',
     'Local transport station for Sebseb.',
     'محطة النقل الداخلي والخارجي لبلدية سبسب.',
     'Station de transport local pour Sebseb.',
     32.2000, 3.6000, 'سبسب', null, null, '06:00 - 18:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Zoo & Amusement Park Ghardaia', 'حديقة الحيوانات والتسلية بغرداية', "Parc Zoologique et d'Attractions Ghardaïa", 'park',
     'A fun place for families with various animals and rides.',
     'مكان ترفيهي للعائلات يحتوي على أنواع مختلفة من الحيوانات وألعاب التسلية الممتعة.',
     'Un lieu de divertissement pour les familles.',
     32.5000, 3.6500, 'غرداية', null, '$', '10:00 - 19:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Zoo & Amusement Park El Guerrara', 'حديقة الحيوانات والتسلية بالقرارة', "Parc Zoologique et d'Attractions El Guerrara", 'park',
     'A beautiful amusement and animal park in El Guerrara.',
     'حديقة جميلة للحيوانات والتسلية ببلدية القرارة.',
     "Un beau parc d'attractions et animalier.",
     32.7900, 4.4900, 'القرارة', null, '$', '09:00 - 18:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Zelfana Amusement Park', 'حديقة التسلية زلفانة', "Parc d'Attractions Zelfana", 'park',
     'An amusement park located near the thermal baths of Zelfana.',
     'حديقة تسلية ترفيهية تقع بالقرب من الحمامات المعدنية ببلدية زلفانة.',
     "Un parc d'attractions situé près des thermes.",
     32.3990, 4.2330, 'زلفانة', null, '$$', '10:00 - 22:00',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Dar Dadid Guest House', 'دار ديديد للضيافة', "Maison d'Hôtes Dar Dadid", 'hostel',
     'A traditional boutique guest house in the heart of the old city.',
     'دار ضيافة تقليدية عريقة في قلب المدينة القديمة بغرداية، توفر تجربة سكن ميزابية أصيلة.',
     "Une maison d'hôtes traditionnelle.",
     32.4900, 3.6700, 'غرداية', '029 88 11 22', '$$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Dar El Ghouli', 'دار الغولي', 'Dar El Ghouli', 'hostel',
     'A beautiful traditional house in Beni Isguen.',
     'منزل تقليدي رائع في قصر بني يزقن، يوفر إطلالة مميزة على واحة النخيل.',
     "Une belle maison traditionnelle à Beni Isguen.",
     32.4700, 3.6900, 'بني يزقن', '029 88 33 44', '$$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/BeniIsguen.jpg/1280px-BeniIsguen.jpg'],
    ['Akham Guest House', 'دار أكهام للضيافة', 'Maison d\'Hôtes Akham', 'hostel',
     'Authentic traditional accommodation in the holy city of Beni Isguen.',
     'سكن تقليدي أصيل في مدينة بني يزقن التاريخية، يتميز بالهدوء والمعمار الفريد.',
     'Hébergement traditionnel authentique.',
     32.4720, 3.6920, 'بني يزقن', '029 88 55 66', '$$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Dar El Hakim', 'دار الحكيم', 'Dar El Hakim', 'hostel',
     'Traditional guest house in El Atteuf.',
     'دار ضيافة تقليدية في مدينة العطف أقدم مدن الوادي، تعكس كرم الضيافة الميزابية.',
     "Maison d'hôtes traditionnelle à El Atteuf.",
     32.4650, 3.7200, 'العطف', '029 88 77 88', '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/BeniIsguen.jpg/1280px-BeniIsguen.jpg'],
    ['Dar El Hadj', 'دار الحاج', 'Dar El Hadj', 'hostel',
     'Traditional lodging in Melika with panoramic views.',
     'نزل تقليدي في قصر مليكة يوفر إطلالة بانورامية ساحرة على مدينة غرداية.',
     "Logement traditionnel à Melika.",
     32.4850, 3.6800, 'مليكة', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Thermal Hostel Zelfana', 'المرقد الحموي زلفانة', 'Hébergement Thermal Zelfana', 'hostel',
     'Budget-friendly hostel for travelers visiting Zelfana.',
     'مرقد سياحي بأسعار معقولة للمسافرين القاصدين للحمامات المعدنية في زلفانة.',
     'Hébergement thermal à petit prix.',
     32.3990, 4.2330, 'زلفانة', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Mraqed Metlili', 'مرقد متليلي الشعانية', 'Auberge Metlili', 'hostel',
     'Simple and comfortable lodging in Metlili.',
     'سكن بسيط ومريح في مدينة الكرم والضيافة متليلي الشعانبة.',
     'Hébergement simple à Metlili.',
     32.2660, 3.6330, 'متليلي الشعانبة', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg'],
    ['Auberge El Guerrara', 'مرقد بلدية القرارة', 'Auberge El Guerrara', 'hostel',
     'Traditional hostel for travelers in El Guerrara.',
     'مرقد تقليدي للمسافرين بمدينة القرارة التاريخية.',
     'Auberge traditionnelle à El Guerrara.',
     32.7900, 4.4900, 'القرارة', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'],
    ['Berriane Travelers Hostel', 'نزل المسافرين بريان', 'Hostel Berriane', 'hostel',
     'Strategic hostel located on the national road in Berriane.',
     'نزل استراتيجي يقع على الطريق الوطني ببلدية بريان، مخصص للمسافرين.',
     'Hébergement pour voyageurs à Berriane.',
     32.8330, 3.7660, 'بريان', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Panorama_ghardaia.jpg/1280px-Panorama_ghardaia.jpg'],
    ['Daya Ben Dahoua Guesthouse', 'دار ضيافة ضاية بن ضحوة', 'Guesthouse Daya Ben Dahoua', 'hostel',
     'Cozy guest house in the green area of Daya Ben Dahoua.',
     'دار ضيافة هادئة في بلدية ضاية بن ضحوة الخضراء.',
     'Maison d\'hôtes à Daya Ben Dahoua.',
     32.5330, 3.6660, 'ضاية بن ضحوة', null, '$', '24/7',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ghardaia_valley.jpg/1280px-Ghardaia_valley.jpg']
  ];

  const placeSql = `INSERT INTO places (name, name_ar, name_fr, category, description, description_ar, description_fr, latitude, longitude, address, phone, price_range, opening_hours, image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  places.forEach(p => runSQL(placeSql, p));

  // Reviews
  const revSql = `INSERT INTO reviews (user_id, place_id, rating, comment) VALUES (?,?,?,?)`;
  runSQL(revSql, [1,1,5,'مكان رائع ومليء بالتاريخ والروحانية. المسجد الكبير تحفة معمارية! 🕌']);
  runSQL(revSql, [2,1,4,'تجربة فريدة. أنصح الجميع بزيارة هذا المعلم التاريخي العريق.']);
  runSQL(revSql, [3,2,5,'Beni Isguen is absolutely stunning! Unforgettable experience.']);
  runSQL(revSql, [1,2,5,'بني يزقن مدينة ساحرة تنقلك عبر الزمن. الأزقة والمنازل الملونة مذهلة.']);
  runSQL(revSql, [2,3,4,'العطف أقدم مدينة في الوادي وتستحق الزيارة.']);
  runSQL(revSql, [4,8,4,'Great hotel with excellent views. Would definitely come back!']);
  runSQL(revSql, [1,11,5,'أفضل مطعم تقليدي في غرداية! الكسكس والطاجين لا يُقاوَمان 🌟']);
  runSQL(revSql, [2,7,5,'سوق الغربية مكان رائع للتسوق. سجاد وفخار وتمور وتوابل.']);

  // Business Owners links
  runSQL(`INSERT INTO business_owners (user_id, place_id, business_type) VALUES (?, ?, ?)`, [2, 8, 'hotel']);
  runSQL(`INSERT INTO business_owners (user_id, place_id, business_type) VALUES (?, ?, ?)`, [3, 11, 'restaurant']);

  // Menu Items
  const menuSql = `INSERT INTO menu_items (place_id, name, price, description) VALUES (?,?,?,?)`;
  runSQL(menuSql, [11, 'كسكس تقليدي', '1200 DA', 'كسكس بالخضر واللحم الميزابي']);
  runSQL(menuSql, [11, 'طاجين زيتون', '900 DA', 'طاجين بالدجاج والزيتون']);
  runSQL(menuSql, [11, 'شاي صحراوي', '100 DA', 'شاي بالنعناع على الجمر']);

  console.log('✅ Database seeded successfully with ALL 39 places!');
  console.log(`   📍 ${places.length} places registered.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
