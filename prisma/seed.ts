import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const jewelleryProducts = [
  {
    slug: "celestial-diamond-ring",
    name: "Celestial Diamond Ring",
    collection: "Celestial",
    price: 185000,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "A sculpted diamond ring with a luminous centre stone, created for modern heirloom wear.",
    details: ["18K gold", "Conflict-free diamonds", "Made to order", "Lifetime polishing support"],
    material: "18K yellow gold, natural diamonds",
    stock: 8,
    featured: true
  },
  {
    slug: "noor-emerald-necklace",
    name: "Noor Emerald Necklace",
    collection: "Noor",
    price: 325000,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "An emerald and diamond necklace designed around quiet brilliance and ceremonial presence.",
    details: ["Emerald centre stones", "Diamond accents", "Adjustable chain", "Luxury presentation case"],
    material: "18K white gold, emeralds, diamonds",
    stock: 4,
    featured: true
  },
  {
    slug: "heritage-diamond-bracelet",
    name: "Heritage Diamond Bracelet",
    collection: "Heritage",
    price: 215000,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "A flexible diamond bracelet shaped for evening refinement and everyday polish.",
    details: ["Secure clasp", "Hand-set stones", "Complimentary resizing", "Insured delivery"],
    material: "18K rose gold, diamonds",
    stock: 6,
    featured: false
  },
  {
    slug: "luna-pearl-earrings",
    name: "Luna Pearl Earrings",
    collection: "Luna",
    price: 78000,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "Pearl drop earrings with delicate diamond detailing and soft evening movement.",
    details: ["Freshwater pearls", "Diamond-set hoops", "Lightweight fit", "Gift-ready packaging"],
    material: "18K gold, pearls, diamonds",
    stock: 15,
    featured: true
  }
];

const watchProducts = [
  {
    slug: "maison-automatic-watch",
    name: "Maison Automatic Watch",
    collection: "Maison",
    price: 245000,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "A restrained automatic timepiece with a polished case, exhibition back, and leather strap.",
    details: ["Automatic movement", "Sapphire crystal", "Water resistant", "Two-year service warranty"],
    material: "Stainless steel, sapphire crystal, calf leather",
    stock: 12,
    featured: true
  },
  {
    slug: "nocturne-chronograph-watch",
    name: "Nocturne Chronograph Watch",
    collection: "Nocturne",
    price: 295000,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1507679622673-989605832e3d?auto=format&fit=crop&w=1400&q=85"
    ],
    description: "A chronograph watch with a deep dial, precise counters, and formal evening character.",
    details: ["Chronograph movement", "Deployant clasp", "Scratch resistant crystal", "Premium gift box"],
    material: "Stainless steel, ceramic bezel, leather",
    stock: 9,
    featured: false
  }
];

async function main() {
  for (const product of jewelleryProducts) {
    await prisma.jewelleryProduct.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  for (const product of watchProducts) {
    await prisma.watchProduct.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
