import { PrismaClient, Prisma } from '@prisma/client'; // <-- Import the 'Prisma' type
const prisma = new PrismaClient();

// Helper for custom sorting (no changes here)
const sortProjects = (projects: any[]) => {
  return projects.sort((a, b) => {
    const aIsPresent = a.endDate === null;
    const bIsPresent = b.endDate === null;
    if (aIsPresent && !bIsPresent) return -1;
    if (!aIsPresent && bIsPresent) return 1;
    if (aIsPresent && bIsPresent) return b.startDate.getTime() - a.startDate.getTime();
    if (a.endDate && b.endDate) return b.endDate.getTime() - a.endDate.getTime();
    return 0;
  });
};

const transformProjectPaths = (project: any) => {
    if (!project) return null;
    const baseUrl = process.env.BACKEND_URL;

    // Transform the main project image
    if (project.projectImage && !project.projectImage.startsWith('http')) {
        project.projectImage = `${baseUrl}/${project.projectImage}`;
    }

    // Transform the nested member profile images
    if (project.members && project.members.length > 0) {
        project.members.forEach((pm: any) => {
            if (pm.member?.profileImage && !pm.member.profileImage.startsWith('http')) {
                pm.member.profileImage = `${baseUrl}/${pm.member.profileImage}`;
            }
        });
    }
    return project;
};

export const updateProjectCategory = ({ id, name }: { id: string; name: string }) => {
    return prisma.projectCategory.update({
        where: { id },
        data: { name },
    });
};

// --- Category Services --- (no changes here)
export const createProjectCategory = (name: string) => prisma.projectCategory.create({ data: { name } });
export const getAllProjectCategories = () => prisma.projectCategory.findMany();
export const getProjectCategorySummaries = async () => {
  const categories = await prisma.projectCategory.findMany({
    select: { id: true, name: true, _count: { select: { projects: true } } },
  });
  return categories.map(c => ({ id: c.id, name: c.name, projectCount: c._count.projects }));
};
export const deleteProjectCategory = (id: string) => prisma.projectCategory.delete({ where: { id } });


// --- Project Services ---
export const createProject = async (data: any) => {
    const { members, ...projectData } = data;
    const newProject = await prisma.project.create({
        data: {
            ...projectData,
            members: {
                create: members?.map((m: { memberId: string, role: string }) => ({
                    role: m.role,
                    member: { connect: { id: m.memberId } }
                }))
            }
        },
        include: { category: true, members: { include: { member: true } } }
    });
    return transformProjectPaths(newProject);
};

// THIS FUNCTION IS CORRECTED
export const updateProject = async (id: string, data: any) => {
    const { members, ...projectData } = data;
    const transaction: Prisma.PrismaPromise<any>[] = []; 
    if (Object.keys(projectData).length > 0) {
        transaction.push(prisma.project.update({ where: { id }, data: { ...projectData } }));
    }
    if (members) {
        transaction.push(prisma.projectMember.deleteMany({ where: { projectId: id } }));
        if (members.length > 0) {
            transaction.push(prisma.projectMember.createMany({
                data: members.map((m: { memberId: string, role: string }) => ({
                    role: m.role,
                    projectId: id,
                    memberId: m.memberId
                }))
            }));
        }
    }
    await prisma.$transaction(transaction);
    // getProjectById already transforms paths, so this is correct.
    return getProjectById(id);
};

export const getAllProjects = async ({ page = 1, limit = 9, categoryId, name }: { page: number, limit: number, categoryId?: string, name?: string }) => {
    const where: Prisma.ProjectWhereInput = {};
    if (categoryId) { where.categoryId = categoryId; }
    if (name) { where.name = { contains: name, mode: 'insensitive' }; }

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, members: { include: { member: true } } }
    });
    const sortedProjects = sortProjects(projects);
    
    return {
        data: sortedProjects.map(transformProjectPaths), // Transform every project in the list
        pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit }
    };
};

export const getRecentProjects = async (limit: number) => {
    const projects = await prisma.project.findMany({
        take: limit * 2,
        include: { category: true, members: { include: { member: true } } },
        orderBy: { startDate: 'desc' }
    });
    const sortedProjects = sortProjects(projects);
    return sortedProjects.slice(0, limit).map(transformProjectPaths);
};

export const getProjectById = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        include: { category: true, members: { include: { member: true } } }
    });
    return transformProjectPaths(project);
};

export const deleteProject = (id: string) => prisma.project.delete({ where: { id } });