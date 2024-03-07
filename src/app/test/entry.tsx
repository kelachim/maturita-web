import { useState } from "react";
import { Prisma } from "@prisma/client";
import Stations from "./stations";

type Station = Prisma.StationGetPayload<{
  include: {
    devices: true;
    events: true;
  }
}>;

type UsbDevice = Prisma.UsbDeviceGetPayload<{
  include: {
    event: true;
  }
}>;

type Event = Prisma.EventGetPayload<{
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

interface EntryProps {
  obj: any;
  variation: boolean;
}

export default function Entry({ obj, variation }: EntryProps) {
  const [isStationDataOpen, setIsStationDataOpen] = useState(false);
  const [data, setData] = useState([]);

  const handleBubbleClick = (obj: any) => {
    setIsStationDataOpen(!isStationDataOpen);
    setData(obj)
  };

  return (
    <>
    <div className="!m-0 w-full text-neutral-100 whitespace-nowrap h-[37px] ">
      {Object.keys(obj).map((key) => (
        <>
          {Array.isArray(obj[key]) ? (
            <div key={key} className="inline-block hide-scrollbar select-none overflow-x-auto overflow-y-hidden border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]">
              <div className={`rounded-sm text-center ${variation ? "bg-[#2d3648]" : "bg-[#262d3a]"}`} onClick={() => handleBubbleClick(obj[key])}>
                {obj[key].length}
              </div>
            </div>
          ) : Object.prototype.toString.call(obj[key]) === "[object Object]" ? (
            <div key={key} className="inline-block hide-scrollbar select-none overflow-x-auto overflow-y-hidden border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]">
              <div className={`rounded-sm text-center ${variation ? "bg-[#2d3648]" : "bg-[#262d3a]"} `} onClick={() => handleBubbleClick([obj[key]] as [any])}>
                {getPrismaType(obj[key])}
              </div>
            </div>
          ) : (
            <div key={key} onClick={() => {navigator.clipboard.writeText(obj[key])}} className={`inline-block ${variation ? "bg-[#1b202b] hover:bg-[#222835]" : "bg-[#14181f] hover:bg-[#202631]"} overflow-y-hidden hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}>
              {JSON.stringify(obj[key])}
            </div>
          )}
        </>
      ))}
    </div>
    {isStationDataOpen ? <Stations data={data} isMenu={true} /> : ""}
    </>
  );
}
