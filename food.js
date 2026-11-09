'use strict';

/* =========================================================
   ObaaSima — Nourish & Kitchen companion.
   Food suggestions and recipes tailored to her stage (cycle phase or
   pregnancy trimester) and what she has logged recently (symptoms,
   feelings). Everything runs on the device from the recipe collection
   below — nothing is sent anywhere.
   Loaded after app.js (shares: state, ui, save, esc, plural, toKey,
   addDays, today, model, pregnancy, LOTUS, $).
   ========================================================= */

/* ---------------- ingredients she can pick ---------------- */
const ING_GROUPS = [
  ['Fruits', [['banana', '🍌', 'Banana'], ['plantain', '🍌', 'Plantain'], ['mango', '🥭', 'Mango'], ['pineapple', '🍍', 'Pineapple'],
    ['orange', '🍊', 'Orange'], ['lemon', '🍋', 'Lemon / lime'], ['apple', '🍎', 'Apple'], ['pear', '🍐', 'Pear'], ['berries', '🫐', 'Berries'],
    ['watermelon', '🍉', 'Watermelon'], ['avocado', '🥑', 'Avocado'], ['pawpaw', '🍈', 'Pawpaw (ripe)'], ['coconut', '🥥', 'Coconut']]],
  ['Vegetables', [['spinach', '🥬', 'Spinach'], ['kontomire', '🌿', 'Kontomire'], ['leek', '🌱', 'Leek'], ['endive', '🥬', 'Witloof (endive)'],
    ['carrot', '🥕', 'Carrot'], ['potato', '🥔', 'Potato'], ['sweetpotato', '🍠', 'Sweet potato'], ['yam', '🍠', 'Yam'], ['tomato', '🍅', 'Tomato'],
    ['onion', '🧅', 'Onion'], ['garlic', '🧄', 'Garlic'], ['ginger', '🫚', 'Ginger'], ['broccoli', '🥦', 'Broccoli'], ['cucumber', '🥒', 'Cucumber'],
    ['beetroot', '🟣', 'Beetroot'], ['bellpepper', '🫑', 'Bell pepper'], ['gardenegg', '🍆', 'Garden egg'], ['okra', '🟢', 'Okro'],
    ['mushroom', '🍄', 'Mushroom'], ['greenbeans', '🫛', 'Green beans'], ['celery', '🌿', 'Celery']]],
  ['Protein', [['eggs', '🥚', 'Eggs'], ['chicken', '🍗', 'Chicken'], ['beef', '🥩', 'Beef'], ['salmon', '🐟', 'Salmon'],
    ['fish', '🐟', 'Tilapia / white fish'], ['mussels', '🦪', 'Mussels'], ['beans', '🫘', 'Beans'], ['lentils', '🫘', 'Lentils'],
    ['chickpeas', '🧆', 'Chickpeas'], ['groundnuts', '🥜', 'Groundnuts']]],
  ['Grains', [['oats', '🥣', 'Oats'], ['rice', '🍚', 'Rice'], ['bread', '🍞', 'Bread'], ['flour', '🌾', 'Flour'], ['pasta', '🍝', 'Pasta']]],
  ['Dairy & extras', [['milk', '🥛', 'Milk'], ['yoghurt', '🥣', 'Yoghurt'], ['cheese', '🧀', 'Cheese (pasteurised)'], ['honey', '🍯', 'Honey'],
    ['mint', '🌿', 'Mint'], ['cinnamon', '🟤', 'Cinnamon'], ['coconutmilk', '🥥', 'Coconut milk'], ['hibiscus', '🌺', 'Sobolo leaves']]],
];
const ING = Object.fromEntries(ING_GROUPS.flatMap(([, items]) => items.map(([k, e, l]) => [k, { e, l }])));

/* ---------------- recipe collection ----------------
   ing: [key, text]   key '' = pantry (salt, oil, stock, spices…), '?key' = optional, 'a/b' = either one.
   good: nutrients   helps: symptoms it may ease   preg:false = not advised in pregnancy */
const RECIPES = [
  // ---------- Belgian 🇧🇪 ----------
  { id: 'stoemp', e: '🥔', name: 'Stoemp with spinach & carrots', c: 'be', type: 'meal', t: 30,
    ing: [['potato', '600 g floury potatoes'], ['spinach', '2 big handfuls spinach'], ['carrot', '2 carrots'], ['onion', '1 onion'], ['?milk', 'a splash of warm milk'], ['', 'butter, salt, pepper, a pinch of nutmeg']],
    steps: ['Peel and chop the potatoes and carrots; boil in salted water for 20 min until soft.', 'Meanwhile soften the chopped onion in a little butter, then wilt in the spinach.', 'Drain and mash the potatoes and carrots with butter and warm milk until creamy.', 'Fold in the spinach and onion; season with pepper and nutmeg.', 'Serve on its own or with a fully cooked egg or sausage — classic Brussels comfort food.'],
    good: ['iron', 'folate', 'fiber', 'potassium'], helps: ['fatigue', 'cravings'] },
  { id: 'waterzooi', e: '🍲', name: 'Gentse waterzooi (creamy chicken stew)', c: 'be', type: 'meal', t: 45,
    ing: [['chicken', '4 chicken thighs or 2 breasts'], ['leek', '1 leek'], ['carrot', '2 carrots'], ['potato', '4 potatoes'], ['?celery', '2 celery sticks'], ['?eggs', '1 egg yolk'], ['?milk', '150 ml milk or cream'], ['', '1 L chicken stock, butter, parsley']],
    steps: ['Slice the leek, carrots and celery; soften them in butter for 5 min.', 'Add the chicken, chopped potatoes and stock. Simmer 30 min until the chicken is cooked through.', 'Whisk the egg yolk with the milk, stir it in off the boil, then heat gently for 2–3 min, stirring, until steaming and slightly thickened.', 'Season, scatter with parsley and serve in deep plates.'],
    good: ['protein', 'hydration', 'potassium'], helps: ['nausea', 'fatigue'],
    note: 'Heat the sauce until steaming after adding the yolk so the egg is fully cooked.' },
  { id: 'chicons', e: '🥬', name: 'Chicons au gratin (witloof bake)', c: 'be', type: 'meal', t: 40,
    ing: [['endive', '4 witloof (endive) heads'], ['cheese', '80 g grated pasteurised cheese'], ['milk', '400 ml milk'], ['flour', '2 tbsp flour'], ['', 'butter, nutmeg; optional cooked ham slices']],
    steps: ['Braise the endives in a covered pan with a little butter and water for 15 min; drain well.', 'Optional: wrap each endive in a slice of cooked ham.', 'Make a béchamel: melt butter, stir in the flour, whisk in the milk until thick; add half the cheese and a pinch of nutmeg.', 'Pour over the endives, top with the rest of the cheese and bake 20 min at 200 °C until bubbling. Lovely with mash.'],
    good: ['calcium', 'protein', 'fiber'], helps: [],
    note: 'Use pasteurised cheese. If you add ham, bake until piping hot all the way through.' },
  { id: 'leeksoup', e: '🥣', name: 'Soupe aux poireaux (leek & potato soup)', c: 'be', type: 'meal', t: 30,
    ing: [['leek', '2 leeks'], ['potato', '2 potatoes'], ['?carrot', '1 carrot'], ['?onion', '1 onion'], ['', '1 L vegetable stock, a knob of butter']],
    steps: ['Slice the vegetables; soften the leek and onion in butter for 5 min.', 'Add the potato, carrot and stock; simmer 20 min.', 'Blend until smooth and season lightly.', 'Sip it warm — very gentle on an unsettled stomach.'],
    good: ['hydration', 'fiber', 'potassium'], helps: ['nausea', 'headache', 'bloating'] },
  { id: 'moules', e: '🦪', name: 'Moules marinières, alcohol-free', c: 'be', type: 'meal', t: 25,
    ing: [['mussels', '1 kg fresh mussels'], ['?celery', '2 celery sticks'], ['onion', '1 onion'], ['garlic', '2 cloves garlic'], ['?potato', 'potatoes for oven fries'], ['', 'butter, parsley, 150 ml stock (instead of wine)']],
    steps: ['Scrub the mussels. Throw away any that are cracked or stay open when tapped.', 'Soften the onion, celery and garlic in butter; add the stock.', 'Add the mussels, cover and cook on high for 6–8 min, shaking the pot, until ALL shells are open and the meat is cooked through. Discard any that stay closed.', 'Serve straight away with oven fries or bread.'],
    good: ['iron', 'protein', 'omega3'], helps: ['fatigue'],
    note: 'Only eat mussels freshly and fully cooked. Skip if you are allergic to shellfish.' },
  { id: 'volauvent', e: '🥧', name: 'Vol-au-vent (chicken & mushroom)', c: 'be', type: 'meal', t: 45,
    ing: [['chicken', '2 chicken breasts'], ['mushroom', '250 g mushrooms'], ['?milk', '100 ml milk'], ['flour', '2 tbsp flour'], ['?rice/bread', 'puff-pastry shells, rice or fries to serve'], ['', '500 ml stock, butter, a squeeze of lemon']],
    steps: ['Simmer the chicken in the stock for 20 min until cooked through; shred and keep the stock.', 'Fry the sliced mushrooms in butter until golden.', 'Melt butter, stir in the flour, then whisk in 300 ml of the stock and the milk to a smooth sauce.', 'Add the chicken, mushrooms and a squeeze of lemon. Serve in pastry shells, with rice or fries.'],
    good: ['protein', 'energy'], helps: ['fatigue'] },
  { id: 'liegeoise', e: '🫛', name: 'Salade liégeoise (warm bean & potato salad)', c: 'be', type: 'meal', t: 30,
    ing: [['greenbeans', '400 g green beans'], ['potato', '500 g small potatoes'], ['onion', '1 red onion'], ['?eggs', '2 eggs, hard-boiled'], ['', 'oil, a splash of vinegar; optional bacon']],
    steps: ['Boil the potatoes for 15 min and the beans for 6 min.', 'Fry the sliced onion (and bacon, until crisp). Add a splash of vinegar.', 'Toss everything together while warm; top with halved hard-boiled eggs.'],
    good: ['fiber', 'folate', 'potassium'], helps: ['digestion'],
    note: 'Boil eggs at least 10 minutes so the yolks are firm, and cook bacon until crisp.' },
  { id: 'waffles', e: '🧇', name: 'Wholegrain Belgian waffles with fruit', c: 'be', type: 'snack', t: 25,
    ing: [['flour', '250 g flour (half wholemeal)'], ['eggs', '2 eggs'], ['milk', '350 ml milk'], ['banana/berries', 'banana slices or berries to top'], ['', '50 g melted butter, 2 tsp baking powder, cinnamon']],
    steps: ['Whisk flour, baking powder and cinnamon; add eggs, milk and melted butter to a smooth batter.', 'Cook in a hot waffle iron until golden and fully set.', 'Top with fruit and a little yoghurt instead of lots of sugar.'],
    good: ['energy', 'calcium'], helps: ['cravings'] },
  { id: 'speculoosoats', e: '🥣', name: 'Speculoos-spiced overnight oats', c: 'be', type: 'snack', t: 5,
    ing: [['oats', '50 g oats'], ['milk/yoghurt', '150 ml milk or yoghurt'], ['apple', '1 apple, grated'], ['?cinnamon', 'cinnamon (and 1 speculoos biscuit, crumbled)'], ['?honey', 'a little honey']],
    steps: ['Mix the oats, milk, grated apple and cinnamon (crumble in a speculoos if you like).', 'Cover and leave in the fridge overnight.', 'Top with yoghurt and a drizzle of honey in the morning.'],
    good: ['fiber', 'calcium', 'energy'], helps: ['digestion', 'cravings'] },
  { id: 'carbonnade', e: '🥘', name: 'Stoofvlees (Flemish beef stew), alcohol-free', c: 'be', type: 'meal', t: 150,
    ing: [['beef', '800 g stewing beef'], ['onion', '3 onions'], ['bread', '2 slices bread spread with mustard'], ['?apple', '1 apple, grated'], ['?carrot', '2 carrots'], ['', '500 ml beef stock, thyme, bay leaf, a little brown sugar and vinegar']],
    steps: ['Brown the beef in batches in a heavy pot.', 'Soften the sliced onions until golden; return the beef.', 'Add the stock, grated apple, thyme and bay. Lay the mustard bread on top.', 'Cover and simmer gently for 2 hours until tender — the bread melts into the sauce. Serve with fries or stoemp.'],
    good: ['iron', 'protein'], helps: ['fatigue'],
    note: 'Classic stoofvlees uses beer — this version uses stock, so it is alcohol-free. Cook until no pink remains.' },

  // ---------- Ghanaian 🇬🇭 ----------
  { id: 'kontomire', e: '🌿', name: 'Kontomire stew with ampesi', c: 'gh', type: 'meal', t: 40,
    ing: [['kontomire/spinach', '400 g kontomire (or spinach)'], ['tomato', '3 tomatoes'], ['onion', '1 onion'], ['eggs', '3 eggs, boiled'], ['?yam/plantain', 'yam or plantain to boil'], ['', 'palm oil, pepper, salt']],
    steps: ['Wash and finely chop the leaves; boil 5 min and drain.', 'Fry the onion and blended tomatoes in palm oil for 10 min.', 'Add the leaves and simmer 10 min; add the sliced boiled eggs.', 'Serve with boiled yam or plantain (ampesi) or rice.'],
    good: ['iron', 'folate', 'vitaminC', 'protein'], helps: ['fatigue'],
    note: 'Boil eggs until firm. Instead of salted fish, use egg, salmon or mackerel — avoid high-mercury fish.' },
  { id: 'redred', e: '🫘', name: 'Red red with ripe plantain', c: 'gh', type: 'meal', t: 60,
    ing: [['beans', '2 cups black-eyed beans'], ['tomato', '3 tomatoes'], ['onion', '1 onion'], ['plantain', '2 ripe plantains'], ['?ginger', 'a thumb of ginger'], ['', 'red palm oil, pepper, salt']],
    steps: ['Soak the beans 2 hours (or overnight), then boil about 40 min until soft.', 'Fry the onion, tomatoes and ginger in palm oil for 10 min.', 'Stir in the beans and simmer 10 min.', 'Serve with baked or lightly fried ripe plantain.'],
    good: ['iron', 'fiber', 'protein', 'folate'], helps: ['fatigue', 'digestion'] },
  { id: 'lightsoup', e: '🍲', name: 'Light soup with chicken', c: 'gh', type: 'meal', t: 45,
    ing: [['chicken', '1 kg chicken pieces'], ['tomato', '4 tomatoes'], ['onion', '1 onion'], ['ginger', 'a thumb of ginger'], ['?gardenegg', '3 garden eggs'], ['', 'pepper, salt, stock cube']],
    steps: ['Season the chicken with blended onion and ginger; steam 10 min.', 'Add 1.5 L water, whole tomatoes, garden eggs and onion; boil 15 min.', 'Lift out the vegetables, blend and sieve them back in.', 'Simmer 20 min until the chicken is cooked through. Serve with rice balls or fufu.'],
    good: ['hydration', 'protein'], helps: ['nausea', 'fatigue', 'headache'] },
  { id: 'groundnutsoup', e: '🥜', name: 'Groundnut soup with chicken', c: 'gh', type: 'meal', t: 60,
    ing: [['groundnuts', '4 tbsp groundnut paste'], ['chicken', '1 kg chicken'], ['tomato', '3 tomatoes'], ['onion', '1 onion'], ['?ginger', 'ginger'], ['', 'pepper, salt, stock cube']],
    steps: ['Steam the seasoned chicken for 10 min.', 'Mix the groundnut paste with a cup of warm water until smooth.', 'Add blended tomato, onion and ginger with 1.5 L water; boil 15 min.', 'Stir in the groundnut mix and simmer 30 min, stirring, until the oil rises and the chicken is cooked. Serve with omo tuo.'],
    good: ['protein', 'magnesium', 'energy'], helps: ['cramps', 'fatigue'],
    note: 'Skip if you have a peanut allergy.' },
  { id: 'ampesi', e: '🍆', name: 'Ampesi with garden egg stew', c: 'gh', type: 'meal', t: 40,
    ing: [['yam/plantain', 'yam or green plantain'], ['gardenegg', '6 garden eggs'], ['tomato', '2 tomatoes'], ['onion', '1 onion'], ['eggs', '2 eggs'], ['', 'oil, pepper, salt']],
    steps: ['Boil the peeled yam or plantain for 20 min.', 'Boil the garden eggs 10 min, peel and mash.', 'Fry onion and tomato, add the mashed garden egg and simmer 10 min.', 'Stir in beaten eggs and cook until fully set. Serve with the ampesi.'],
    good: ['fiber', 'potassium', 'folate', 'protein'], helps: ['digestion'] },
  { id: 'oatkoko', e: '🥣', name: 'Spiced oat koko with groundnuts', c: 'gh', type: 'snack', t: 15,
    ing: [['oats', '50 g oats'], ['ginger', '1 tsp grated ginger'], ['?milk', 'a splash of milk'], ['?groundnuts', 'roasted groundnuts to serve'], ['?honey', 'a little honey'], ['', 'a clove, a pinch of pepper']],
    steps: ['Simmer the oats in water with the ginger and a clove for 8 min until creamy.', 'Stir in milk and a little honey.', 'Top with roasted groundnuts — like hausa koko and kose, at home.'],
    good: ['fiber', 'energy', 'magnesium'], helps: ['nausea', 'digestion'] },
  { id: 'kelewele', e: '🍌', name: 'Baked kelewele (spiced plantain)', c: 'gh', type: 'snack', t: 25,
    ing: [['plantain', '2 ripe plantains'], ['ginger', 'a thumb of ginger'], ['?onion', '½ small onion'], ['', 'a little chilli, salt, 1 tbsp oil']],
    steps: ['Blend the ginger, onion, chilli and salt to a paste.', 'Cube the plantain and toss with the paste and oil.', 'Bake 20 min at 220 °C, turning once, until caramelised. Lovely with roasted groundnuts.'],
    good: ['potassium', 'energy', 'fiber'], helps: ['cravings', 'nausea'] },
  { id: 'jollof', e: '🍚', name: 'Vegetable jollof rice', c: 'gh', type: 'meal', t: 60,
    ing: [['rice', '2 cups rice'], ['tomato', '4 tomatoes'], ['onion', '2 onions'], ['bellpepper', '1 bell pepper'], ['?carrot', '2 carrots'], ['?chicken', 'chicken (optional)'], ['', 'tomato paste, thyme, curry, stock']],
    steps: ['Blend tomatoes, pepper and one onion. Fry the other onion, add tomato paste, then the blend; cook 15 min.', 'Add thyme, curry and stock; stir in the washed rice and diced carrots.', 'Cover tightly and cook on low 30 min until the rice is tender.', 'Serve with grilled chicken or a boiled egg.'],
    good: ['energy', 'vitaminC', 'fiber'], helps: [] },
  { id: 'okro', e: '🟢', name: 'Okro stew with tilapia', c: 'gh', type: 'meal', t: 35,
    ing: [['okra', '300 g okro'], ['fish', '2 tilapia fillets'], ['tomato', '3 tomatoes'], ['onion', '1 onion'], ['', 'palm oil, pepper, salt']],
    steps: ['Fry the onion and blended tomatoes in palm oil for 10 min.', 'Add the chopped okro and 200 ml water; simmer 8 min.', 'Lay the fish on top, cover and cook 8–10 min until it flakes easily.', 'Serve with banku or rice.'],
    good: ['folate', 'fiber', 'protein', 'omega3'], helps: ['digestion'],
    note: 'Tilapia is a low-mercury fish. Cook until opaque and flaky.' },

  // ---------- Everyday 🌍 ----------
  { id: 'salmontray', e: '🐟', name: 'Salmon, sweet potato & broccoli traybake', c: 'any', type: 'meal', t: 35,
    ing: [['salmon', '2 salmon fillets'], ['sweetpotato', '2 sweet potatoes'], ['broccoli', '1 head broccoli'], ['?lemon', '1 lemon'], ['', 'olive oil, garlic, salt, pepper']],
    steps: ['Cube the sweet potatoes, toss with oil and roast 15 min at 210 °C.', 'Add the broccoli and salmon, drizzle with oil and lemon.', 'Roast 12–15 min more until the salmon flakes easily.'],
    good: ['omega3', 'protein', 'fiber', 'vitaminC'], helps: ['cramps', 'fatigue'],
    note: 'Salmon once or twice a week is great in pregnancy. Cook until it flakes; avoid smoked or raw fish.' },
  { id: 'dal', e: '🍛', name: 'Lentil & spinach dal', c: 'any', type: 'meal', t: 30,
    ing: [['lentils', '200 g red lentils'], ['spinach', '2 handfuls spinach'], ['tomato', '2 tomatoes'], ['?ginger', 'ginger'], ['onion', '1 onion'], ['?garlic', 'garlic'], ['?rice', 'rice to serve'], ['?coconutmilk', 'a splash of coconut milk'], ['', 'curry spices, oil']],
    steps: ['Fry the onion, garlic and ginger with the spices for 3 min.', 'Add the rinsed lentils, chopped tomatoes and 700 ml water; simmer 20 min.', 'Stir in the spinach (and coconut milk) until wilted.', 'Serve with rice and a squeeze of lemon.'],
    good: ['iron', 'folate', 'fiber', 'protein'], helps: ['fatigue', 'digestion'] },
  { id: 'avotoast', e: '🥑', name: 'Smashed chickpea & avocado toast', c: 'any', type: 'snack', t: 10,
    ing: [['chickpeas', '½ tin chickpeas'], ['avocado', '1 avocado'], ['?lemon', 'lemon juice'], ['bread', '2 slices wholegrain bread'], ['?tomato', 'tomato slices']],
    steps: ['Mash the chickpeas and avocado with lemon, salt and pepper.', 'Pile onto toasted bread and top with tomato.'],
    good: ['folate', 'fiber', 'potassium'], helps: ['cravings'] },
  { id: 'omelette', e: '🍳', name: 'Garden veggie omelette', c: 'any', type: 'meal', t: 12,
    ing: [['eggs', '3 eggs'], ['?spinach', 'a handful of spinach'], ['?tomato', '1 tomato'], ['?mushroom', 'a few mushrooms'], ['?cheese', 'a little pasteurised cheese'], ['', 'butter or oil']],
    steps: ['Soften the vegetables in a pan for 3 min.', 'Pour in the beaten eggs, sprinkle with cheese.', 'Cook gently until completely set, then fold.'],
    good: ['protein', 'folate', 'iron'], helps: ['fatigue'],
    note: 'Cook until the egg is completely set — no runny yolks.' },
  { id: 'parfait', e: '🍓', name: 'Yoghurt, berry & oat parfait', c: 'any', type: 'snack', t: 5,
    ing: [['yoghurt', '200 g yoghurt'], ['berries', 'a handful of berries'], ['oats', '2 tbsp oats'], ['?honey', 'a drizzle of honey']],
    steps: ['Layer yoghurt, berries and oats in a glass.', 'Finish with a drizzle of honey.'],
    good: ['calcium', 'fiber', 'vitaminC'], helps: ['digestion', 'cravings'],
    note: 'Choose pasteurised yoghurt.' },
  { id: 'nanatoast', e: '🍞', name: 'Banana & groundnut butter toast', c: 'any', type: 'snack', t: 5,
    ing: [['bread', '1–2 slices wholegrain bread'], ['banana', '1 banana'], ['groundnuts', 'groundnut (peanut) butter']],
    steps: ['Toast the bread and spread with groundnut butter.', 'Top with sliced banana and a pinch of cinnamon.'],
    good: ['magnesium', 'potassium', 'energy'], helps: ['cramps', 'sleep', 'cravings'] },
  { id: 'cinnamonmilk', e: '🥛', name: 'Warm cinnamon & honey milk', c: 'any', type: 'drink', t: 5,
    ing: [['milk', '1 mug milk'], ['?cinnamon', 'a pinch of cinnamon'], ['?honey', '1 tsp honey']],
    steps: ['Warm the milk gently with the cinnamon.', 'Stir in the honey and sip before bed.'],
    good: ['calcium'], helps: ['sleep'] },

  // ---------- Juices & smoothies 🍹 ----------
  { id: 'gingertonic', e: '🫚', name: 'Ginger & lemon morning tonic', c: 'any', type: 'drink', t: 5,
    ing: [['ginger', '2 cm fresh ginger, sliced'], ['lemon', '½ lemon'], ['?honey', '1 tsp honey']],
    steps: ['Pour hot water over the ginger and let it steep 5 min.', 'Add lemon juice and honey. Sip slowly.'],
    good: ['hydration'], helps: ['nausea', 'digestion', 'bloating'],
    note: 'Fresh ginger in food amounts (about 1 g a day) is generally considered fine in pregnancy.' },
  { id: 'beetjuice', e: '🧃', name: 'Beet, carrot & orange iron booster', c: 'any', type: 'drink', t: 10,
    ing: [['beetroot', '1 small beetroot'], ['carrot', '2 carrots'], ['orange', '2 oranges'], ['?ginger', 'a little ginger']],
    steps: ['Peel and chop everything.', 'Juice or blend with a splash of water, then strain.', 'Drink straight away — the vitamin C helps your body absorb the iron.'],
    good: ['iron', 'vitaminC', 'folate'], helps: ['fatigue'],
    note: 'Wash vegetables well and drink home-made juice fresh.' },
  { id: 'lassi', e: '🥭', name: 'Mango & banana lassi', c: 'any', type: 'drink', t: 5,
    ing: [['mango', '1 ripe mango'], ['banana', '1 banana'], ['yoghurt', '200 g yoghurt'], ['?cinnamon', 'a pinch of cardamom or cinnamon']],
    steps: ['Blend everything with a few ice cubes until smooth.'],
    good: ['calcium', 'energy', 'potassium'], helps: ['cravings', 'cramps'],
    note: 'Choose pasteurised yoghurt.' },
  { id: 'greenglow', e: '🥤', name: 'Green glow smoothie', c: 'any', type: 'drink', t: 5,
    ing: [['spinach', 'a handful of spinach'], ['pineapple', '1 cup pineapple'], ['cucumber', '½ cucumber'], ['apple', '1 apple']],
    steps: ['Blend everything with a cup of cold water until smooth.'],
    good: ['folate', 'vitaminC', 'hydration'], helps: ['bloating', 'digestion'] },
  { id: 'watermelon', e: '🍉', name: 'Watermelon & mint cooler', c: 'any', type: 'drink', t: 5,
    ing: [['watermelon', '3 cups watermelon'], ['mint', 'a few mint leaves'], ['?lemon', 'a squeeze of lime']],
    steps: ['Blend the watermelon with the mint and lime.', 'Serve over ice.'],
    good: ['hydration', 'potassium'], helps: ['swelling', 'headache', 'bloating'] },
  { id: 'pawpaw', e: '🍈', name: 'Pawpaw & orange sunrise', c: 'gh', type: 'drink', t: 5,
    ing: [['pawpaw', '1 cup fully ripe pawpaw'], ['orange', '2 oranges, juiced'], ['?banana', '½ banana']],
    steps: ['Blend the pawpaw, orange juice and banana until smooth.'],
    good: ['vitaminC', 'fiber'], helps: ['digestion'],
    note: 'Use only fully ripe (soft, orange) pawpaw — avoid unripe or semi-ripe papaya in pregnancy.' },
  { id: 'sobolo', e: '🌺', name: 'Sobolo (hibiscus, ginger & pineapple)', c: 'gh', type: 'drink', t: 30, preg: false,
    ing: [['hibiscus', '1 cup dried sobolo leaves'], ['ginger', 'a thumb of ginger'], ['?pineapple', 'pineapple peel or chunks'], ['', 'cloves, a little sugar']],
    steps: ['Rinse the leaves; boil with ginger, cloves and pineapple in 2 L water for 20 min.', 'Strain, sweeten lightly and chill.'],
    good: ['vitaminC', 'hydration'], helps: ['bloating'],
    note: 'Not advised in pregnancy — hibiscus may affect the womb. Enjoy it at other times.' },
  { id: 'coconutcooler', e: '🥥', name: 'Coconut & pineapple hydrator', c: 'any', type: 'drink', t: 5,
    ing: [['coconut', '1 cup coconut water'], ['pineapple', '½ cup pineapple'], ['?lemon', 'a squeeze of lime']],
    steps: ['Blend and pour over ice.'],
    good: ['hydration', 'potassium'], helps: ['cramps', 'headache', 'swelling'] },
  { id: 'pearsmoothie', e: '🍐', name: 'Pear, ginger & oat smoothie', c: 'any', type: 'drink', t: 5,
    ing: [['pear', '1 ripe pear'], ['oats', '2 tbsp oats'], ['?ginger', 'a little ginger'], ['yoghurt/milk', '150 ml yoghurt or milk']],
    steps: ['Blend everything until smooth.'],
    good: ['fiber', 'calcium'], helps: ['digestion', 'nausea'] },
];
const RECIPE = Object.fromEntries(RECIPES.map(r => [r.id, r]));
const CUISINE = { be: ['🇧🇪', 'Belgian'], gh: ['🇬🇭', 'Ghanaian'], any: ['🌍', 'Everyday'] };

/* ---------------- what her body needs now ---------------- */
const NUTRIENT = {
  iron: ['iron', '🥬 Leafy greens & beans'], folate: ['folate', '🫘 Beans & greens'], calcium: ['calcium', '🥛 Yoghurt & milk'],
  protein: ['protein', '🥚 Eggs, fish & beans'], omega3: ['omega-3', '🐟 Salmon & tilapia'], fiber: ['fibre', '🥣 Oats & whole grains'],
  vitaminC: ['vitamin C', '🍊 Citrus & peppers'], magnesium: ['magnesium', '🥜 Groundnuts & bananas'], potassium: ['potassium', '🍌 Bananas & potatoes'],
  hydration: ['fluids', '💧 Water, soups & fruit'], energy: ['slow energy', '🍠 Yam, oats & sweet potato'],
};
const SYMPTOM_HELP = {
  Nausea: 'nausea', Bloating: 'bloating', Cramps: 'cramps', Fatigue: 'fatigue', Headache: 'headache', Insomnia: 'sleep',
  'Digestive issues': 'digestion', Cravings: 'cravings', 'Breast tenderness': 'bloating', Backache: 'cramps', Dizziness: 'fatigue', 'Mood swings': 'cravings',
};
const HELP = {
  nausea: ['🫚 Ginger for nausea', 'Ginger and gentle flavours may settle nausea.'],
  bloating: ['🍉 Water-rich food for bloating', 'Water-rich and light on salt to ease bloating.'],
  cramps: ['🍌 Magnesium for cramps', 'Magnesium and potassium may soothe cramps.'],
  fatigue: ['🥬 Iron for energy', 'Iron-rich to help with tiredness.'],
  headache: ['💧 Fluids for headaches', 'Hydrating — headaches often come from not drinking enough.'],
  sleep: ['🥛 Calm foods for sleep', 'Warm and calming before bed.'],
  digestion: ['🍐 Fibre for digestion', 'Fibre to keep things moving gently.'],
  cravings: ['🍌 Sweet, nourishing swaps', 'Satisfies a sweet craving the nourishing way.'],
  swelling: ['🍉 Hydration for swelling', 'Hydrating and potassium-rich for swollen feet.'],
};

function nourishNeeds(M) {
  const P = M.pregnant ? pregnancy() : null;
  let focus, why;
  if (P) {
    if (P.trimester === 1) { focus = ['folate', 'protein', 'hydration']; why = 'Folate and gentle foods for your first trimester'; }
    else if (P.trimester === 2) { focus = ['iron', 'calcium', 'protein', 'omega3']; why = 'Iron and calcium for you and your growing baby'; }
    else { focus = ['fiber', 'iron', 'calcium', 'omega3']; why = 'Fibre, iron and calcium for your third trimester'; }
  } else {
    ({ focus, why } = {
      Menstrual: { focus: ['iron', 'vitaminC', 'magnesium', 'hydration'], why: 'Replenish iron during your period' },
      Follicular: { focus: ['protein', 'fiber', 'vitaminC'], why: 'Fresh, energising food as your energy rises' },
      Fertile: { focus: ['folate', 'omega3', 'vitaminC', 'protein'], why: 'Folate and antioxidants around ovulation' },
      Ovulation: { focus: ['folate', 'omega3', 'vitaminC', 'protein'], why: 'Folate and antioxidants around ovulation' },
      Luteal: { focus: ['magnesium', 'fiber', 'calcium'], why: 'Magnesium and slow carbs to ease PMS' },
      Late: { focus: ['magnesium', 'hydration', 'iron'], why: 'Calm, nourishing food while you wait' },
    }[M.phase] || { focus: ['iron', 'fiber', 'protein'], why: 'Balanced, nourishing food' });
  }
  // What she logged in the last 3 days.
  const helps = new Set();
  for (let i = 0; i < 3; i++) {
    const d = state.days[toKey(addDays(today(), -i))];
    if (!d) continue;
    (d.symptoms || []).forEach(s => SYMPTOM_HELP[s] && helps.add(SYMPTOM_HELP[s]));
    if (d.feeling === 'low' || d.feeling === 'sad') helps.add('cravings');
  }
  return { focus, helps: [...helps], why, preg: !!P, trimester: P && P.trimester, phase: M.phase };
}

/* ---------------- matching & scoring ---------------- */
function coreIngredients(r) { return r.ing.filter(([k]) => k && !k.startsWith('?')).map(([k]) => k); }
function hasKey(key, have) { return key.replace('?', '').split('/').some(k => have.has(k)); }
function matchInfo(r, have) {
  const core = coreIngredients(r);
  const got = core.filter(k => hasKey(k, have));
  const missing = core.filter(k => !hasKey(k, have)).map(k => k.split('/').map(x => ING[x] ? ING[x].l.toLowerCase() : x).join(' or '));
  const used = r.ing.filter(([k]) => k && hasKey(k, have)).length;
  return { ratio: core.length ? got.length / core.length : 0, got: got.length, total: core.length, missing, used };
}
function jitter(id) { let h = 0; for (const ch of id + toKey(today())) h = (h * 31 + ch.charCodeAt(0)) | 0; return (Math.abs(h) % 100) / 100; }
function allowed(r, N) { return !(N.preg && r.preg === false); }
function scoreRecipe(r, N, have) {
  let s = 2 * r.good.filter(g => N.focus.includes(g)).length + 3 * r.helps.filter(h => N.helps.includes(h)).length + jitter(r.id);
  if (have && have.size) { const m = matchInfo(r, have); s += m.ratio * 12 + m.used * 0.5; if (m.used === 0) s -= 20; }
  return s;
}
function reasons(r, N) {
  const out = [];
  r.helps.filter(h => N.helps.includes(h)).forEach(h => out.push(HELP[h][1]));
  r.good.filter(g => N.focus.includes(g)).forEach(g => out.push(`Rich in ${NUTRIENT[g][0]} — ${nutrientWhy(g, N)}.`));
  if (!out.length) r.good.slice(0, 2).forEach(g => out.push(`A good source of ${NUTRIENT[g][0]}.`));
  return out;
}
function nutrientWhy(g, N) {
  const baby = N.preg;
  return {
    iron: baby ? 'supports your growing blood supply and fights tiredness' : N.phase === 'Menstrual' ? 'replaces the iron you lose during your period' : 'keeps your energy up',
    folate: baby ? 'important for your baby’s development' : 'supports healthy new cells',
    calcium: baby ? 'builds strong bones for you and baby' : 'keeps your bones strong',
    protein: baby ? 'helps your baby grow' : 'helps your body repair and stay full',
    omega3: baby ? 'supports your baby’s brain and eyes' : 'good for your heart and mood',
    fiber: 'keeps digestion moving', vitaminC: 'helps your body absorb iron', magnesium: 'may ease cramps and PMS',
    potassium: 'helps balance fluids', hydration: 'keeps you hydrated', energy: 'gives steady energy without the crash',
  }[g];
}
function shortBenefit(r, N) {
  const h = r.helps.find(x => N.helps.includes(x));
  if (h) return HELP[h][0].replace(/^\S+\s/, '');
  const g = r.good.find(x => N.focus.includes(x)) || r.good[0];
  return `Rich in ${NUTRIENT[g][0]}`;
}

/* ---------------- Home: Nourish card ---------------- */
function nourishCard(M) {
  const N = nourishNeeds(M);
  const pool = RECIPES.filter(r => allowed(r, N)).sort((a, b) => scoreRecipe(b, N) - scoreRecipe(a, N));
  const picks = [...pool.filter(r => r.type !== 'drink').slice(0, 3), ...pool.filter(r => r.type === 'drink').slice(0, 1)];
  const chips = [...N.helps.map(h => HELP[h][0]), ...N.focus.map(f => NUTRIENT[f][1])].slice(0, 4);
  return `
  <div class="section-head"><h2>Nourish</h2><button class="link" data-action="food-kitchen">Kitchen ✨</button></div>
  <section class="card nourish">
    <p class="nourish-why">${esc(N.why)}${N.helps.length ? ' — and what you’ve logged lately' : ''}</p>
    <div class="tags">${chips.map(c => `<span class="tag">${c}</span>`).join('')}</div>
    <div class="recipe-row">${picks.map(r => recipeTile(r, N)).join('')}</div>
    <button class="btn primary block" data-action="food-kitchen">✨ Cook with what I have</button>
  </section>`;
}
function recipeTile(r, N) {
  const [flag] = CUISINE[r.c];
  return `<button class="rtile" data-action="food-recipe" data-id="${r.id}" data-from="home">
    <span class="rtile-e">${r.e}</span>
    <b>${esc(r.name)}</b>
    <span class="rtile-meta">${flag} · ${r.type === 'drink' ? 'drink' : r.t + ' min'}</span>
    <span class="pill high">${esc(shortBenefit(r, N))}</span>
  </button>`;
}

/* ---------------- Kitchen companion (sheet) ---------------- */
ui.food = { view: 'kitchen', id: null, from: null, type: 'all', cuisine: 'all' };
function pantry() { return new Set(state.settings.pantry || []); }

function kitchenResults(N, have) {
  const f = ui.food;
  return RECIPES.filter(r => allowed(r, N))
    .filter(r => f.type === 'all' || (f.type === 'drink' ? r.type === 'drink' : r.type !== 'drink'))
    .filter(r => f.cuisine === 'all' || r.c === f.cuisine)
    .map(r => ({ r, m: matchInfo(r, have), s: scoreRecipe(r, N, have) }))
    .filter(x => !have.size || x.m.used > 0)
    .sort((a, b) => b.s - a.s);
}

function companionMessage(N, have, results) {
  const name = state.settings.name.trim();
  const stage = N.preg ? `your ${['', 'first', 'second', 'third'][N.trimester]} trimester` : N.phase ? `your ${N.phase.toLowerCase()} phase` : 'today';
  const blocked = N.preg && have.has('hibiscus') ? ' Sobolo (hibiscus) is best avoided in pregnancy, so I’ve left it out.' : '';
  if (!have.size) {
    return `Akwaaba${name ? ', ' + esc(name) : ''}! Tap what’s in your kitchen and I’ll suggest something nourishing for ${stage}${N.helps.length ? ' and how you’ve been feeling' : ''}. Here are a few ideas to start.${blocked}`;
  }
  if (!results.length) return `I couldn’t find a recipe with those yet — try adding a vegetable or a protein.${blocked}`;
  const labels = [...have].map(k => ING[k] ? ING[k].l.toLowerCase() : k);
  const list = labels.length > 3 ? `${labels.slice(0, 3).join(', ')} and more` : labels.join(labels.length === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1');
  const best = results[0];
  const full = results.filter(x => x.m.ratio === 1).length;
  const why = reasons(best.r, N)[0].replace(/\.$/, '').toLowerCase();
  return `With ${esc(list)}, you could make <b>${esc(best.r.name)}</b> — ${esc(why)}. ${full ? `You have everything for ${plural(full, 'recipe')}.` : `Most of these need just one or two extras.`}${blocked}`;
}

function kitchenHTML() {
  const M = model(), N = nourishNeeds(M), have = pantry(), f = ui.food;
  const results = kitchenResults(N, have);
  const seg = (field, opts) => `<div class="seg-mini" role="group">${opts.map(([v, l]) => `<button data-action="food-filter" data-field="${field}" data-v="${v}" class="${f[field] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  return `
  <div class="sheet-body kitchen">
    <div class="grabber"></div>
    <div class="page-head center" style="padding:0">
      <button class="icon-btn" data-action="close-sheet" aria-label="Close">${ICON.close}</button>
      <h1>Kitchen companion</h1><span style="width:42px"></span>
    </div>
    <div class="bubble" id="kitchen-bubble"><span class="av">${LOTUS}</span><p>${companionMessage(N, have, results)}</p></div>
    ${seg('type', [['all', 'All'], ['meal', 'Meals & snacks'], ['drink', 'Juices & smoothies']])}
    ${seg('cuisine', [['all', 'All'], ['be', '🇧🇪 Belgian'], ['gh', '🇬🇭 Ghanaian'], ['any', '🌍 Everyday']])}
    <h3>What’s in your kitchen? ${have.size ? `<button class="link" data-action="food-clear">Clear</button>` : ''}</h3>
    ${ING_GROUPS.map(([g, items]) => `
      <p class="ing-group">${g}</p>
      <div class="chiprow">${items.map(([k, e, l]) => `<button class="ing ${have.has(k) ? 'on' : ''}" data-action="food-ing" data-k="${k}" aria-pressed="${have.has(k)}">${e} ${esc(l)}</button>`).join('')}</div>`).join('')}
    <h3>${have.size ? 'You can make' : 'Ideas for you'}</h3>
    <div id="kitchen-results">${resultsHTML(results.slice(0, 8), N, have)}</div>
    <p class="disclaimer" style="margin-top:14px">Suggestions are general guidance based on your logs, not medical advice. Follow your midwife or doctor on diet and allergies.</p>
  </div>`;
}

function resultsHTML(list, N, have) {
  if (!list.length) return '<p class="muted small">Nothing matches yet — try another ingredient or filter.</p>';
  return list.map(({ r, m }) => {
    const [flag, cname] = CUISINE[r.c];
    const bar = have.size ? `<div class="match"><span style="width:${Math.round(m.ratio * 100)}%"></span></div>
      <span class="small muted">${m.ratio === 1 ? '✓ You have everything' : `You have ${m.got} of ${m.total} · need ${esc(m.missing.slice(0, 2).join(', '))}${m.missing.length > 2 ? '…' : ''}`}</span>` : '';
    return `<button class="result" data-action="food-recipe" data-id="${r.id}" data-from="kitchen">
      <span class="result-e">${r.e}</span>
      <span class="result-body"><b>${esc(r.name)}</b>
        <span class="small muted">${flag} ${cname} · ${r.type === 'drink' ? 'juice / smoothie' : r.t + ' min'} · ${esc(shortBenefit(r, N))}</span>
        ${bar}</span>
    </button>`;
  }).join('');
}

function recipeHTML() {
  const r = RECIPE[ui.food.id];
  const M = model(), N = nourishNeeds(M), have = pantry();
  const [flag, cname] = CUISINE[r.c];
  const backBtn = ui.food.from === 'kitchen'
    ? `<button class="icon-btn" data-action="food-back" aria-label="Back">${ICON.back}</button>`
    : `<button class="icon-btn" data-action="close-sheet" aria-label="Close">${ICON.close}</button>`;
  const safe = N.preg ? (r.preg === false ? '<span class="pill rose">Not for pregnancy</span>' : '<span class="pill high">Pregnancy-friendly ✓</span>') : '';
  return `
  <div class="sheet-body recipe">
    <div class="grabber"></div>
    <div class="page-head center" style="padding:0">${backBtn}<h1 style="font-size:20px">Recipe</h1><span style="width:42px"></span></div>
    <div class="rhero"><span>${r.e}</span></div>
    <h2 class="rtitle">${esc(r.name)}</h2>
    <p class="rmeta">${flag} ${cname} · ${r.type === 'drink' ? 'juice / smoothie' : r.type === 'snack' ? 'snack' : 'meal'} · ⏱ ${r.t} min ${safe}</p>
    <section class="card blush why-now">
      <b class="serif">Why it’s good for you now</b>
      <ul>${reasons(r, N).slice(0, 3).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>
    <h3>Ingredients</h3>
    <ul class="ing-list">${r.ing.map(([k, text]) => {
      const optional = k.startsWith('?');
      const ok = k && hasKey(k, have);
      return `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : k ? '○' : '·'}</span>${esc(text)}${optional ? ' <em>(optional)</em>' : ''}</li>`;
    }).join('')}</ul>
    <h3>Method</h3>
    <ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    ${r.note ? `<p class="safety">🛡️ ${esc(r.note)}</p>` : ''}
    <button class="btn primary block" style="margin-top:18px" data-action="${ui.food.from === 'kitchen' ? 'food-back' : 'close-sheet'}">${ui.food.from === 'kitchen' ? 'Back to suggestions' : 'Done'}</button>
  </div>`;
}

function openFoodSheet() {
  ui.sheetDate = null;
  const dlg = $('#sheet');
  dlg.innerHTML = ui.food.view === 'recipe' ? recipeHTML() : kitchenHTML();
  if (!dlg.open) dlg.showModal();
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action^="food-"]');
  if (!el) return;
  const dlg = $('#sheet');
  switch (el.dataset.action) {
    case 'food-kitchen': ui.food.view = 'kitchen'; openFoodSheet(); dlg.scrollTop = 0; break;
    case 'food-recipe': {
      ui.food.kScroll = ui.food.view === 'kitchen' && dlg.open ? dlg.scrollTop : 0;
      Object.assign(ui.food, { view: 'recipe', id: el.dataset.id, from: el.dataset.from });
      openFoodSheet(); dlg.scrollTop = 0;
      break;
    }
    case 'food-back': ui.food.view = 'kitchen'; openFoodSheet(); dlg.scrollTop = ui.food.kScroll || 0; break;
    case 'food-filter': ui.food[el.dataset.field] = el.dataset.v; { const y = dlg.scrollTop; openFoodSheet(); dlg.scrollTop = y; } break;
    case 'food-clear': state.settings.pantry = []; save(); { const y = dlg.scrollTop; openFoodSheet(); dlg.scrollTop = y; } break;
    case 'food-ing': {
      const set = pantry(), k = el.dataset.k;
      set.has(k) ? set.delete(k) : set.add(k);
      state.settings.pantry = [...set]; save();
      el.classList.toggle('on', set.has(k)); el.setAttribute('aria-pressed', set.has(k));
      // Update just the companion message and results, so the chip rows keep their scroll position.
      const M = model(), N = nourishNeeds(M), results = kitchenResults(N, set);
      $('#kitchen-bubble p').innerHTML = companionMessage(N, set, results);
      $('#kitchen-results').innerHTML = resultsHTML(results.slice(0, 8), N, set);
      const h = [...dlg.querySelectorAll('.kitchen h3')].pop(); if (h) h.textContent = set.size ? 'You can make' : 'Ideas for you';
      break;
    }
  }
});
