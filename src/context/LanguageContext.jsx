import React, { createContext, useContext, useState, useEffect } from 'react';

// Lightweight EN/HI dictionary for the primary surfaces.
// t(key) falls back to English, then to the key itself — so untranslated
// corners of the app safely stay English.
const dict = {
    en: {
        'nav.home': 'Home',
        'nav.kitchen': 'Kitchen',
        'nav.shop': 'Shop',
        'nav.cart': 'Cart',
        'nav.profile': 'Profile',
        'nav.close': 'Close',
        'nav.light': 'Light',
        'nav.dark': 'Dark',

        'hero.eyebrow': 'Jubbal-Kotkhai Valley · Himachal · 2,300m Above Sea Level',
        'hero.title1': 'From mountain air',
        'hero.title2': 'to your table.',
        'hero.sub': 'Organic fruit, hand-picked at dawn in our family orchards and delivered to doorsteps across India.',
        'hero.shop': 'Shop the Harvest',
        'hero.adopt': 'Adopt a Tree',
        'hero.scroll': 'Scroll',

        'origin.eyebrow': 'Our Origin',
        'origin.title1': 'Rooted in',
        'origin.title2': 'the soil.',
        'origin.body': 'In the high valley of Jubbal-Kotkhai, above Hatkoti, our orchards have passed from father to son, and to his son after him — four generations of the same soil, the same patience, the same promise. Taste what time grows.',
        'origin.stat1': 'Years of orchards',
        'origin.stat2': 'Altitude grown',
        'origin.stat3': 'Chemicals, ever',

        'club.eyebrow': 'The Harvest Club',
        'club.title1': 'A box a month,',
        'club.title2': 'whatever the mountain gives.',
        'club.body': 'Members receive whichever fruit is at its absolute peak that month, picked for them first — before anything reaches the shop.',
        'club.cta': 'Request an Invitation',
        'club.note': 'Founding memberships · limited by the orchard’s yield',

        'adopt.eyebrow': 'A Living Gift',
        'adopt.title1': 'Adopt a tree,',
        'adopt.title2': 'harvest its story.',
        'adopt.body': 'Put your name on an organic apple tree in our Himachal orchard. We tend it through the seasons; you receive its entire harvest, photographs of its bloom, and a bond with the mountains.',
        'adopt.cta': 'Adopt Your Tree',

        'footer.title1': 'Taste the',
        'footer.title2': 'purest',
        'footer.title3': 'of Himachal.',
        'footer.sub': 'Seasonal, small-batch, and shipped straight from our orchard.',
        'footer.shopNow': 'Shop Now',
        'footer.explore': 'Explore',
        'footer.account': 'Account',
        'footer.legal': 'Legal',

        'shop.eyebrow': 'The Collection',
        'shop.title1': 'This Season’s',
        'shop.title2': 'Harvest',
        'shop.search': 'Search the orchard',
        'shop.calendar': 'Harvest Calendar',
        'shop.inSeason': 'in season',

        'cart.title1': 'Your',
        'cart.title2': 'Basket',
        'cart.clear': 'Clear Cart',
        'cart.checkout': 'Proceed to Checkout',

        'checkout.eyebrow': 'Step',
        'checkout.title': 'Checkout',
        'checkout.stepAddress': 'Address',
        'checkout.stepPayment': 'Payment',
        'checkout.stepReview': 'Review',
        'checkout.addressTitle': 'Where should we deliver?',
        'checkout.addNew': '+ Add New',
        'checkout.noAddress': 'No addresses found. Please add one.',
        'checkout.payTitle': 'How would you like to pay?',
        'checkout.online': 'Online Payment (UPI, Cards, NetBanking)',
        'checkout.cod': 'Cash on Delivery',
        'checkout.reviewTitle': 'Your Harvest',
        'checkout.subtotal': 'Subtotal',
        'checkout.deliverTo': 'Deliver to',
        'checkout.payingBy': 'Paying by',
        'checkout.change': 'Change',
        'checkout.gift': 'This is a gift',
        'checkout.giftSub': 'We’ll include a handwritten note from the orchard',
        'checkout.shipping': 'Shipping',
        'checkout.total': 'Total to Pay',
        'checkout.continue': 'Continue to Payment',
        'checkout.review': 'Review Order',
        'checkout.pay': 'Pay',
        'checkout.placeOrder': 'Place Order',
        'checkout.processing': 'Processing...',
        'checkout.checking': 'Checking location...',
        'checkout.promise': 'Hand-picked after you order · delivered fresh in 3–5 days',

        'orders.title': 'My Orders',
        'orders.tabCompleted': 'Completed',
        'orders.tabCancelled': 'Cancelled',
        'orders.tabActive': 'Requested',
        'orders.loginPrompt': 'Please login to view your orders.',
        'orders.login': 'Login',
        'orders.none': 'Nothing here yet.',
        'orders.startShopping': 'Start Shopping',
        'orders.viewSummary': 'View Summary',
        'orders.track': 'Track Shipment',
        'orders.hideTrack': 'Hide Tracking',
        'orders.trackLoading': 'Fetching the latest from the courier…',
        'orders.trackError': 'Tracking isn’t available yet — check back soon.',
        'orders.stagePlaced': 'Placed',
        'orders.stagePacked': 'Packed',
        'orders.stageOut': 'On its way',
        'orders.stageDelivered': 'Delivered',
        'orders.notifyPrompt': 'Get a notification when your box ships and arrives.',
        'orders.notifyBtn': 'Notify me',
    },
    hi: {
        'nav.home': 'होम',
        'nav.kitchen': 'रसोई',
        'nav.shop': 'दुकान',
        'nav.cart': 'टोकरी',
        'nav.profile': 'प्रोफ़ाइल',
        'nav.close': 'बंद करें',
        'nav.light': 'उजला',
        'nav.dark': 'गहरा',

        'hero.eyebrow': 'जुब्बल-कोटखाई घाटी · हिमाचल · समुद्र तल से 2,300 मीटर',
        'hero.title1': 'पहाड़ों की हवा से',
        'hero.title2': 'आपकी थाली तक।',
        'hero.sub': 'जैविक फल — हमारे पारिवारिक बगीचों में भोर में हाथ से तोड़े गए, और पूरे भारत में आपके द्वार तक पहुँचाए गए।',
        'hero.shop': 'फ़सल ख़रीदें',
        'hero.adopt': 'एक पेड़ गोद लें',
        'hero.scroll': 'नीचे देखें',

        'origin.eyebrow': 'हमारी मिट्टी',
        'origin.title1': 'मिट्टी में',
        'origin.title2': 'रची-बसी।',
        'origin.body': 'हाटकोटी के ऊपर, जुब्बल-कोटखाई की ऊँची घाटी में, हमारे बगीचे पिता से पुत्र तक — चार पीढ़ियों से — उसी मिट्टी, उसी धैर्य और उसी वादे के साथ चले आ रहे हैं। समय जो उगाता है, उसका स्वाद लीजिए।',
        'origin.stat1': 'बगीचों के वर्ष',
        'origin.stat2': 'ऊँचाई पर उगाया',
        'origin.stat3': 'रसायन — कभी नहीं',

        'club.eyebrow': 'हार्वेस्ट क्लब',
        'club.title1': 'हर महीने एक डिब्बा,',
        'club.title2': 'जो भी पहाड़ दे।',
        'club.body': 'सदस्यों को हर महीने वही फल मिलता है जो अपने चरम पर होता है — सबसे पहले उनके लिए तोड़ा गया, दुकान में आने से भी पहले।',
        'club.cta': 'निमंत्रण माँगें',
        'club.note': 'संस्थापक सदस्यताएँ · बगीचे की उपज तक सीमित',

        'adopt.eyebrow': 'एक जीवित उपहार',
        'adopt.title1': 'एक पेड़ गोद लें,',
        'adopt.title2': 'उसकी कहानी काटें।',
        'adopt.body': 'हमारे हिमाचली बगीचे के एक जैविक सेब के पेड़ पर अपना नाम लिखवाइए। हम उसे हर मौसम में सँभालते हैं; आपको मिलती है उसकी पूरी फ़सल, उसके फूलों की तस्वीरें, और पहाड़ों से एक रिश्ता।',
        'adopt.cta': 'अपना पेड़ गोद लें',

        'footer.title1': 'चखिए हिमाचल का',
        'footer.title2': 'सबसे शुद्ध',
        'footer.title3': 'स्वाद।',
        'footer.sub': 'मौसमी, थोड़ी-थोड़ी मात्रा में, सीधे हमारे बगीचे से।',
        'footer.shopNow': 'अभी ख़रीदें',
        'footer.explore': 'खोजें',
        'footer.account': 'खाता',
        'footer.legal': 'क़ानूनी',

        'shop.eyebrow': 'संग्रह',
        'shop.title1': 'इस मौसम की',
        'shop.title2': 'फ़सल',
        'shop.search': 'बगीचे में खोजें',
        'shop.calendar': 'फ़सल कैलेंडर',
        'shop.inSeason': 'मौसम में',

        'cart.title1': 'आपकी',
        'cart.title2': 'टोकरी',
        'cart.clear': 'टोकरी खाली करें',
        'cart.checkout': 'भुगतान करें',

        'checkout.eyebrow': 'चरण',
        'checkout.title': 'चेकआउट',
        'checkout.stepAddress': 'पता',
        'checkout.stepPayment': 'भुगतान',
        'checkout.stepReview': 'समीक्षा',
        'checkout.addressTitle': 'डिलीवरी कहाँ करें?',
        'checkout.addNew': '+ नया पता',
        'checkout.noAddress': 'कोई पता नहीं मिला। कृपया एक जोड़ें।',
        'checkout.payTitle': 'आप कैसे भुगतान करना चाहेंगे?',
        'checkout.online': 'ऑनलाइन भुगतान (UPI, कार्ड, नेटबैंकिंग)',
        'checkout.cod': 'डिलीवरी पर नकद',
        'checkout.reviewTitle': 'आपकी फ़सल',
        'checkout.subtotal': 'उप-योग',
        'checkout.deliverTo': 'डिलीवरी पता',
        'checkout.payingBy': 'भुगतान विधि',
        'checkout.change': 'बदलें',
        'checkout.gift': 'यह एक उपहार है',
        'checkout.giftSub': 'हम बगीचे से हाथ से लिखा संदेश साथ भेजेंगे',
        'checkout.shipping': 'शिपिंग',
        'checkout.total': 'कुल राशि',
        'checkout.continue': 'भुगतान की ओर बढ़ें',
        'checkout.review': 'ऑर्डर की समीक्षा करें',
        'checkout.pay': 'भुगतान करें',
        'checkout.placeOrder': 'ऑर्डर करें',
        'checkout.processing': 'प्रक्रिया जारी है...',
        'checkout.checking': 'स्थान की जाँच हो रही है...',
        'checkout.promise': 'ऑर्डर के बाद हाथ से तोड़ा गया · 3–5 दिनों में ताज़ा डिलीवरी',

        'orders.title': 'मेरे ऑर्डर',
        'orders.tabCompleted': 'पूर्ण',
        'orders.tabCancelled': 'रद्द',
        'orders.tabActive': 'चालू',
        'orders.loginPrompt': 'अपने ऑर्डर देखने के लिए कृपया लॉगिन करें।',
        'orders.login': 'लॉगिन',
        'orders.none': 'अभी यहाँ कुछ नहीं है।',
        'orders.startShopping': 'ख़रीदारी शुरू करें',
        'orders.viewSummary': 'विवरण देखें',
        'orders.track': 'शिपमेंट ट्रैक करें',
        'orders.hideTrack': 'ट्रैकिंग छिपाएँ',
        'orders.trackLoading': 'कूरियर से ताज़ा जानकारी ली जा रही है…',
        'orders.trackError': 'ट्रैकिंग अभी उपलब्ध नहीं है — थोड़ी देर बाद देखें।',
        'orders.stagePlaced': 'ऑर्डर हुआ',
        'orders.stagePacked': 'पैक हुआ',
        'orders.stageOut': 'रास्ते में',
        'orders.stageDelivered': 'पहुँच गया',
        'orders.notifyPrompt': 'आपका डिब्बा रवाना और डिलीवर होने पर सूचना पाएँ।',
        'orders.notifyBtn': 'सूचित करें',
    }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => dict[lang]?.[key] ?? dict.en[key] ?? key;
    const toggleLang = () => setLang(l => (l === 'en' ? 'hi' : 'en'));

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
};
