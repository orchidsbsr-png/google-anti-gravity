// Single place for brand facts used across the app.
export const BRAND = {
    name: 'Naliban Farms',
    domain: 'https://nalibanfarms.in',
    whatsappNumber: '919805071716',
    supportEmail: 'help@nalibanfarms.in',
    instagram: 'https://www.instagram.com/naliban.farms',
    originShort: 'Naliban Khatasu · Jubbal-Kotkhai · Himachal Pradesh',
    story: 'Naliban is named after Naliban Khatasu, a village in the mountains of Jubbal-Kotkhai, Himachal Pradesh. At 2,300 metres, fruit ripens slowly and tastes richer — grown naturally by our orchards and trusted farming families, and picked only after you order.',
};

export const whatsappLink = (text = 'Hello! I have a question about my Naliban Farms order.') =>
    `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`;
