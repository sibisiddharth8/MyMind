import { PrismaClient, Experience } from '@prisma/client';
const prisma = new PrismaClient();

export type ExperienceData = Partial<Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>>;

const toAbsolutePaths = (experience: Experience | null): Experience | null => {
    if (!experience) return null;
    
    // Prepend base URL only if it's a relative path
    if (experience.logo && !experience.logo.startsWith('http')) {
        experience.logo = `${process.env.BACKEND_URL}/${experience.logo}`;
    }
    return experience;
};

export const createExperience = async (data: ExperienceData) => {
  const newExperience = await prisma.experience.create({ data: data as Experience });
  return toAbsolutePaths(newExperience);
};

export const getAllExperiences = async () => {
  const experiences = await prisma.experience.findMany({});

  const sorted = experiences.sort((a, b) => {
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
  
  // Map over the array to transform each item
  return sorted.map(toAbsolutePaths);
};

export const getExperienceById = async (id: string) => {
  const experience = await prisma.experience.findUnique({ where: { id } });
  return toAbsolutePaths(experience);
};

export const updateExperience = async (id: string, data: ExperienceData) => {
  const updatedExperience = await prisma.experience.update({ where: { id }, data });
  return toAbsolutePaths(updatedExperience);
};

export const deleteExperience = (id: string) => {
  return prisma.experience.delete({ where: { id } });
};