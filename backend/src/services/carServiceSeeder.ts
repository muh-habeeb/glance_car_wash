/**
 * Copyright © GLANZ
 * Car Service Seeder — seeds 5 categories × multiple services with dummy AED prices.
 * Called once at server startup (upsert-safe).
 */

import { prisma } from "../config/prisma.js";
import { ServiceCategory } from "@prisma/client";

const services = [
  // ── CAR WASH ──
  {
    name: "Normal Car Wash",
    category: ServiceCategory.CAR_WASH,
    shortDescription: "Quick exterior rinse and dry",
    longDescription: "A thorough exterior wash using premium soaps and microfiber towels to leave your car spotless.",
    price: 35,
  },
  {
    name: "Premium Car Wash",
    category: ServiceCategory.CAR_WASH,
    shortDescription: "Full exterior + interior wipe-down",
    longDescription: "Includes exterior wash, interior vacuum, dashboard wipe, and window cleaning inside and out.",
    price: 65,
  },
  {
    name: "Ceramic Glaze Wash",
    category: ServiceCategory.CAR_WASH,
    shortDescription: "Hydrophobic ceramic wash protection",
    longDescription: "Premium wash enhanced with a ceramic coating spray to repel water and protect paint for up to 3 months.",
    price: 120,
  },

  // ── CAR CARE ──
  {
    name: "Full Detailing",
    category: ServiceCategory.CAR_CARE,
    shortDescription: "Deep clean inside and out",
    longDescription: "Comprehensive interior and exterior detailing including clay bar treatment, polish, and interior steam cleaning.",
    price: 200,
  },
  {
    name: "Ceramic Coating",
    category: ServiceCategory.CAR_CARE,
    shortDescription: "Long-term paint protection layer",
    longDescription: "Professional-grade ceramic coating applied to the exterior for up to 2 years of hydrophobic protection and gloss enhancement.",
    price: 800,
  },
  {
    name: "Paint Protection Film",
    category: ServiceCategory.CAR_CARE,
    shortDescription: "Invisible scratch-resistant film",
    longDescription: "Self-healing PPF applied to the most vulnerable areas of your vehicle to guard against stone chips, scratches, and UV damage.",
    price: 1200,
  },

  // ── CAR TINTING ──
  {
    name: "Solar Film Tinting",
    category: ServiceCategory.CAR_TINTING,
    shortDescription: "UV and heat rejection film",
    longDescription: "Standard dyed or metalised solar film that reduces heat and UV penetration, improving cabin comfort.",
    price: 300,
  },
  {
    name: "Nano Ceramic Tint",
    category: ServiceCategory.CAR_TINTING,
    shortDescription: "Premium clear heat rejection",
    longDescription: "High-performance nano-ceramic window film that blocks up to 90% of infrared heat without darkening visibility.",
    price: 600,
  },
  {
    name: "Chameleon / Colour-Shift Tint",
    category: ServiceCategory.CAR_TINTING,
    shortDescription: "Colour-changing iridescent film",
    longDescription: "Stylish colour-shifting film that changes hue depending on lighting angle. Combines aesthetics with solar protection.",
    price: 900,
  },

  // ── CAR SERVICE ──
  {
    name: "Oil & Filter Change",
    category: ServiceCategory.CAR_SERVICE,
    shortDescription: "Full synthetic oil + new filter",
    longDescription: "Engine oil drain and refill with full-synthetic oil and a new OEM-spec filter. Includes basic fluid top-up check.",
    price: 150,
  },
  {
    name: "Battery Replacement",
    category: ServiceCategory.CAR_SERVICE,
    shortDescription: "New battery fit and test",
    longDescription: "Old battery removal, new battery fitment and terminal cleaning. Includes health test before and after.",
    price: 250,
  },
  {
    name: "General Vehicle Service",
    category: ServiceCategory.CAR_SERVICE,
    shortDescription: "Comprehensive utility service package",
    longDescription: "Full inspection covering brakes, tyres, fluids, belts, lights, and air filter. Includes oil change and a detailed report.",
    price: 350,
  },

  // ── ACCESSORIES ──
  {
    name: "Premium Car Perfume",
    category: ServiceCategory.ACCESSORIES,
    shortDescription: "Luxury interior fragrance",
    longDescription: "Long-lasting luxury car perfume diffuser for a fresh, premium cabin ambiance.",
    price: 50,
  },
  {
    name: "Custom Seat Covers",
    category: ServiceCategory.ACCESSORIES,
    shortDescription: "Tailored protective seat covers",
    longDescription: "High-quality leatherette or fabric seat covers custom-fitted to your vehicle model.",
    price: 180,
  },
  {
    name: "All-Weather Floor Mats",
    category: ServiceCategory.ACCESSORIES,
    shortDescription: "Heavy-duty rubber floor protection",
    longDescription: "Premium all-weather rubber floor mats laser-cut to fit your vehicle perfectly. Protects against dirt, water, and wear.",
    price: 120,
  },
];

export async function seedCarServices() {
  let upserted = 0;
  for (const s of services) {
    const existing = await prisma.carService.findFirst({
      where: { name: s.name, category: s.category },
    });
    if (!existing) {
      await prisma.carService.create({
        data: {
          name: s.name,
          category: s.category,
          shortDescription: s.shortDescription,
          longDescription: s.longDescription,
          price: s.price,
        },
      });
      upserted++;
    }
  }
  console.log(`[CarServiceSeeder] ✓ ${upserted} new services seeded.`);
}
