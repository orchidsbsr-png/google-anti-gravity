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
        name: 'Orange Persimmons',
        category: 'persimmons',
        description: 'Sweet and juicy orange persimmons. Rich in vitamins and perfect for a healthy snack.',
        taste_profile: 'Very sweet with honey-like flavor and subtle cinnamon notes',
        texture_profile: 'Smooth and custard-like when ripe, jelly-like interior',
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
    // Single Varieties
    { id: 9, product_id: 2, name: 'Orange Persimmons', price_per_kg: 649 },
    { id: 10, product_id: 3, name: 'Fuzzy Kiwis', price_per_kg: 479 },
    { id: 11, product_id: 4, name: 'Plums', price_per_kg: 299 },
    { id: 12, product_id: 6, name: 'Cherries', price_per_kg: 599 }
];

export const INITIAL_INVENTORY = [
    { variety_id: 1, stock_5kg: 50, stock_10kg: 30, is_active: true },
    { variety_id: 2, stock_5kg: 40, stock_10kg: 25, is_active: true },
    { variety_id: 3, stock_5kg: 35, stock_10kg: 20, is_active: true },
    { variety_id: 4, stock_5kg: 45, stock_10kg: 28, is_active: true },
    { variety_id: 5, stock_5kg: 30, stock_10kg: 15, is_active: true },
    { variety_id: 6, stock_5kg: 25, stock_10kg: 12, is_active: true },
    { variety_id: 7, stock_5kg: 20, stock_10kg: 10, is_active: true },
    { variety_id: 8, stock_5kg: 15, stock_10kg: 8, is_active: true },
    { variety_id: 9, stock_5kg: 30, stock_10kg: 15, is_active: true },
    { variety_id: 10, stock_5kg: 25, stock_10kg: 12, is_active: true },
    { variety_id: 11, stock_5kg: 40, stock_10kg: 20, is_active: true },
    { variety_id: 12, stock_5kg: 20, stock_10kg: 10, is_active: true }
];
