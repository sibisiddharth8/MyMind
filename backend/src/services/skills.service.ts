import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- Category Services ---
export const createCategory = (name: string) => {
  return prisma.skillCategory.create({ data: { name } });
};

// ADD THIS NEW FUNCTION
export const getCategoryById = (id: string) => {
  return prisma.skillCategory.findUnique({
    where: { id },
    include: { skills: true }, // Also include the skills in this category
  });
};

export const getAllCategoriesWithSkills = () => {
  return prisma.skillCategory.findMany({
    include: { skills: true }, // Also fetch all related skills
  });
};

export const updateCategory = (id: string, name: string) => {
  return prisma.skillCategory.update({ where: { id }, data: { name } });
};

export const deleteCategory = (id: string) => {
  return prisma.skillCategory.delete({ where: { id } });
};

// --- Skill Services ---
// (The rest of the file remains the same)
export const createSkill = (name: string, image: string, categoryId: string) => {
  return prisma.skill.create({
    data: { name, image, categoryId },
  });
};

export const getSkillById = (id: string) => {
    return prisma.skill.findUnique({ where: { id } });
};

export const updateSkill = (id: string, data: { name?: string; image?: string }) => {
  return prisma.skill.update({ where: { id }, data });
};

export const deleteSkill = (id: string) => {
  return prisma.skill.delete({ where: { id } });
};

export const getCategorySummaries = async () => {
  const categories = await prisma.skillCategory.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          skills: true, // This will count the number of related skills
        },
      },
    },
  });

  // Transform the data to a cleaner format
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    skillCount: category._count.skills,
  }));
};