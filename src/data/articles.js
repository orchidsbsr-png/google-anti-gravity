// Original editorial content for the Information Centre.
// Body blocks: { h: 'heading' } | { p: 'paragraph' } | { list: [...] }

export const ARTICLE_CATEGORIES = [
    'All',
    'Farming Practices',
    'Behind the Scenes',
    'Fruit Knowledge',
    'Harvest Stories'
];

export const ARTICLES = [
    {
        slug: 'natural-farming-at-naliban',
        category: 'Farming Practices',
        icon: '🌱',
        title: 'How We Farm Without Fighting the Mountain',
        excerpt: 'Rainwater harvesting, cow-dung manure, compost from kitchen waste, and bio-slurry for the trees — the everyday systems behind our natural farming.',
        readMinutes: 4,
        body: [
            { p: 'Natural farming, for us, is not a certificate on a wall. It is a set of daily habits that keep the soil alive, the water clean, and the fruit honest. Most of them are older than any of us — we have simply kept them running and added a few modern touches where they help.' },
            { h: 'Water: caught, used, and used again' },
            { p: 'Mountain farming lives and dies by water. We harvest rainwater through collection tanks positioned across the orchard slopes, so the monsoon fills our reserves instead of washing our topsoil down the valley. That stored water carries the orchard through the dry weeks of the fruiting season.' },
            { p: 'Water is also reused wherever it can be. Water from washing and cleaning work on the farm does not simply drain away — it is directed back into the orchard rows, so a single tank serves the farm twice.' },
            { h: 'Feeding the soil, not the tree' },
            { p: 'Our manure comes from our cows. Composted cow dung is worked into the tree basins before the growing season, feeding the soil food web — worms, fungi, microbes — which in turn feeds the trees slowly and steadily, the way they evolved to eat.' },
            { p: 'Kitchen and food waste is not thrown away either. It is composted down and returned to the orchard, closing the loop between what the farm grows and what the farm discards.' },
            { h: 'Bio-slurry for the trees' },
            { p: 'Alongside compost, we prepare bio-slurry — fermented preparations from cow dung and farm matter — which we apply around the trees as a natural tonic. It strengthens the soil biology and helps the trees resist pests and stress without reaching for synthetic sprays.' },
            { h: 'Why this matters for your fruit' },
            { p: 'Fruit grown this way ripens with more character. Slower feeding, cooler air, and living soil produce apples and stone fruit with denser flavour — the difference you taste is the difference in how it was grown.' }
        ]
    },
    {
        slug: 'how-we-pack-every-order',
        category: 'Behind the Scenes',
        icon: '📦',
        title: 'From the Branch to Your Box: How We Pack Every Order',
        excerpt: 'Fruit is plucked only when ripe, crated in the orchard, then graded, washed, and cushioned by hand before it travels to you.',
        readMinutes: 3,
        body: [
            { p: 'A box from Naliban is packed the way you would pack fruit for your own family. Here is the journey each order actually takes.' },
            { h: '1 · Picking, only at ripeness' },
            { p: 'When the fruit on a block of trees is ripe, we and our local helpers pick it by hand. Ripeness sets the schedule — not the market, not a warehouse. This is why we say your fruit is harvested after your order: we pick what is ready, when it is ready, for the orders in hand.' },
            { h: '2 · Crated in the orchard' },
            { p: 'Picked fruit goes straight into crates right there in the orchard rows, handled once and handled gently. From there the crates travel to our packing centre.' },
            { h: '3 · Sorted, graded, and washed' },
            { p: 'At the packing centre every fruit is sorted and separated, graded for size and quality, and cleaned with clean water. Fruit that does not meet the bar for shipping does not go in your box.' },
            { h: '4 · Packed by hand, cushioned with care' },
            { p: 'Our packing team sits down and packs each fruit by hand — with love, care, and cushion packaging around every piece so nothing bruises on the road. Then the box is sealed, labelled, and handed to the courier for its journey across India.' },
            { p: 'Four steps, no cold storage, no middlemen — just the shortest honest path from a Himalayan branch to your doorstep.' }
        ]
    },
    {
        slug: 'why-himalayan-apples-taste-better',
        category: 'Fruit Knowledge',
        icon: '🍎',
        title: 'Why Apples From 2,300 Metres Taste Better',
        excerpt: 'Cold nights, slow ripening, and mountain light — the science of why altitude makes sweeter, denser, more aromatic fruit.',
        readMinutes: 4,
        body: [
            { p: 'Ask anyone from Himachal why pahadi apples taste different and they will tell you: it is the mountain. They are right — and there is real science behind it.' },
            { h: 'Cold nights build sugar' },
            { p: 'At 2,300 metres, days are bright but nights are cold, even in summer. That wide day-night temperature swing slows the fruit’s night-time respiration — the tree burns less of the sugar it made during the day. Over a season, those saved sugars accumulate, which is why a mountain apple bites sweeter than a plains-grown one.' },
            { h: 'Slow ripening builds flavour' },
            { p: 'Cool average temperatures stretch the ripening window by weeks. The longer a fruit hangs, the more time it has to develop aromatic compounds — the volatile esters that make an apple smell like an apple. Fast-ripened fruit is sweet at best; slow-ripened fruit is complex.' },
            { h: 'Mountain light builds colour' },
            { p: 'Thinner air at altitude lets through more ultraviolet light, and apples respond by producing more anthocyanin — the pigment behind that deep Himachali red. The blush on a mountain apple is not cosmetic; it is a record of the light it grew in.' },
            { h: 'And then: freshness' },
            { p: 'Most fruit in India travels through mandis and cold storage before it reaches a shelf, ageing all the way. Ours is picked at ripeness and shipped straight from the orchard — so the altitude advantage actually reaches your kitchen instead of fading in a warehouse.' }
        ]
    },
    {
        slug: 'a-morning-in-the-harvest',
        category: 'Harvest Stories',
        icon: '🌄',
        title: 'A Morning in the Harvest',
        excerpt: 'Mist on the terraces, ladders in the trees, and crates filling with fruit — one ordinary, extraordinary morning at Naliban Khatasu.',
        readMinutes: 3,
        body: [
            { p: 'The orchard wakes before we do. By the time we walk up the terraces at first light, the mist is already lifting off the valley below Naliban Khatasu, and the trees stand dripping and heavy.' },
            { p: 'Harvest mornings have a rhythm. Ladders go up into the oldest trees first — the ones that have seen more seasons than most of us. The pickers work in pairs, one in the branches, one below with the crate, and the sound of the morning is fruit landing softly in cupped hands, over and over.' },
            { p: 'There is a discipline to it that outsiders rarely see. A fruit picked with its stalk intact travels well; a fruit yanked free bruises within a day. So nobody hurries, even when the orders are stacked up. The mountain has taught everyone here the same lesson: speed costs more than it saves.' },
            { p: 'By mid-morning the crates line the orchard path like a small harvest parade — reds, golds, and the dusty purple of plums. They will be at the packing centre by afternoon, graded and washed by evening, and on the road inside a day or two, carrying a piece of this morning to a doorstep somewhere in India.' },
            { p: 'People sometimes ask what makes farm-direct fruit different. It is mornings like this one — short, cold, careful — that are the honest answer.' }
        ]
    }
];

export const FAQS = [
    {
        q: 'When is my fruit actually picked?',
        a: 'After you order. We harvest in cycles matched to incoming orders, so fruit is picked at ripeness and packed fresh — it never sits in cold storage.'
    },
    {
        q: 'How long does delivery take?',
        a: 'Typically 3–5 days from harvest to your doorstep, anywhere in India. You get tracking as soon as your box ships, under My Orders.'
    },
    {
        q: 'What payment methods do you accept?',
        a: 'UPI, credit and debit cards, and net banking — all processed securely through Razorpay.'
    },
    {
        q: 'What if my fruit arrives damaged?',
        a: 'Write to help@nalibanfarms.in or WhatsApp us with a photo within 24 hours of delivery and we will make it right — replacement or refund, per our refund policy.'
    },
    {
        q: 'Do you ship everywhere in India?',
        a: 'We deliver pan-India through our courier partner. Enter your pincode at checkout and it will confirm serviceability for your address.'
    },
    {
        q: 'Is your fruit organic?',
        a: 'We grow naturally — healthy soil, cow-dung compost, bio-slurry, and no unnecessary chemical dependence — using traditional Himalayan practices on our farm and our partner family farms.'
    },
    {
        q: 'Can I order in bulk or for my business?',
        a: 'Yes — wholesale and gifting enquiries are welcome. Reach us on WhatsApp or at help@nalibanfarms.in and we will plan around the harvest calendar.'
    },
    {
        q: 'Can I visit the orchard?',
        a: 'We love visitors in season. Write to us first so we can time it with the harvest — the orchard is at Naliban Khatasu, Jubbal-Kotkhai, Himachal Pradesh.'
    }
];
