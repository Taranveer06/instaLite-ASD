const prisma = require('../db');

async function createPost(data) {
  return prisma.post.create({data});
}

async function listPosts({page, limit, sortBy, order, where}) {
  const skip = (page - 1) * limit;

  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [
      {likes: {_count: order}},
      {createdAt: 'desc'},
    ];
  } else {
    orderBy = {[sortBy]: order};
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {select: {id: true, username: true, fullname: true}},
        _count: {select: {likes: true}},
      },
    }),
    prisma.post.count({where}),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: {id},
    include: {
      author: {select: {id: true, username: true, fullname: true}},
      _count: {select: {likes: true}},
    },
  });
}

async function updatePost(id, data) {
  return prisma.post.update({where: {id}, data});
}

async function deletePost(id) {
  return prisma.post.delete({where: {id}});
}

async function getPostsByUser(userId, {page, limit}) {
  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: {authorId: userId},
      orderBy: {createdAt: 'desc'},
      skip,
      take: limit,
      include: {
        _count: {select: {likes: true}},
      },
    }),
    prisma.post.count({where: {authorId: userId}}),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function getLikedPosts(userId, {page, limit}) {
  const skip = (page - 1) * limit;
  const where = {likes: {some: {userId}}};

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      skip,
      take: limit,
      include: {
        author: {select: {id: true, username: true, fullname: true}},
        _count: {select: {likes: true}},
      },
    }),
    prisma.post.count({where}),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUser,
  getLikedPosts,
};

