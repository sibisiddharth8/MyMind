import { PrismaClient, Member } from '@prisma/client';
const prisma = new PrismaClient();

// Define a type for the data we expect for creation/updates
export type MemberData = Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>>;

export const createMember = (data: MemberData) => {
  return prisma.member.create({ data: data as Member });
};

export const getAllMembers = async ({ page = 1, limit = 10, name }: { page: number, limit: number, name?: string }) => {
  const where = name
    ? {
        name: {
          contains: name,
          mode: 'insensitive' as const, // Case-insensitive search
        },
      }
    : {};

  const total = await prisma.member.count({ where });
  const members = await prisma.member.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: members,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

export const getMemberById = (id: string) => {
    return prisma.member.findUnique({ where: { id }});
};

export const updateMember = (id: string, data: MemberData) => {
  return prisma.member.update({ where: { id }, data });
};

export const deleteMember = (id: string) => {
  return prisma.member.delete({ where: { id } });
};