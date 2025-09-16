import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const postsData = Array.from({ length: 40 }, (_, i) => ({
    title: `Test Post #${i + 1}`,
    content: `This is the content for post number ${i + 1}. It contains some sample text to simulate a real post. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    userId: 1, // DB’da mavjud userId bilan almashtiring
  }));

  await prisma.post.createMany({
    data: postsData,
  });

  console.log('40 test posts have been successfully created!');
}

main()
  .then(() => console.log('Seeding finished'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
