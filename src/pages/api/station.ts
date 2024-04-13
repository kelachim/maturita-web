import { PrismaClient, UsbDevice } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
 try {
   const { id, name, devices } = req.body;

   const result = await prisma.$transaction(async (prisma) => {
     const createdDevices = await Promise.all(
       devices.map((device: UsbDevice) =>
         prisma.usbDevice.create({
           data: {
             vendor_id: device.vendor_id,
             product_id: device.product_id,
             files: device.files || [],
             description: device.description,
             serial_number: device.serial_number,
           },
         })
       )
     );

     return prisma.station.upsert({
       where: { id },
       update: {
         name: name.trim(),
         devices: {
           connect: createdDevices.map((device) => ({ id: device.id })),
         },
       },
       create: {
         id,
         name: name.trim(),
         devices: {
           connect: createdDevices.map((device) => ({ id: device.id })),
         },
       },
     });
   });

   return res.status(200).json({ message: "Station and devices created!", result });
 } catch (error) {
   console.error(error);
   return res.status(500).json({ message: "Error creating station and devices", error: error });
 } finally {
   await prisma.$disconnect();
 }
}