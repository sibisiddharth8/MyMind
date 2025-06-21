import { PrismaClient, Prisma, TermAndCondition } from '@prisma/client';
const prisma = new PrismaClient();

export type TermData = Partial<Omit<Prisma.TermAndConditionCreateInput, 'id' | 'createdAt' | 'updatedAt'>>;

const toAbsolutePaths = (term: TermAndCondition | null): TermAndCondition | null => {
    if (!term) return null;
    
    if (term.imagePath && !term.imagePath.startsWith('http')) {
        term.imagePath = `${process.env.BACKEND_URL}/${term.imagePath}`;
    }
    return term;
};

export const createTerm = async (data: TermData) => {
  const maxOrderTerm = await prisma.termAndCondition.findFirst({ orderBy: { order: 'desc' } });
  const newOrder = maxOrderTerm ? maxOrderTerm.order + 1 : 1;
  
  const newTerm = await prisma.termAndCondition.create({
    data: { ...data, order: newOrder } as any,
  });
  return toAbsolutePaths(newTerm);
};

export const getAllTerms = async () => {
  const terms = await prisma.termAndCondition.findMany({
    orderBy: { order: 'asc' },
  });
  return terms.map(toAbsolutePaths);
};

export const getTermById = async (id: string) => {
  const term = await prisma.termAndCondition.findUnique({ where: { id } });
  return toAbsolutePaths(term);
};

export const updateTerm = async (id: string, data: TermData) => {
  const updatedTerm = await prisma.termAndCondition.update({ where: { id }, data });
  return toAbsolutePaths(updatedTerm);
};

// A dedicated service for reordering multiple terms at once
export const updateTermOrder = async (termOrders: { id: string, order: number }[]) => {
  const updates = termOrders.map(term =>
    prisma.termAndCondition.update({
      where: { id: term.id },
      data: { order: term.order },
    })
  );
  
  const results = await prisma.$transaction(updates);
  return results.map(toAbsolutePaths);
};
export const deleteTerm = (id: string) => {
  return prisma.termAndCondition.delete({ where: { id } });
};