// Harvest windows (months are 1-12). Shared by the ticker, shop strip and
// off-season stamps. Adjust freely — everything updates together.
export const HARVEST_SEASONS = [
    { fruit: 'Cherries', start: 6, end: 7 },
    { fruit: 'Plums', start: 6, end: 8 },
    { fruit: 'Pears', start: 8, end: 10 },
    { fruit: 'Apples', start: 9, end: 11 },
    { fruit: 'Fuzzy Kiwis', start: 10, end: 12 },
    { fruit: 'Persimmons', start: 10, end: 12 },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const seasonLabel = (s) => `${MONTHS_SHORT[s.start - 1]} – ${MONTHS_SHORT[s.end - 1]}`;

const findSeason = (name) => HARVEST_SEASONS.find(s =>
    name.toLowerCase().includes(s.fruit.toLowerCase().replace('fuzzy ', '')) ||
    s.fruit.toLowerCase().includes(name.toLowerCase())
);

export const isInSeason = (name, month = new Date().getMonth() + 1) => {
    const s = findSeason(name);
    if (!s) return true;
    return month >= s.start && month <= s.end;
};

export const nowPickingByMonth = (month = new Date().getMonth() + 1) =>
    HARVEST_SEASONS.filter(s => month >= s.start && month <= s.end).map(s => s.fruit);

export const returnsLabel = (name) => {
    const s = findSeason(name);
    return s ? `Returns in ${MONTHS[s.start - 1]}` : 'Out of season';
};
