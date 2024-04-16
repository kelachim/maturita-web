import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import webPush, { type PushSubscription } from "web-push";
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface SubscriptionKeys {
  p256dh: string,
  auth: string
}

const vapidKeys = webPush.generateVAPIDKeys();

webPush.setVapidDetails(
  'mailto:web-push-demo@example.com',
  "BA7vAUHWcniqnXUmgJIWHrqZAfuAWJ0BxYdNfjXGbBVygM9tRaiqTTvgYgZ5wT1l6Tjtzlfs_uLs0_b0DSMwdTk",
  vapidKeys.privateKey
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  try {
    const data = req.body;
    console.log(data);
    let usbDevice;

    const station = await prisma.station.findUnique({
      where: { id: data.station_id },
      include: { devices: true },
    });

    if (station) {
      usbDevice = station.devices.find(
        (device) =>
          device.vendor_id === data.device.vendor_id &&
          device.product_id === data.device.product_id &&
          device.serial_number === data.device.serial_number
      );
    }

    if (!usbDevice) {
      usbDevice = await prisma.usbDevice.create({
        data: {
          vendor_id: data.device.vendor_id,
          product_id: data.device.product_id,
          description: data.device.description,
          serial_number: data.device.serial_number,
          files: data.device.files || [],
          station: {
            connect: {
              id: data.station_id,
            },
          },
        },
      });
    } else {
      usbDevice = await prisma.usbDevice.update({
        where: {
          id: usbDevice.id,
        },
        data: {
          vendor_id: data.device.vendor_id,
          product_id: data.device.product_id,
          description: data.device.description,
          serial_number: data.device.serial_number,
          files: data.device.files || [],
        },
      });
    }

    if (data.variation === "Disconnect") {
      await prisma.usbDevice.update({
        where: {
          id: usbDevice.id,
        },
        data: {
          stationId: null,
        },
      });
    } else if (data.variation === "Connect") {
      await prisma.usbDevice.update({
        where: {
          id: usbDevice.id,
        },
        data: {
          stationId: data.station_id,
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        id: data.id,
        user: data.user,
        variation: data.variation,
        tracked: data.tracked,
        station: {
          connect: {
            id: data.station_id,
          },
        },
        usbdevice: {
          connect: {
            id: usbDevice.id,
          },
        },
        createdAt: format(new Date(), 'dd/MM/yyyy', { locale: cs }),
      },
    });

    if (data.tracked === true) {
      const subscriptions = await prisma.subscription.findMany();

      const sendNotifications = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription: PushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys as unknown as SubscriptionKeys,
          };
          const station = await prisma.station.findUnique({ where: { id: data.station_id } });

          const payload = JSON.stringify({
            title: 'Tracked device connected❗',
            body: `Tracked device connected on station ${station?.name}`,
          });

          await webPush.sendNotification(pushSubscription, payload, {
            vapidDetails: {
              subject: 'mailto:your@email.com',
              publicKey: vapidKeys.publicKey,
              privateKey: vapidKeys.privateKey,
            },
          });
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      });

      await Promise.all(sendNotifications);
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  } finally {
    await prisma.$disconnect();
  }
}