import { PrismaClient, Member } from '@prisma/client';
const prisma = new PrismaClient();

// Define a type for the data we expect for creation/updates
export type MemberData = Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>>;

const toAbsolutePaths = (member: Member | null): Member | null => {
    if (!member) return null;
    
    // Prepend base URL only if it's a relative path
    if (member.profileImage && !member.profileImage.startsWith('http')) {
        member.profileImage = `${process.env.BACKEND_URL}/${member.profileImage}`;
    }
    return member;
};

export const createMember = async (data: MemberData) => {
  const newMember = await prisma.member.create({ data: data as Member });
  return toAbsolutePaths(newMember);
};

export const getAllMembers = async ({ page = 1, limit = 10, name }: { page: number, limit: number, name?: string }) => {
  const where = name
    ? {
        name: {
          contains: name,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const total = await prisma.member.count({ where });
  const members = await prisma.member.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { name: 'asc' }
  });

  return {
    data: members.map(toAbsolutePaths), // Transform each member in the list
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

export const getAllMembersSimple = async () => {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' }});
    return {
        message: "All members retrieved",
        data: members.map(toAbsolutePaths)
    };
};

export const getMemberById = async (id: string) => {
  const member = await prisma.member.findUnique({ where: { id }});
  return toAbsolutePaths(member);
};

export const updateMember = async (id: string, data: MemberData) => {
  const updatedMember = await prisma.member.update({ where: { id }, data });
  return toAbsolutePaths(updatedMember);
};

export const deleteMember = (id: string) => {
  return prisma.member.delete({ where: { id } });
};