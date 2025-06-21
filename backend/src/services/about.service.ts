import { PrismaClient, About } from '@prisma/client';
const prisma = new PrismaClient();

// Define the type for data manipulation, excluding read-only fields
export type AboutData = Partial<Omit<About, 'id' | 'createdAt' | 'updatedAt'>>;

// --- NEW: A helper function to build the full URL for assets ---
const toAbsolutePaths = (aboutData: About | null): About | null => {
    if (!aboutData) return null;

    const baseUrl = process.env.BACKEND_URL;

    // Prepend base URL only if it's a relative path
    if (aboutData.image && !aboutData.image.startsWith('http')) {
        aboutData.image = `${baseUrl}/${aboutData.image}`;
    }
    if (aboutData.cv && !aboutData.cv.startsWith('http')) {
        aboutData.cv = `${baseUrl}/${aboutData.cv}`;
    }
    
    return aboutData;
};

// --- All functions that RETURN data are now updated ---

export const getAbout = async () => {
  const about = await prisma.about.findFirst();
  // Use the helper function for clean, consistent code
  return toAbsolutePaths(about);
};

export const upsertAbout = async (data: Partial<AboutData>, existingAbout: About | null) => {
  let result: About;

  if (existingAbout) {
    result = await prisma.about.update({
      where: { id: existingAbout.id },
      data: data,
    });
  } else {
    result = await prisma.about.create({
      data: data as About,
    });
  }
  
  // FIX: Transform paths on the result before returning it
  return toAbsolutePaths(result);
};

// The delete function does not return data, so no changes are needed here.
export const deleteAbout = async () => {
  const existingAbout = await prisma.about.findFirst();
  if (!existingAbout) {
    throw new Error('About section not found.');
  }
  return await prisma.about.delete({ where: { id: existingAbout.id } });
};