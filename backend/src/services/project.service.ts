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
    return prisma.project.create({
        data: {
            ...projectData,
            members: {
                create: members?.map((m: { memberId: string, role: string }) => ({
                    role: m.role,
                    member: { connect: { id: m.memberId } }
                }))
            }
        },
        include: { members: { include: { member: true } } }
    });
};

// THIS FUNCTION IS CORRECTED
export const updateProject = async (id: string, data: any) => {
    const { members, ...projectData } = data;
    
    // 1. Explicitly type the transaction array to accept any Prisma promise
    const transaction: Prisma.PrismaPromise<any>[] = [];

    // 2. If there's project data to update (like name, description), add it to the transaction
    if (Object.keys(projectData).length > 0) {
        transaction.push(prisma.project.update({
            where: { id },
            data: { ...projectData }
        }));
    }

    // 3. If the members list is provided, sync it
    if (members) {
        // First, delete all existing member links for this project
        transaction.push(prisma.projectMember.deleteMany({ where: { projectId: id } }));

        // Then, create the new member links
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

    // 4. Execute all database operations in a single, safe transaction
    await prisma.$transaction(transaction);

    // 5. Return the final, updated project with all relations included
    return getProjectById(id);
};

export const getAllProjects = async ({ page = 1, limit = 10, categoryId, name }: { page: number, limit: number, categoryId?: string, name?: string }) => {
    
    // Build the 'where' clause dynamically
    const where: any = {};
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (name) {
        where.name = {
            contains: name,
            mode: 'insensitive' as const,
        };
    }

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, members: { include: { member: true } } }
    });

    const sortedProjects = sortProjects(projects);
    
    return {
        data: sortedProjects,
        pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
        }
    };
};

export const getRecentProjects = async (limit: number) => {
    const projects = await prisma.project.findMany({
        take: limit * 2, // Fetch more to ensure correct sorting before slicing
        include: { category: true, members: { include: { member: true } } }
    });
    return sortProjects(projects).slice(0, limit);
};

export const getProjectById = (id: string) => {
    return prisma.project.findUnique({
        where: { id },
        include: { category: true, members: { include: { member: true } } }
    });
};

export const deleteProject = (id: string) => prisma.project.delete({ where: { id } });