import { PrismaClient, About } from '@prisma/client';
const prisma = new PrismaClient();

// This interface is useful for type-checking
export type AboutData = About;

export const getAbout = async () => {
  return await prisma.about.findFirst();
};

// Updated to handle partial data for updates
export const upsertAbout = async (data: Partial<AboutData>, existingAbout: About | null) => {
  if (existingAbout) {
    // If a document exists, UPDATE it with the new payload.
    return await prisma.about.update({
      where: { id: existingAbout.id },
      data: data,
    });
  } else {
    // If NO document exists, CREATE a new one.
    // The controller ensures 'data' has the required fields for creation.
    return await prisma.about.create({
      data: data as AboutData,
    });
  }
};

export const deleteAbout = async () => {
  const existingAbout = await prisma.about.findFirst();
  if (!existingAbout) {
    throw new Error('About section not found.');
  }
  return await prisma.about.delete({ where: { id: existingAbout.id } });
};