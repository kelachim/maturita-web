'use client'
import DashboardCard from '@/app/dashboard/dashboardcard';
import Navarea from '@/app/dashboard/navarea';
import useSWR from "swr";
import { Station } from "@prisma/client";
import { useState } from 'react';
import Image from "next/image";
import { toast } from "react-toastify";

const fetcher = (url: string) => fetch(url).then(res => res.json());

function Stations() {
  const { data, isLoading, error } = useSWR('/api/stations', fetcher)
  
  if (error) {
    toast('Failed to load ❌', { hideProgressBar: false, autoClose: 2000, type: 'error' })
    return <div> Failed to load! </div>
  }
  if (isLoading) return <div><Image alt={"loading..."} src={"/rings.svg"} width={100} height={100} /></div>

  return (
    <>
      {data.stations.map((station: Station) => (
        <DashboardCard 
          key={station.id}
          id={station.id}
          stationName={station.name}
          status={station.status}
        />
      ))}
    </>
  )
}

export default function Dashboard() {

  let [activeBtn, setActiveBtn] = useState(false);

  return (
    <>
      <div className="flex align-center justify-center h-screen min-w-full bg-gradient-to-r from-slate-300 to-zinc-100 p-4">
        <Navarea activeBtn={activeBtn} setActiveBtn={setActiveBtn}/>
        <div className='flex flex-wrap justify-center items-end gap-2 sm:flex-row xs:flex-col my-48'>
          <Stations />
        </div>
      </div>
    </>
  )
}
