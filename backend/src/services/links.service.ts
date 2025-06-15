import { PrismaClient, Link } from '@prisma/client';
const prisma = new PrismaClient();

export type LinkData = Partial<Link>;

export const getLinks = async () => {
  return await prisma.link.findFirst();
};

export const upsertLinks = async (data: LinkData, existingLinks: Link | null) => {
  if (existingLinks) {
    // If a document exists, UPDATE it with the new payload.
    return await prisma.link.update({
      where: { id: existingLinks.id },
      data: data,
    });
  } else {
    // If NO document exists, CREATE a new one.
    return await prisma.link.create({
      data: data,
    });
  }
};

export const deleteLinks = async () => {
  const existingLinks = await prisma.link.findFirst();
  if (!existingLinks) {
    throw new Error('Links document not found.');
  }
  return await prisma.link.delete({ where: { id: existingLinks.id } });
};