// Single place for brand facts used across the app.
// TODO: replace whatsappNumber with the real number (country code, no + or spaces).
export const BRAND = {
    name: 'Naliban Farms',
    domain: 'https://nalibanfarms.in',
    whatsappNumber: '4917661996833',
    supportEmail: 'hello@nalibanfarms.in',
    originShort: 'Jubbal-Kotkhai Valley · Himachal Pradesh',
    story: 'From the high valley of Jubbal-Kotkhai, above Hatkoti, our orchards have passed from father to son for four generations. The same soil. The same patience. The same promise.',
};

export const whatsappLink = (text = 'Hello! I have a question about my Naliban Farms order.') =>
    `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`;
