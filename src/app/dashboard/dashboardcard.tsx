"use client"
import Image from "next/image"
import { Status } from "@prisma/client";
import { toast } from "react-toastify"
import { useRouter } from "next/navigation";

export interface DashboardCardProps {
    id: string;
    stationName: string;  
    status: Status;
}

const copylink = (id: string) => {
  navigator.clipboard.writeText(id)
  toast('Copied to clipboard!📋', { hideProgressBar: false, autoClose: 2000, type: 'info' });
}

export default function DashboardCard({id, stationName, status}: DashboardCardProps) {
  const router = useRouter();

  return(
        <div className="bg-white leading-loose rounded-3xl shadow-lg p-10 h-60 sm:w-60 xs:w-near-screen">
            <h3 className="text-center text-3xl font-bold text-slate-500 rounded-xl p-2 cursor-pointer" onClick={() => router.push("station/" + id)}>{stationName}</h3>
            <div className="p-4 font-semibold text-slate-400 text-center m-auto text-base">
              <Image width={25} height={25} className='inline select-none' src={'/identification_icon.svg'} alt={'identification_icon'} />
              <p>ID:
                <button className="border text-sm p-1 rounded-xl ml-2 my-1" onClick={() => copylink(id)}>
                  Copy
                </button>
              </p>
              <Image width={25} height={25} className='inline select-none' src={'/status_icon.svg'} alt={'identification_icon'} />
              <p>Status: {status}</p>
            </div>
          </div>
    )
}