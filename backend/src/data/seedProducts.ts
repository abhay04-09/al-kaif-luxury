import { Product } from '../types';

export const SEED_PRODUCTS: Product[] = [
  // FINE JEWELLERY
  {
    id: 'jewel-01',
    name: 'Sultanate Royal Diamond Crest Necklace',
    subtitle: '18K Yellow Gold & VVS1 Diamonds',
    category: 'jewellery',
    priceINR: 485000,
    priceUSD: 5800,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'Hand-forged by AL-KAIF master goldsmiths in 18-karat solid yellow gold, featuring a breathtaking central brilliant-cut VVS1 diamond surrounded by intricate royal arabesque filigree.',
    featured: true,
    isNewArrival: true,
    inStock: true,
    specifications: {
      material: 'Solid 18K Yellow Gold',
      karat: '18K Gold (750 Purity)',
      gemstones: '3.45 ct VVS1 Diamonds (Color F)',
    },
    artisanStory: 'Inspired by Mughal court splendour, taking over 140 hours of meticulous hand setting by our chief artisan in Jaipur.',
    sku: 'ALK-JWL-001'
  },
  {
    id: 'jewel-02',
    name: 'Crown Imperial Emerald & Gold Bangle',
    subtitle: 'Zambian Emerald & 24K Gold Plated Brass Core',
    category: 'jewellery',
    priceINR: 320000,
    priceUSD: 3850,
    image: 'https://images.unsplash.com/photo-1611591475155-42e922a2e2b0?auto=format&fit=crop&w=1200&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'An iconic hinged bracelet encrusted with hand-selected royal green Zambian emeralds, meticulously set against hand-burnished 22K gold casing.',
    featured: true,
    isNewArrival: false,
    inStock: true,
    specifications: {
      material: '22K Solid Gold',
      karat: '22K Gold',
      gemstones: '4.2 ct Natural Zambian Emeralds',
    },
    artisanStory: 'Each emerald is individually color-matched to ensure uniform deep forest radiance.',
    sku: 'ALK-JWL-002'
  },
  {
    id: 'jewel-03',
    name: 'Celestial Diamond Eternity Solitaire Ring',
    subtitle: '2.5ct Round Brilliant Cut Platinum Ring',
    category: 'jewellery',
    priceINR: 650000,
    priceUSD: 7800,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A timeless expression of eternal devotion. Suspended in a minimalist 6-prong platinum crown, exposing maximum diamond brilliance to incoming light.',
    featured: true,
    isNewArrival: true,
    inStock: true,
    specifications: {
      material: 'Platinum 950',
      karat: 'Pt 950 Pure Platinum',
      gemstones: '2.50 ct Round Brilliant (IF Clarity, D Color)',
    },
    artisanStory: 'Polished with diamond dust paste to achieve a flawless mirror shine mirror finish.',
    sku: 'ALK-JWL-003'
  },
  {
    id: 'jewel-04',
    name: 'Royal Noor Pearl Drop Earrings',
    subtitle: 'South Sea Pearls & Rose Gold Diamonds',
    category: 'jewellery',
    priceINR: 195000,
    priceUSD: 2350,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
    description: 'Lustrous 12mm natural Australian South Sea pearls cascading gracefully from pavé diamond 18K rose gold lotus buds.',
    featured: false,
    isNewArrival: false,
    inStock: true,
    specifications: {
      material: '18K Rose Gold',
      karat: '18K Rose Gold',
      gemstones: 'Natural South Sea Pearl & 0.85ct Diamonds',
    },
    artisanStory: 'Selected from fewer than 1 in 10,000 harvested pearls for supreme nacre radiance.',
    sku: 'ALK-JWL-004'
  },

  // LUXURY PERFUMES
  {
    id: 'perfume-01',
    name: 'Royal Royal Oud Extrait de Parfum',
    subtitle: 'Aged Wild Cambodian Oud & Damask Rose',
    category: 'perfumes',
    priceINR: 42000,
    priceUSD: 510,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'The crowning glory of AL-KAIF fragrance house. Formulated with 35-year aged wild Cambodian Oud distillation blended with hand-picked Taif damask roses and smoky amber resin.',
    featured: true,
    isNewArrival: true,
    inStock: true,
    specifications: {
      volume: '100 ml / 3.4 fl. oz',
      concentration: 'Pure Extrait de Parfum (35% Oil)',
      fragranceNotes: {
        top: 'Smoky Cardamom, Sicilian Bergamot, Saffron Thread',
        heart: 'Taif Rose, Aged Oud Wood, Cedarwood',
        base: 'White Ambergris, Royal Leather, Madagascar Vanilla'
      }
    },
    artisanStory: 'Encased in a hand-cut crystal flacon topped with a 24K gold-plated cap bearing the AL-KAIF emblem.',
    sku: 'ALK-PRF-001'
  },
  {
    id: 'perfume-02',
    name: 'Kaif Supreme Amber Nectar',
    subtitle: 'Golden Amber, Leather & Madagascan Vanilla',
    category: 'perfumes',
    priceINR: 36000,
    priceUSD: 435,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
    description: 'A rich, seductive warm amber fragrance that lingers like a velvet embrace. Features golden amber, soft Tuscan leather, and pure Bourbon vanilla pods.',
    featured: true,
    isNewArrival: false,
    inStock: true,
    specifications: {
      volume: '100 ml / 3.4 fl. oz',
      concentration: 'Extrait de Parfum (30% Oil)',
      fragranceNotes: {
        top: 'Pink Pepper, Honey Blossom, Orange Flower',
        heart: 'Amber Resin, Tuscan Leather, Myrrh',
        base: 'Bourbon Vanilla, Tonka Bean, Sandalwood'
      }
    },
    artisanStory: 'Matured for 180 days in oak aging vessels to ensure unmatched depth and sillage.',
    sku: 'ALK-PRF-002'
  },
  {
    id: 'perfume-03',
    name: 'Majestic Rose & Sandalwood Noir',
    subtitle: 'Mysore Sandalwood & Velvet Centifolia Rose',
    category: 'perfumes',
    priceINR: 32000,
    priceUSD: 385,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
    description: 'A sublime floral-woody masterpiece combining authentic aged Mysore Sandalwood oil with lush French Centifolia rose petals gathered at dawn.',
    featured: false,
    isNewArrival: true,
    inStock: true,
    specifications: {
      volume: '100 ml / 3.4 fl. oz',
      concentration: 'Eau de Parfum Intense (25% Oil)',
      fragranceNotes: {
        top: 'Grasse Rose, Italian Mandarin',
        heart: 'Centifolia Rose, Iris Butter',
        base: 'Mysore Sandalwood, Cashmere Wood, White Musk'
      }
    },
    artisanStory: 'Crafted using 19th century maceration techniques reserved for high perfumery.',
    sku: 'ALK-PRF-003'
  },

  // BESPOKE TIMEPIECES (WATCHES)
  {
    id: 'watch-01',
    name: 'Sultanate Tourbillon Royal Chronometer',
    subtitle: 'Hand-Wound Flying Tourbillon in Rose Gold',
    category: 'watches',
    priceINR: 1250000,
    priceUSD: 15000,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A horological masterpiece featuring an open-worked flying tourbillon cage at 6 oclock. Cased in 18K solid rose gold with a hand-stitched alligator strap.',
    featured: true,
    isNewArrival: true,
    inStock: true,
    specifications: {
      material: '18K Rose Gold & Sapphire Crystal Back',
      caseSize: '41mm Diameter / 9.8mm Thickness',
      karat: '18K Rose Gold'
    },
    artisanStory: 'Equipped with Calibre ALK-01 bespoke movement with 72-hour power reserve.',
    sku: 'ALK-WCH-001'
  },
  {
    id: 'watch-02',
    name: 'Al-Kaif Imperial Gold Skeleton Dial',
    subtitle: 'Automatic Movement & Integrated Gold Bracelet',
    category: 'watches',
    priceINR: 890000,
    priceUSD: 10700,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
    description: 'Sleek, architectural lines with a fully skeletonized automatic dial revealing hand-chiseled gold bridges and 26 rubies.',
    featured: false,
    isNewArrival: false,
    inStock: true,
    specifications: {
      material: '18K Yellow Gold',
      caseSize: '40mm Slim Profile',
      karat: '18K Gold'
    },
    artisanStory: 'Water resistant to 50 meters, featuring anti-reflective dual-domed sapphire crystal.',
    sku: 'ALK-WCH-002'
  }
];

export const POSTGRES_SCHEMA_SQL = `-- PostgreSQL Database Schema for AL-KAIF
-- Database Name: al_kaif

CREATE DATABASE al_kaif;

\c al_kaif;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer', -- 'customer' or 'admin'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jewellery Products Table
CREATE TABLE jewellery_products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    price_inr NUMERIC(12, 2) NOT NULL,
    price_usd NUMERIC(12, 2) NOT NULL,
    image_url TEXT NOT NULL,
    secondary_images TEXT[],
    description TEXT,
    karat VARCHAR(50),
    material VARCHAR(100),
    gemstones TEXT,
    artisan_story TEXT,
    in_stock BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Watch Products Table
CREATE TABLE watch_products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    price_inr NUMERIC(12, 2) NOT NULL,
    price_usd NUMERIC(12, 2) NOT NULL,
    image_url TEXT NOT NULL,
    case_size VARCHAR(100),
    material VARCHAR(100),
    karat VARCHAR(50),
    movement_type VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Perfume Products Table
CREATE TABLE perfume_products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    price_inr NUMERIC(12, 2) NOT NULL,
    price_usd NUMERIC(12, 2) NOT NULL,
    image_url TEXT NOT NULL,
    volume VARCHAR(50),
    concentration VARCHAR(100),
    top_notes TEXT,
    heart_notes TEXT,
    base_notes TEXT,
    in_stock BOOLEAN DEFAULT true,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal_inr NUMERIC(12, 2) NOT NULL,
    tax_inr NUMERIC(12, 2) NOT NULL,
    total_inr NUMERIC(12, 2) NOT NULL,
    total_usd NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Razorpay',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    order_status VARCHAR(50) DEFAULT 'Placed',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    gift_wrapped BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price_inr NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    selected_size VARCHAR(50),
    selected_metal VARCHAR(50)
);

-- 7. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    gateway VARCHAR(50) DEFAULT 'Razorpay',
    transaction_id VARCHAR(255),
    amount_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
