export const recipes = [
    // Apple Recipes
    {
        id: 'apple-butter-01',
        title: 'Silky No-Peel Apple Butter',
        fruitType: 'Apple',
        chef: 'Kingcooks',
        description: 'An irresistibly cozy, deep-brown apple spread. This hack skips the peeling process entirely to save time while adding natural pectin for a perfect texture.',
        image: '/images/recipes/apple_butter.png',
        prepTime: '15 mins',
        cookTime: '60 mins',
        yields: '1 Large Jar',
        calories: '45 kcal/tbsp',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/DCec1mc5Bbc',
        secret: 'Leaving the skins on adds natural pectin, which makes the butter set thicker and faster. Just make sure to blend it while hot!',
        ingredients: {
            "Grocery List": [
                "8-10 Medium Apples (Gala or Honeycrisp)",
                "1 cup Dark Brown Sugar",
                "2 Ceylon Cinnamon Sticks",
                "1/4 tsp Fresh Nutmeg",
                "1 pinch Salt",
                "1 tsp Vanilla Extract",
                "1 squeeze Lemon Juice",
                "Water (splash for boiling)"
            ]
        },
        instructions: [
            { text: "Wash apples thoroughly (do not peel). Core and dice into cubes." },
            { text: "Place apples in a pot with brown sugar, salt, nutmeg, cinnamon sticks, and a splash of water." },
            { text: "Cover and boil until apples are super tender." },
            { text: "REMOVE cinnamon sticks." },
            { text: "Blend with an immersion blender until completely smooth." },
            { text: "Stir in vanilla and lemon juice." },
            { text: "Simmer uncovered on low heat until thick and dark brown." }
        ]
    },
    {
        id: 'apple-crisp-02',
        title: "'Better Than The Fair' Apple Crisp",
        fruitType: 'Apple',
        chef: 'Viral Fair Food Guy',
        description: "Don't pay '10 Beans' at the fair! This rustic crisp uses cold butter and salted oats to create a crunchy, cookie-like topping that beats the expensive version every time.",
        image: '/images/recipes/apple_crisp.png',
        prepTime: '15 mins',
        cookTime: '45 mins',
        yields: '6-8 Servings',
        calories: '340 kcal',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/E-CwKfcSx7Y',
        secret: "Most people melt the butter. DON'T. Using cold, cubed butter and rubbing it in by hand creates little cookie clusters that stay crunchy instead of getting soggy.",
        ingredients: {
            "Grocery List": [
                "5-6 Red Apples (peeled & cubed)",
                "1/2 cup White Sugar (for filling)",
                "1/2 lemon (juiced)",
                "1 cup Old-Fashioned Oats",
                "3/4 cup Flour",
                "3/4 cup Brown Sugar (for topping)",
                "1/2 cup Cold Salted Butter (cubed)",
                "2 tsp Cinnamon (divided)",
                "1 generous pinch Salt"
            ]
        },
        instructions: [
            { text: "Peel and cube apples. Toss in a baking pan with white sugar, lemon juice, and 1 tsp cinnamon." },
            { text: "In a bowl, mix oats, flour, brown sugar, remaining cinnamon, and salt." },
            { text: "Add COLD cubed butter. Massage with hands until crumbly (like wet sand)." },
            { text: "Pour topping over apples." },
            { text: "Bake at 350°F (175°C) for 45 minutes until golden." },
            { text: "Let cool for 15 mins to crisp up before serving with whipped cream." }
        ]
    },
    // Pear Recipes
    {
        id: 'pear-cobbler-03',
        title: 'Cozy Spiced Pear Cobbler',
        fruitType: 'Pear',
        chef: 'The Seasonal Baker',
        description: 'Pear cobbler is to fall what peach cobbler is to summer. Warm, spiced, and buttery, this dessert fills your kitchen with the ultimate autumn aroma.',
        image: '/images/recipes/pear_cobbler.png',
        prepTime: '20 mins',
        cookTime: '45 mins',
        yields: '6-8 Servings',
        calories: '380 kcal',
        difficulty: 'Medium',
        videoUrl: 'https://youtu.be/BWA7v3ltqbg',
        secret: 'Unlike a "crisp" which uses oats, this uses a biscuit-style topping. By rubbing cold butter into flour and adding a splash of cream, you get a soft, cake-like crust that soaks up the pear juices.',
        ingredients: {
            "Grocery List": [
                "6 Ripe Pears (Bartlett or Anjou)",
                "1/2 cup Brown Sugar (packed)",
                "1 tsp Cinnamon",
                "1/4 tsp Allspice",
                "1/4 tsp Nutmeg",
                "1 tsp Vanilla Extract",
                "1 1/2 cups All-Purpose Flour",
                "1/2 cup Sugar (for topping)",
                "1/2 cup Cold Butter (cubed)",
                "1/3 cup Heavy Cream or Milk",
                "Vanilla Ice Cream (Essential!)"
            ]
        },
        instructions: [
            { text: "Peel the pears and chop them into bite-sized cubes." },
            { text: "In a large bowl, toss pears with brown sugar, cinnamon, allspice, nutmeg, and vanilla extract." },
            { text: "In a separate bowl, mix flour and white sugar. Rub in the COLD cubed butter with your fingers until crumbly." },
            { text: "Stir the cream/milk into the flour mixture just until a dough forms." },
            { text: "Pour the spiced pears into a baking dish or skillet." },
            { text: "Crumble chunks of the biscuit dough over the top of the pears." },
            { text: "Bake at 375°F (190°C) for 40-45 minutes until golden brown." },
            { text: "Serve warm with vanilla bean ice cream." }
        ]
    }

    , // Kiwi Recipes
    {
        id: 'kiwi-salad-05',
        title: 'Kiwi & Pomegranate Salad',
        fruitType: 'Kiwi',
        chef: 'Sanjeev Kapoor',
        description: 'A refreshing, colorful salad by Master Chef Sanjeev Kapoor. Sweet kiwi, crunchy pomegranate, and soft paneer are tossed in a unique tangy orange-mustard dressing.',
        image: '/images/recipes/kiwi_salad.png',
        prepTime: '10 mins',
        cookTime: '0 mins',
        yields: '2 Servings',
        calories: '150 kcal',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/XTDfi0-8IbU',
        secret: 'Sanjeev Kapoor uses Orange Squash (concentrated juice) in the dressing. This provides a deep, citrusy sweetness that balances the sharp mustard seeds and tangy lemon perfectly.',
        ingredients: {
            "Grocery List": [
                "2-3 Kiwis (peeled and chopped)",
                "1 cup Pomegranate Seeds (Anar)",
                "1 cup Mixed Lettuce (Romaine, Iceberg, Lolo Rosso)",
                "1/2 cup Fresh Cottage Cheese (Paneer, crumbled)",
                "2-3 Garlic Cloves",
                "1 tsp Mustard Seeds",
                "1 handful Fresh Mint Leaves",
                "2 tbsp Orange Squash (The secret ingredient!)",
                "1 Lemon (juiced)",
                "2 tbsp Extra Virgin Olive Oil",
                "Salt and Black Pepper to taste"
            ]
        },
        instructions: [
            { text: "Peel the kiwis and cut them into chunks. Tear the lettuce leaves into bite-sized pieces." },
            { text: "**Make the Dressing:** In a blender, combine garlic cloves, mustard seeds, fresh mint, orange squash, lemon juice, olive oil, salt, and pepper. Blend until smooth and emulsified." },
            { text: "In a large bowl, add the lettuce leaves, crumbled paneer (cottage cheese), kiwi chunks, and pomegranate seeds." },
            { text: "Pour the dressing generously over the salad." },
            { text: "Toss well to coat every leaf and serve immediately." }
        ]
    }

    ,
    {
        id: 'kiwi-juice-06',
        title: 'Refreshing Fresh Kiwi Juice',
        fruitType: 'Kiwi',
        chef: 'Spice Chef',
        description: 'A revitalizing 2-minute cooler. This ASMR-style recipe uses the natural tartness of kiwi balanced with sugar and a pinch of salt for the ultimate hydration drink.',
        image: '/images/recipes/kiwi_juice.png',
        prepTime: '5 mins',
        cookTime: '0 mins',
        yields: '1 Tall Glass',
        calories: '110 kcal',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/dOZ3yAnk94o',
        secret: "The pinch of salt is the pro move here. It doesn't make the drink salty; it suppresses the bitterness of the seeds and makes the kiwi flavor taste more intense.",
        ingredients: {
            "Grocery List": [
                "3 Ripe Kiwis (peeled)",
                "2-3 tbsp Sugar (adjust to taste)",
                "1 pinch Salt (enhances flavor)",
                "1 cup Water (chilled)",
                "2-3 Ice Cubes"
            ]
        },
        instructions: [
            { text: "Cut the ends off the kiwis, peel the skin, and chop them into chunks." },
            { text: "Add the kiwi chunks to a blender jar." },
            { text: "Add the sugar and a small pinch of salt." },
            { text: "Pour in the chilled water and add ice cubes." },
            { text: "Blend on high speed until smooth and frothy." },
            { text: "Pour into a tall glass and serve immediately." }
        ]
    }

    , // Cherry Recipes
    {
        id: 'cherry-jam-07',
        title: 'Small Batch Cherry Jam (No Pectin)',
        fruitType: 'Cherry',
        chef: 'The Floral Apron',
        description: 'A simple, 3-ingredient jam that uses the natural pectin in the fruit. The secret isn\'t an added thickener—it\'s hitting the exact right temperature.',
        image: '/images/recipes/cherry_jam.png',
        prepTime: '20 mins',
        cookTime: '15 mins',
        yields: '1 Jar (10oz)',
        calories: '50 kcal/tbsp',
        difficulty: 'Medium',
        videoUrl: 'https://youtu.be/88UJdPj-ROQ',
        secret: "Temperature is everything. You don't need store-bought pectin. If you cook the sugar and fruit to exactly 220°F (104°C), it will gel perfectly every time. If you take it off early, you'll have syrup!",
        ingredients: {
            "Grocery List": [
                "2 cups Fresh Cherries (pitted)",
                "1 cup Granulated Sugar",
                "1 tbsp Lemon Juice"
            ]
        },
        instructions: [
            { text: "Pit the cherries (wear an apron, not a white shirt!)." },
            { text: "Place cherries, sugar, and lemon juice into a pot that is larger than you think you need (to prevent boil-overs)." },
            { text: "Cook over medium heat, stirring occasionally until the sugar dissolves and the mixture turns bright red." },
            { text: "Bring to a 'rolling boil' (bubbles that don't disappear when you stir)." },
            { text: "Cook for about 10 minutes. **Critical Step:** Use a thermometer to ensure the jam reaches exactly 220°F (104°C)." },
            { text: "Remove from heat. Use an immersion blender for a few seconds if you want a smoother, spreadable texture." },
            { text: "Pour into a jar, seal, and refrigerate overnight to set." }
        ]
    }

    , // Persimmon Recipes
    {
        id: 'persimmon-salad-04',
        title: 'Spicy & Sweet Persimmon Salad',
        fruitType: 'Persimmon',
        chef: "Natasha's Kitchen",
        description: "The 'talk of the party' salad. Sweet Fuyu persimmons meet spicy jalapeño and tart pomegranate seeds for a crunchy, vibrant winter side dish that pops with flavor.",
        image: '/images/recipes/persimmon_salad.png',
        prepTime: '15 mins',
        cookTime: '0 mins',
        yields: '6 Servings',
        calories: '180 kcal',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/4V2QD_d_Q-4',
        secret: "Using Fuyu Persimmons (the tomato-shaped ones) is critical because they are crisp like apples. The Jalapeño adds a necessary kick that cuts through the sweetness—don't skip it!",
        ingredients: {
            "Grocery List": [
                "3-4 Fuyu Persimmons (sliced)",
                "1/2 Red Onion (thinly sliced)",
                "1 Jalapeño (seeded and minced)",
                "1/2 cup Pomegranate Seeds",
                "1/2 cup Fresh Cilantro (chopped)",
                "2 tbsp Extra Virgin Olive Oil",
                "1 Lime (juiced)",
                "Salt and Black Pepper to taste"
            ]
        },
        instructions: [
            { text: "Wash the persimmons (no need to peel) and cut them into bite-sized wedges." },
            { text: "Remove seeds from the jalapeño and mince finely." },
            { text: "In a large salad bowl, combine the persimmons, red onion slices, minced jalapeño, and chopped cilantro." },
            { text: "Sprinkle the pomegranate seeds over the top." },
            { text: "Drizzle with fresh lime juice and extra virgin olive oil." },
            { text: "Season generously with freshly cracked salt and pepper." },
            { text: "Toss gently to combine. Serve immediately or let sit for 15 mins to let flavors meld." }
        ]
    },
    {
        id: 'cherry-clafoutis-hero',
        title: 'Warm Cherry Clafoutis',
        fruitType: 'Cherry',
        chef: 'Alpine Kitchen',
        description: 'A rustic French dessert where fresh mountain cherries are baked in a thick, flan-like batter. Served warm, dusted with powdered-sugar "snow".',
        image: '/images/recipes/cherry_clafoutis.png', // Placeholder
        prepTime: '15 mins',
        cookTime: '35 mins',
        yields: '8 Servings',
        calories: '210 kcal',
        difficulty: 'Medium',
        videoUrl: 'https://youtu.be/example1', // Placeholder
        secret: 'Do not pit the cherries too early or they lose their juice. Authentication tradition leave pits in, but we recommend pitting for ease of eating!',
        ingredients: {
            "Grocery List": [
                "1 kg Mountain Cherries (pitted)",
                "1/2 cup Sugar",
                "3 Eggs",
                "1 1/4 cups Milk",
                "1 tsp Vanilla Extract",
                "1/2 cup All-Purpose Flour"
            ]
        },
        instructions: [
            { text: "Preheat oven to 350°F (175°C). Butter a baking dish." },
            { text: "Whisk eggs and sugar until pale. Add flour, milk, and vanilla." },
            { text: "Arrange cherries in the dish. Pour batter over them." },
            { text: "Bake for 35-40 minutes until golden and puffed." }
        ]
    },
    {
        id: 'plum-torte-08',
        title: 'Legendary Plum Torte',
        fruitType: 'Plum',
        chef: 'NYT Cooking',
        description: 'The most requested recipe in New York Times history. Halved plums bake into the buttery cake, turning into jammy pockets of sweet-tart perfection.',
        image: '/images/recipes/plum_torte.png',
        prepTime: '20 mins',
        cookTime: '45 mins',
        yields: '8 Servings',
        calories: '290 kcal',
        difficulty: 'Easy',
        videoUrl: 'https://youtu.be/example2',
        secret: 'The batter is very stiff—don’t worry! It rises up around the plums as they sink, creating the signature dimpled look.',
        ingredients: {
            "Grocery List": [
                "1 cup Sugar",
                "1/2 cup Unsalted Butter (softened)",
                "1 cup Flour",
                "1 tsp Baking Powder",
                "2 Eggs",
                "12 Purple Plums (halved, pitted)"
            ]
        },
        instructions: [
            { text: "Cream butter and sugar. Add eggs, then dry ingredients." },
            { text: "Spread stiff batter into springform pan." },
            { text: "Place plum halves skin-side up on top." },
            { text: "Bake at 350°F (175°C) for 45-50 mins." }
        ]
    }
];
