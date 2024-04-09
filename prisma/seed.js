const { PrismaClient, Variation } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create sample stations
  const station1 = await prisma.station.create({
    data: {
      id: 'station1',
      name: 'Station 1',
      status: 'Active',
    },
  });

  const station2 = await prisma.station.create({
    data: {
      id: 'station2',
      name: 'Station 2',
      status: 'Inactive',
    },
  });

  // Create sample USB devices
  const usbDevice1 = await prisma.usbDevice.create({
    data: {
      id: 'device1',
      vendor_id: 'vendor1',
      product_id: 'product1',
      files: ['file1.txt', 'file2.txt'],
      station: {
        connect: {
          id: 'station1',
        },
      },
    },
  });

  const usbDevice2 = await prisma.usbDevice.create({
    data: {
      id: 'device2',
      vendor_id: 'vendor2',
      product_id: 'product2',
      files: ['file3.txt', 'file4.txt'],
      station: {
        connect: {
          id: 'station2',
        },
      },
    },
  });

  // Create sample events
  await prisma.event.createMany({
    data: [
      {
        id: 'event1',
        user: 'user1',
        variation: Variation.Connect,
        tracked: true,
        stationId: 'station1',
        usbdeviceId: 'device1',
        createdAt: new Date(),
      },
      {
        id: 'event2',
        user: 'user2',
        variation: Variation.Disconnect,
        tracked: true,
        stationId: 'station2',
        usbdeviceId: 'device2',
        createdAt: new Date(),
      },
    ],
  });

  console.log('Data seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });