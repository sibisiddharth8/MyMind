import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const transformSkillPaths = (skill: any) => {
    if (skill?.image && !skill.image.startsWith('http')) {
        skill.image = `${process.env.BACKEND_URL}/${skill.image}`;
    }
    return skill;
};

const transformCategoryPaths = (category: any) => {
    if (!category) return null;
    if (category.skills && category.skills.length > 0) {
        category.skills = category.skills.map(transformSkillPaths);
    }
    return category;
};

// --- Category Services ---
export const createCategory = (name: string) => {
  return prisma.skillCategory.create({ data: { name } });
};

// ADD THIS NEW FUNCTION
export const getCategoryById = async (id: string) => {
  const category = await prisma.skillCategory.findUnique({
    where: { id },
    include: { skills: true },
  });
  // FIX: Transform paths for all nested skills
  return transformCategoryPaths(category);
};

export const getAllCategoriesWithSkills = async () => {
  const categories = await prisma.skillCategory.findMany({
    include: { skills: true },
  });
  // FIX: Map and transform paths for each category and its skills
  return categories.map(transformCategoryPaths);
};

export const updateCategory = (id: string, name: string) => {
  return prisma.skillCategory.update({ where: { id }, data: { name } });
};

export const deleteCategory = (id: string) => {
  return prisma.skillCategory.delete({ where: { id } });
};

export const createSkill = async (name: string, image: string, categoryId: string) => {
  const newSkill = await prisma.skill.create({
    data: { name, image, categoryId },
  });
  // FIX: Transform path on the newly created skill
  return transformSkillPaths(newSkill);
};

export const getSkillById = async (id: string) => {
    const skill = await prisma.skill.findUnique({ where: { id } });
    // FIX: Transform path before returning
    return transformSkillPaths(skill);
};

export const updateSkill = async (id: string, data: { name?: string; image?: string }) => {
  const updatedSkill = await prisma.skill.update({ where: { id }, data });
  // FIX: Transform path on the updated skill
  return transformSkillPaths(updatedSkill);
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