export const PRODUCTS = [
    {
        id: 1,
        name: 'Apples',
        category: 'apples',
        description: 'Fresh, crisp, and sweet apples. Hand-picked from our orchard, perfect for snacking or baking.',
        taste_profile: 'Sweet with a hint of tartness',
        texture_profile: 'Crisp and juicy',
        image_path: '/images/products/Red Delicious.png'
    },
    {
        id: 2,
        name: 'Persimmons',
        category: 'persimmons',
        description: 'Sweet, rich, and culturally revered. Our orchard grows the two most famous varieties: the astringent Hachiya and the crisp Fuyu.',
        taste_profile: 'Ranges from honey-sweet to rich and pulpy depending on variety',
        texture_profile: 'Ranges from crisp and apple-like to creamy and jelly-like',
        image_path: '/images/products/Orange Persimmons.png'
    },
    {
        id: 3,
        name: 'Fuzzy Kiwis',
        category: 'kiwis',
        description: 'Tangy and sweet fuzzy kiwis. Rich in vitamin C, perfect for smoothies or eating fresh.',
        taste_profile: 'Tangy and sweet with tropical notes, slightly tart',
        texture_profile: 'Soft and juicy with tiny edible black seeds, smooth flesh',
        image_path: '/images/products/Fuzzy Kiwis.png'
    },
    {
        id: 4,
        name: 'Plums',
        category: 'plums',
        description: 'Sweet and tart plums. Perfect for snacking or making preserves.',
        taste_profile: 'Sweet with a pleasant tartness, slightly floral',
        texture_profile: 'Firm yet tender, juicy with smooth skin',
        image_path: '/images/products/Plums.png'
    },
    {
        id: 5,
        name: 'Pears',
        category: 'pears',
        description: 'Sweet, juicy, and crunchy with a hint of floral aroma. Hand-picked from our family orchard.',
        taste_profile: 'Sweet with a hint of floral aroma',
        texture_profile: 'Juicy and crunchy',
        image_path: '/images/products/French Butter Pear.png'
    },
    {
        id: 6,
        name: 'Cherries',
        category: 'cherries',
        description: 'Sweet and juicy cherries. Perfect for snacking, baking, or making preserves.',
        taste_profile: 'Sweet and slightly tart with a rich, fruity flavor',
        texture_profile: 'Firm and crisp, bursting with juice',
        image_path: '/images/products/Cherries.png'
    }
];

export const VARIETIES = [
    // Apples
    {
        id: 1,
        product_id: 1,
        name: 'Red Delicious',
        price_per_kg: 399,
        description: 'The classic red apple. Known for its iconic heart shape and bright red skin.',
        taste_profile: 'Mildly sweet with very little acidity',
        texture_profile: 'Soft and mealy flesh, thick skin'
    },
    {
        id: 2,
        product_id: 1,
        name: 'Granny Smith',
        price_per_kg: 429,
        description: 'A bright green apple that is famous for its tartness. Excellent for baking.',
        taste_profile: 'Sharp, acidic, and tart',
        texture_profile: 'Firm, crisp, and juicy'
    },
    {
        id: 3,
        product_id: 1,
        name: 'Gala',
        price_per_kg: 399,
        description: 'A popular snacking apple with a yellow-orange skin and red striping.',
        taste_profile: 'Sweet, aromatic, and vanilla-like',
        texture_profile: 'Fine-grained, crisp, and juicy'
    },
    {
        id: 4,
        product_id: 1,
        name: 'Golden Delicious',
        price_per_kg: 329,
        description: 'A versatile yellow apple that is great for both eating fresh and cooking.',
        taste_profile: 'Sweet and mellow, honey-like',
        texture_profile: 'Crisp flesh that resists browning'
    },
    // Pears
    {
        id: 5,
        product_id: 5,
        name: 'Nashpati Pear',
        price_per_kg: 149,
        description: 'The Indian Pear, known for its crunch and refreshing quality.',
        taste_profile: 'Mildly sweet and refreshing',
        texture_profile: 'Very crunchy and gritty'
    },
    {
        id: 6,
        product_id: 5,
        name: 'Bosc Pear',
        price_per_kg: 399,
        description: 'An elegant pear with a long neck and russet skin.',
        taste_profile: 'Sweet with notes of wood and spice',
        texture_profile: 'Dense, crisp, and smooth'
    },
    {
        id: 7,
        product_id: 5,
        name: 'Concorde Pear',
        price_per_kg: 379,
        description: 'A long, narrow pear that is excellent for cooking and salads.',
        taste_profile: 'Sweet and aromatic with a hint of vanilla',
        texture_profile: 'Firm and dense, holds shape well'
    },
    {
        id: 8,
        product_id: 5,
        name: 'Red Max',
        price_per_kg: 449,
        description: 'A delicious red pear variety.',
        taste_profile: 'Sweet and juicy',
        texture_profile: 'Crisp'
    },
    // Persimmons
    {
        id: 9,
        product_id: 2,
        name: 'Hachiya',
        price_per_kg: 649,
        description: 'Acorn-shaped and tastes best when overripe like tomatoes. Jelly-like, creamy, and tangy-sweet at peak maturity. Fantastic for baking muffins, cookies, breads, and puddings.',
        taste_profile: 'Rich, pulpy, and sweet (astringent when unripe)',
        texture_profile: 'Jelly-like and creamy'
    },
    {
        id: 13,
        product_id: 2,
        name: 'Fuyu',
        price_per_kg: 599,
        description: 'Squat and stubby, kind of like a flattened apple. Boasts a spicy-sweet flavor with unique tropical and cinnamon hints. Excellent eaten raw and firm, or baked for a savory side.',
        taste_profile: 'Spicy-sweet with tropical and cinnamon hints',
        texture_profile: 'Hard and crisp, like an apple'
    },
    // Single Varieties
    { id: 10, product_id: 3, name: 'Fuzzy Kiwis', price_per_kg: 479 },
    { id: 11, product_id: 4, name: 'Plums', price_per_kg: 299 },
    { id: 12, product_id: 6, name: 'Cherries', price_per_kg: 599 }
];

export const INITIAL_INVENTORY = [
    { variety_id: 1, is_active: true, pack_sizes: [{ weight: 5, stock: 50, price: 399 * 5 }, { weight: 10, stock: 30, price: 399 * 10 }] },
    { variety_id: 2, is_active: true, pack_sizes: [{ weight: 5, stock: 40, price: 429 * 5 }, { weight: 10, stock: 25, price: 429 * 10 }] },
    { variety_id: 3, is_active: true, pack_sizes: [{ weight: 5, stock: 35, price: 399 * 5 }, { weight: 10, stock: 20, price: 399 * 10 }] },
    { variety_id: 4, is_active: true, pack_sizes: [{ weight: 5, stock: 45, price: 329 * 5 }, { weight: 10, stock: 28, price: 329 * 10 }] },
    { variety_id: 5, is_active: true, pack_sizes: [{ weight: 5, stock: 30, price: 149 * 5 }, { weight: 10, stock: 15, price: 149 * 10 }] },
    { variety_id: 6, is_active: true, pack_sizes: [{ weight: 5, stock: 25, price: 399 * 5 }, { weight: 10, stock: 12, price: 399 * 10 }] },
    { variety_id: 7, is_active: true, pack_sizes: [{ weight: 5, stock: 20, price: 379 * 5 }, { weight: 10, stock: 10, price: 379 * 10 }] },
    { variety_id: 8, is_active: true, pack_sizes: [{ weight: 5, stock: 15, price: 449 * 5 }, { weight: 10, stock: 8, price: 449 * 10 }] },
    { variety_id: 9, is_active: true, pack_sizes: [{ weight: 0.5, stock: 40, price: 350 }, { weight: 1, stock: 30, price: 649 }, { weight: 5, stock: 15, price: 649 * 5 }] }, // Hachiya
    { variety_id: 13, is_active: true, pack_sizes: [{ weight: 0.5, stock: 40, price: 320 }, { weight: 1, stock: 30, price: 599 }, { weight: 5, stock: 15, price: 599 * 5 }] }, // Fuyu
    { variety_id: 10, is_active: true, pack_sizes: [{ weight: 5, stock: 25, price: 479 * 5 }, { weight: 10, stock: 12, price: 479 * 10 }] },
    { variety_id: 11, is_active: true, pack_sizes: [{ weight: 5, stock: 40, price: 299 * 5 }, { weight: 10, stock: 20, price: 299 * 10 }] },
    { variety_id: 12, is_active: true, pack_sizes: [{ weight: 5, stock: 20, price: 599 * 5 }, { weight: 10, stock: 10, price: 599 * 10 }] }
];
