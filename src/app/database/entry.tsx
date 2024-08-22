import { useState, useRef } from "react";
import type { Prisma } from "@prisma/client";
import Stations from "./stations";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from "date-fns/format";
import { cs } from "date-fns/locale";

type Station = Prisma.StationGetPayload<{
  include: {
    devices: true;
    events: true;
  };
}>;

type UsbDevice = Prisma.UsbDeviceGetPayload<{
  include: {
    event: true;
  };
}>;

type Event = Prisma.EventGetPayload<{
  include: {
    station: true;
    usbdevice: true;
  };
}>;

function getPrismaType(obj: any): string {
  if ('name' in obj) {
    return 'Station';
  } else if ('vendor_id' in obj) {
    return 'UsbDevice';
  } else if ('variation' in obj) {
    return 'Event';
  }
  return "";
}

interface EntryProps {
  obj: any;
  variation: boolean;
  tab: any;
}

export default function Entry({ obj, variation, tab }: EntryProps) {
  const [isStationDataOpen, setIsStationDataOpen] = useState(false);
  const [data, setData] = useState([]);
  const booleanFieldRef = useRef(null);

  const handleBubbleClick = (obj: any) => {
    setIsStationDataOpen(!isStationDataOpen);
    setData(obj);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: cs });
  };

  function isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  const handleTrackerUpdate = async (usbdevice: UsbDevice) => {
    try {
      const response = await fetch('/api/tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId: usbdevice.id }),
      });
      if (!response.ok) {
        console.error('Error updating tracker:', await response.json());
      } else {
        // Directly update the DOM without causing a re-render
        if (booleanFieldRef.current) {
          usbdevice.tracked = !usbdevice.tracked; // Toggle the tracked state
          booleanFieldRef.current.innerText = JSON.stringify(usbdevice.tracked);
        }
        toast.success('Tracker updated!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error('Error updating tracker:', error);
      toast.error('Error updating tracker. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <div className="!m-0 w-full cursor-pointer text-neutral-100 whitespace-nowrap h-[37px]">
        {Object.keys(obj).map((key) => (
          <>
            {Array.isArray(obj[key]) ? (
              <div
                key={key}
                className={`inline-block ${key === "files" || obj[key].length === 0 ? "cursor-auto" : "cursor-help"} hide-scrollbar select-none overflow-x-auto overflow-y-hidden border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}
              >
                <div
                  className={`rounded-sm text-center ${variation ? "bg-[#2d3648]" : "bg-[#262d3a]"}`}
                  onClick={() => {
                    if (obj[key].length !== 0 && key !== "files") {
                      handleBubbleClick(obj[key])
                    }
                  }}
                >
                  {obj[key].length}
                </div>
              </div>
            ) : Object.prototype.toString.call(obj[key]) === "[object Object]" ? (
              <div
                key={key}
                className="inline-block hide-scrollbar cursor-help select-none overflow-x-auto overflow-y-hidden border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]"
              >
                <div
                  className={`rounded-sm text-center ${variation ? "bg-[#2d3648]" : "bg-[#262d3a]"} `}
                  onClick={() => handleBubbleClick([obj[key]] as [any])}
                >
                  {getPrismaType(obj[key])}
                </div>
              </div>
            ) : typeof obj[key] === 'boolean' && tab === "Device" ? (
              <div
                key={key}
                ref={booleanFieldRef} // Attach ref here
                onClick={() => handleTrackerUpdate(obj)}
                className={`inline-block ${variation ? "bg-[#1b202b] cursor-pointer hover:bg-[#222835]" : "bg-[#14181f] hover:bg-[#202631]"} overflow-y-hidden hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}
              >
                {JSON.stringify(obj[key])}
              </div>
            ) : typeof obj[key] === 'boolean' ? (
              <div
                key={key}
                className={`inline-block ${variation ? "bg-[#1b202b] hover:bg-[#222835]" : "bg-[#14181f] hover:bg-[#202631]"} overflow-y-hidden hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}
              >
                {JSON.stringify(obj[key])}
              </div>
            ) : isValidDateString(obj[key]) ? ( // Check if the field is a valid date string
              <div
                key={key}
                onClick={() => {
                  navigator.clipboard.writeText(obj[key]);
                  toast.info('Copied the field into clipboard.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                  });
                }}
                className={`inline-block ${variation ? "bg-[#1b202b] cursor-pointer hover:bg-[#222835]" : "bg-[#14181f] hover:bg-[#202631]"} overflow-y-hidden hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}
              >
                {formatDate(obj[key])} {/* Format the date string */}
              </div>
            ) : (
              <div
                key={key}
                onClick={() => {
                  navigator.clipboard.writeText(obj[key]);
                  toast.info('Copied the field into clipboard.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                  });
                }}
                className={`inline-block ${variation ? "bg-[#1b202b] cursor-pointer hover:bg-[#222835]" : "bg-[#14181f] hover:bg-[#202631]"} overflow-y-hidden hide-scrollbar overflow-x-auto border-[1px] p-[6px] w-[200px] h-[37px] border-t-0 border-l-0 border-[#212633]`}
              >
                {obj[key]}
              </div>
            )}
          </>
        ))}
      </div>
      {isStationDataOpen ? <Stations isMenu={true} externalData={data} /> : ""}
    </>
  );
}
