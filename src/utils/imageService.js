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
        'Apples': 'Red Delicious.png', // Default for Apples product
        'Red Apples': 'Red Delicious.png', // Fallback or specific
        'Red Delicious': 'Red Delicious.png',
        'Granny Smith': 'Granny Smith.jpg',
        'Gala': 'Gala.jpg',
        'Golden Delicious': 'Golden Delicious.jpg',
        'Orange Persimmons': 'Orange Persimmons.png',
        'Fuzzy Kiwis': 'Fuzzy Kiwis.png',
        'Plums': 'Plums.png',
        'Pears': 'French Butter Pear.png', // Default for Pears category
        'Nashpati Pear': 'Nashpati Pear.png',
        'Bosc Pear': 'Bosc Pear.png',
        'Concorde Pear': 'Concorde Pear.png',
        'French Butter Pear': 'French Butter Pear.png',
        'Red Max': 'Red Max Pear.png',
        'Cherries': 'Cherries.png'
    };

    if (imageMap[filename]) {
        return `${basePath}${imageMap[filename]}`;
    }

    // Default fallback if not in map, try to use the name directly
    return `${basePath}${filename}.png`;
};
