import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function createPassword(password: string = faker.internet.password()) {
  return bcrypt.hashSync(password, 10);
}

function createUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    email: `${lastName}@eureka.co`,
    name: `${firstName} ${lastName}`,
    password: createPassword(lastName),
  };
}

function createReview(revieweeName: string) {
  return {
    title: `Review for ${revieweeName}`,
    content: faker.lorem.paragraph(),
  };
}

type Employee = {
  email: string;
  name: string;
  password: string;
  id?: string;
};

async function main() {
  console.log("🌱 Seeding...");
  console.time(`🌱 Database has been seeded`);

  const totalEmployees = 5;
  const employees: Employee[] = Array.from({ length: totalEmployees }, () =>
    createUser()
  );

  // Create employees
  console.time(`👨‍💻 Created employees`);

  for (const employee of employees) {
    const result = await prisma.user.create({
      select: { id: true },
      data: employee,
    });
    employee.id = result.id;
  }

  console.timeEnd(`👨‍💻 Created employees`);

  // Create admin, reviews, assignments and feedbacks
  console.time(`👨🏼‍💼 Created admin`);

  const peopleHavingReview = faker.helpers.arrayElements(
    Array.from({ length: totalEmployees }, (_, index) => index),
    3
  );

  const createdReviews = [];
  for (const index of peopleHavingReview) {
    if (!employees[index].id) {
      continue;
    }
    createdReviews.push({
      ...createReview(employees[index].name),
      revieweeId: employees[index].id,
      assignedTo: faker.helpers.arrayElements(
        Array.from({ length: totalEmployees }, (_, index) => index),
        2
      ),
    });
  }

  await prisma.user.create({
    data: {
      email: "admin@eureka.co",
      password: createPassword("admin12345"),
      name: "Admin",
      createdReviews: {
        create: createdReviews.map((review) => ({
          title: review.title,
          content: review.content,
          reviewee: {
            connect: {
              id: review.revieweeId,
            },
          },
          assignments: {
            create: review.assignedTo.map((index) => ({
              assignedTo: {
                connect: {
                  id: employees[index].id,
                },
              },
              feedback: faker.datatype.boolean()
                ? {
                    create: {
                      content: faker.lorem.paragraph(),
                    },
                  }
                : undefined,
            })),
          },
        })),
      },
    },
  });

  console.timeEnd(`👨🏼‍💼 Created admin`);

  console.timeEnd(`🌱 Database has been seeded`);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
