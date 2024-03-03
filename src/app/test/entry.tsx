import { Prisma } from "@prisma/client";

type StationWithDevicesAndEvents = Prisma.StationGetPayload<{
  include: {
    devices: true;
    events: true;
  }
}>;

type UsbDeviceWithEvent = Prisma.UsbDeviceGetPayload<{
  include: {
    event: true;
  }
}>;

type EventWithStationAndUsbDevice = Prisma.EventGetPayload<{
  include: {
    station: true;
    usbdevice: true;
  }
}>;

function getPrismaType(obj: any): string {
  if ('status' in obj) {
    return 'Station';
  } else if ('vendor_id' in obj) {
    return 'UsbDevice';
  } else if ('variation' in obj) {
    return 'Event';
  } 
  return ""
}

//@ts-ignore
export default function Entry({ obj }) {
  return (
    <div className="!m-0 w-full text-neutral-100 whitespace-nowrap">
      {Object.keys(obj).map((key) => (
        <>
        {
          Array.isArray(obj[key]) ? 
          <div key={key} className="inline-block hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {obj[key].length}
          </div>
          : Object.prototype.toString.call(obj[key]) === '[object Object]' ?
          <div key={key} className="inline-block hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {getPrismaType(obj[key])}
          </div>
          : <div key={key} className="inline-block hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {obj[key]}
          </div>
        }
        </>
      ))}
    </div>
  );
}