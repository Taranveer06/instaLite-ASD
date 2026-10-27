const prisma = require('../src/db');
const {users, posts, likes} = require('./seed-data');

async function main() {
  // delete in order: children first
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // create users
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map(u => ({
      username: u.username,
      email: u.email,
      fullname: u.fullname,
      bio: u.bio,
      isPrivate: u.isPrivate,
      createdAt: new Date(u.createdAt),
    })),
  });

  // username -> id lookup
  const userMap = {};
  for (const u of createdUsers) {
    userMap[u.username] = u.id;
  }

  // create posts
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map(p => ({
      imageUrl: p.imageUrl,
      caption: p.caption,
      location: p.location,
      authorId: userMap[p.author],
      createdAt: new Date(p.createdAt),
    })),
  });

  // insta## -> post id lookup
  const postMap = {};
  for (const p of createdPosts) {
    const key = p.imageUrl.split('/')[4]; // "insta01", "insta02", etc.
    postMap[key] = p.id;
  }

  // create likes
  const createdLikes = await prisma.like.createMany({
    data: likes.map(l => ({
      userId: userMap[l.user],
      postId: postMap[l.post],
    })),
  });

  console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

