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
  'mailto:michal.hrbacek@creativehill.cz',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  try {
    console.log('Received request body:', req.body);
    const data = req.body;
    console.log('Parsed request body:', data);
    let usbDevice;

    const station = await prisma.station.findUnique({
      where: { id: data.station_id },
      include: { devices: true },
    });
    console.log('Found station:', station);

    if (station) {
      usbDevice = station.devices.find(
        (device) =>
          device.vendor_id === data.device.vendor_id &&
          device.product_id === data.device.product_id &&
          device.serial_number === data.device.serial_number
      );
      console.log('Found USB device:', usbDevice);
    }

    if (!usbDevice) {
      console.log('Creating new USB device...');
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
      console.log('Created new USB device:', usbDevice);
    } else {
      console.log('Updating existing USB device...');
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
      console.log('Updated USB device:', usbDevice);
    }

    if (data.variation === "Disconnect") {
      console.log('Disconnecting USB device...');
      await prisma.usbDevice.update({
        where: {
          id: usbDevice.id,
        },
        data: {
          stationId: null,
        },
      });
      console.log('USB device disconnected');
    } else if (data.variation === "Connect") {
      console.log('Connecting USB device...');
      await prisma.usbDevice.update({
        where: {
          id: usbDevice.id,
        },
        data: {
          stationId: data.station_id,
        },
      });
      console.log('USB device connected');
    }

    console.log('Creating event...');
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
    console.log('Event created:', event);

    if (data.tracked === true) {
      console.log('Sending notifications...');
      const subscriptions = await prisma.subscription.findMany();
      console.log('Found subscriptions:', subscriptions);

      const sendNotifications = subscriptions.map(async (subscription) => {
        try {
          console.log('Sending notification to subscription:', subscription);
          const pushSubscription: PushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys as unknown as SubscriptionKeys,
          };
          const station = await prisma.station.findUnique({ where: { id: data.station_id } });
          console.log('Found station:', station);

          const payload = JSON.stringify({
            title: 'Tracked device connected❗',
            body: `Tracked device connected on station ${station?.name}`,
          });

          await webPush.sendNotification(pushSubscription, payload, {
            vapidDetails: {
              subject: 'mailto:michal.hrbacek@creativehill.cz',
              publicKey: vapidKeys.publicKey,
              privateKey: vapidKeys.privateKey,
            },
          });
          console.log('Notification sent');
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      });

      await Promise.all(sendNotifications);
      console.log('All notifications sent');
    }

    console.log('Returning response...');
    res.status(200).json(event);
  } catch (error) {
    console.error('Error handling the request:', error);
    res.status(500).json(error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}