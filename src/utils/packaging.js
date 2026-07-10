// Standardized packaging lineup. The pack weight (kg) picks the box.
// Shared by the checkout shipping quote (Payment.jsx) and the
// Delhivery manifest (api/_lib/delhivery.js) — keep it the single source of truth.

export const BOXES = [
    { label: 'Stone Fruit 250 g', maxKg: 0.25, l: 15, w: 10, h: 5 },
    { label: 'Stone Fruit 500 g', maxKg: 0.5, l: 18, w: 13, h: 6 },
    { label: 'Stone Fruit 1 kg', maxKg: 1, l: 24, w: 16, h: 8 },
    { label: 'Apple 5 kg', maxKg: 5, l: 50, w: 30, h: 10 },
    { label: 'Apple 10 kg', maxKg: 10, l: 50, w: 30, h: 18 },
];

// Delhivery volumetric weight: L x B x H (cm) / 5000 = kg
const VOLUMETRIC_DIVISOR = 5000;

// Packs without a weight are treated as the biggest box.
const DEFAULT_PACK_KG = 10;

export function getBoxForPack(quantityKg) {
    const kg = Number(quantityKg) || DEFAULT_PACK_KG;
    return BOXES.find(b => kg <= b.maxKg) || BOXES[BOXES.length - 1];
}

// Delhivery bills on whichever is higher: dead weight or volumetric weight.
export function chargeableKgForPack(quantityKg) {
    const kg = Number(quantityKg) || DEFAULT_PACK_KG;
    const box = getBoxForPack(kg);
    const volumetricKg = (box.l * box.w * box.h) / VOLUMETRIC_DIVISOR;
    return Math.max(kg, volumetricKg);
}

// Total chargeable weight for a cart, in grams (the unit Delhivery's cost API expects).
export function cartChargeableWeightGrams(cartItems) {
    const totalKg = (cartItems || []).reduce((acc, item) => {
        const qty = item.quantity || 1;
        return acc + chargeableKgForPack(item.quantityKg) * qty;
    }, 0);
    return Math.ceil(totalKg * 1000);
}

// The biggest box in the cart — used as the manifest's package dimensions
// when several boxes ship under one waybill.
export function largestBoxInCart(cartItems) {
    let largest = null;
    for (const item of cartItems || []) {
        const box = getBoxForPack(item.quantityKg);
        if (!largest || box.l * box.w * box.h > largest.l * largest.w * largest.h) {
            largest = box;
        }
    }
    return largest || BOXES[BOXES.length - 1];
}
