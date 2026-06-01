/**
 * Copyright © GLANZ
 * Available Places Seeder — seeds default Glanz service locations.
 * Called once at server startup (upsert-safe).
 */

import { prisma } from "../config/prisma.js";

const places = [
  {
    name: "Glanz Dubai Marina",
    address: "Marina Walk, Dubai Marina, Dubai, UAE",
  },
  {
    name: "Glanz Downtown Dubai",
    address: "Downtown Boulevard, Downtown Dubai, Dubai, UAE",
  },
  {
    name: "Glanz JBR (Jumeirah Beach Residence)",
    address: "The Walk, JBR, Dubai, UAE",
  },
];

export async function seedAvailablePlaces() {
  let upserted = 0;
  for (const p of places) {
    const existing = await prisma.availablePlace.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.availablePlace.create({
        data: { name: p.name, address: p.address },
      });
      upserted++;
    }
  }
  console.log(`[AvailablePlacesSeeder] ✓ ${upserted} new places seeded.`);
}
