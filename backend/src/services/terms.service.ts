import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export type TermData = Partial<Omit<Prisma.TermAndConditionCreateInput, 'id' | 'createdAt' | 'updatedAt'>>;

export const createTerm = async (data: TermData) => {
  // Automatically assign the next order number
  const maxOrderTerm = await prisma.termAndCondition.findFirst({ orderBy: { order: 'desc' } });
  const newOrder = maxOrderTerm ? maxOrderTerm.order + 1 : 1;
  return prisma.termAndCondition.create({
    data: { ...data, order: newOrder } as any,
  });
};

export const getAllTerms = () => {
  return prisma.termAndCondition.findMany({
    orderBy: { order: 'asc' }, // Return terms in their custom order
  });
};

export const getTermById = (id: string) => {
  return prisma.termAndCondition.findUnique({ where: { id } });
};

export const updateTerm = (id: string, data: TermData) => {
  return prisma.termAndCondition.update({ where: { id }, data });
};

// A dedicated service for reordering multiple terms at once
export const updateTermOrder = async (termOrders: { id: string, order: number }[]) => {
  const updates = termOrders.map(term =>
    prisma.termAndCondition.update({
      where: { id: term.id },
      data: { order: term.order },
    })
  );
  // Use a transaction to ensure all updates succeed or fail together
  return prisma.$transaction(updates);
};

export const deleteTerm = (id: string) => {
  return prisma.termAndCondition.delete({ where: { id } });
};