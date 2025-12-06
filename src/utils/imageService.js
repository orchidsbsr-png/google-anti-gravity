export const getProductImage = (productName, { variety } = {}) => {
    // Base path for local images
    const basePath = '/images/products/';

    // Clean up names for filenames
    // This is a simple implementation. In a real app, you might want to check if the file exists
    // or have the image path stored in the database.

    let filename = productName;
    if (variety) {
        filename = variety;
    }

    // Handle potential file extensions or naming conventions
    // We'll assume .png for now as per the prompt's examples, but could be .jpg
    // The prompt lists specific files.

    // Map known products/varieties to their specific files if needed
    const imageMap = {
        'Apples': 'Red Delicious.png',
        'Red Apples': 'Red Delicious.png',
        'Red Delicious': 'Red Delicious.png',
        'Granny Smith': 'Granny Smith.jpg',
        'Gala': 'Gala.jpg',
        'Golden Delicious': 'Golden Delicious.jpg',

        'Pears': 'French Butter Pear.png',
        'Nashpati': 'Nashpati.png',
        'Nashpati Pear': 'Nashpati Pear.png', // Handle both variations
        'Bosc Pear': 'Bosc Pear.png',
        'Bosc': 'Bosc Pear.png',
        'Concorde Pear': 'Concorde Pear.png',
        'Concorde': 'Concorde Pear.png',
        'French Butter Pear': 'French Butter Pear.png',
        'Red Max': 'Red Max Pear.png',
        'Red Max Pear': 'Red Max Pear.png',

        'Cherries': 'Cherries.png',
        'Dark Sweet Cherries': 'Cherries.png',

        'Kiwis': 'Fuzzy Kiwis.png',
        'Fuzzy Kiwis': 'Fuzzy Kiwis.png',

        'Persimmons': 'Orange Persimmons.png',
        'Orange Persimmons': 'Orange Persimmons.png',

        'Plums': 'Plums.png',
        'Red Plums': 'Plums.png'
    };

    // Case-insensitive lookup
    const mapKey = Object.keys(imageMap).find(key => key.toLowerCase() === filename.toLowerCase());

    if (mapKey) {
        return encodeURI(`${basePath}${imageMap[mapKey]}`);
    }

    // Default fallback if not in map, try to use the name directly
    return encodeURI(`${basePath}${filename}.png`);
};
