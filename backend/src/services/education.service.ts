import { PrismaClient, Education } from '@prisma/client';
const prisma = new PrismaClient();

export type EducationData = Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt'>>;

// --- NEW: A helper function to build the full URL for the logo ---
// This prevents us from repeating the same logic in every function.
const toAbsolutePaths = (education: Education | null): Education | null => {
    if (!education) return null;

    // Check if a logo path exists and if it's not already a full URL
    if (education.logo && !education.logo.startsWith('http')) {
        education.logo = `${process.env.BACKEND_URL}/${education.logo}`;
    }
    return education;
};

// --- All functions that RETURN data are now updated ---

export const createEducation = async (data: EducationData) => {
  const newEducation = await prisma.education.create({ data: data as Education });
  // FIX: Transform paths on the newly created object before returning
  return toAbsolutePaths(newEducation);
};

export const getAllEducations = async () => {
  const educations = await prisma.education.findMany({});

  const sorted = educations.sort((a, b) => {
    const aIsPresent = a.endDate === null;
    const bIsPresent = b.endDate === null;
    if (aIsPresent && !bIsPresent) return -1;
    if (!aIsPresent && bIsPresent) return 1;
    if (aIsPresent && bIsPresent) {
      return b.startDate.getTime() - a.startDate.getTime();
    }
    if (a.endDate && b.endDate) {
      return b.endDate.getTime() - a.endDate.getTime();
    }
    return 0;
  });

  // FIX: Map over the sorted array and transform paths for each item
  return sorted.map(toAbsolutePaths);
};

export const getEducationById = async (id: string) => {
    const education = await prisma.education.findUnique({ where: { id } });
    // FIX: Use the new helper function for consistency
    return toAbsolutePaths(education);
};

export const updateEducation = async (id: string, data: EducationData) => {
  const updatedEducation = await prisma.education.update({ where: { id }, data });
  // FIX: Transform paths on the updated object before returning
  return toAbsolutePaths(updatedEducation);
};

// The delete function does not return data, so no changes are needed here.
export const deleteEducation = (id: string) => {
  return prisma.education.delete({ where: { id } });
};