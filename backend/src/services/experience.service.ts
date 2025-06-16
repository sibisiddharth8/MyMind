import { PrismaClient, Experience } from '@prisma/client';
const prisma = new PrismaClient();

export type ExperienceData = Partial<Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>>;

export const createExperience = (data: ExperienceData) => {
  return prisma.experience.create({ data: data as Experience });
};

export const getAllExperiences = async () => {
  // 1. Fetch all experiences without complex sorting from the database
  const experiences = await prisma.experience.findMany({});

  // 2. Sort the results in our application code using JavaScript's .sort() method
  return experiences.sort((a, b) => {
    const aIsPresent = a.endDate === null;
    const bIsPresent = b.endDate === null;

    // Rule: "Present" jobs come before finished jobs
    if (aIsPresent && !bIsPresent) {
      return -1; // a comes first
    }
    if (!aIsPresent && bIsPresent) {
      return 1; // b comes first
    }

    // Rule: If both jobs are "Present", sort by newest start date
    if (aIsPresent && bIsPresent) {
      return b.startDate.getTime() - a.startDate.getTime();
    }
    
    // Rule: If both jobs are finished, sort by newest end date
    // We can be sure endDate is not null here, but we check to satisfy TypeScript
    if (a.endDate && b.endDate) {
      return b.endDate.getTime() - a.endDate.getTime();
    }
    
    return 0; // Should not be reached
  });
};

export const getExperienceById = (id: string) => {
  return prisma.experience.findUnique({ where: { id } });
};

export const updateExperience = (id: string, data: ExperienceData) => {
  return prisma.experience.update({ where: { id }, data });
};

export const deleteExperience = (id: string) => {
  return prisma.experience.delete({ where: { id } });
};