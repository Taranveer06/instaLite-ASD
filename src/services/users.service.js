const prisma = require('../db');

async function createUser(data) {
  return prisma.user.create({data});
}

async function listUsers({page, limit, sortBy, order, where}) {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: {[sortBy]: order},
      skip,
      take: limit,
    }),
    prisma.user.count({where}),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: {id},
    include: {
      _count: {select: {posts: true, likes: true}},
    },
  });
}

async function updateUser(id, data) {
  return prisma.user.update({where: {id}, data});
}

async function deleteUser(id) {
  return prisma.user.delete({where: {id}});
}

module.exports = {createUser, listUsers, getUserById, updateUser, deleteUser};

