import { PrismaClient, Education } from '@prisma/client';
const prisma = new PrismaClient();

export type EducationData = Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt'>>;

export const createEducation = (data: EducationData) => {
  return prisma.education.create({ data: data as Education });
};

export const getAllEducations = async () => {
  const educations = await prisma.education.findMany({});

  // Sort in application code to handle "Present" (null endDate) correctly
  return educations.sort((a, b) => {
    const aIsPresent = a.endDate === null;
    const bIsPresent = b.endDate === null;

    if (aIsPresent && !bIsPresent) return -1;
    if (!aIsPresent && bIsPresent) return 1;

    if (aIsPresent && bIsPresent) {
      return b.startDate.getTime() - a.startDate.getTime(); // Newest start date first
    }
    
    if (a.endDate && b.endDate) {
      return b.endDate.getTime() - a.endDate.getTime(); // Newest end date first
    }
    
    return 0;
  });
};

export const getEducationById = (id: string) => {
  return prisma.education.findUnique({ where: { id } });
};

export const updateEducation = (id: string, data: EducationData) => {
  return prisma.education.update({ where: { id }, data });
};

export const deleteEducation = (id: string) => {
  return prisma.education.delete({ where: { id } });
};