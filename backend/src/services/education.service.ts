import { PrismaClient, Education } from '@prisma/client';
const prisma = new PrismaClient();

export type EducationData = Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt'>>;

export const createEducation = (data: EducationData) => {
  return prisma.education.create({ data: data as Education });
};

export const getAllEducations = () => {
  return prisma.education.findMany({
    // Sorts by the end date, newest first
    orderBy: {
      endDate: 'desc'
    }
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