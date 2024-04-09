"use client"

import Image from "next/image"
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import 'tailwindcss/tailwind.css';
import type { Status } from '@prisma/client';
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { cs } from "date-fns/locale";

const fetcher = (url: string) =>
  fetch(url, {
    method: 'GET',
  }).then((res) => res.json());

type Classroom = {
  stations: {
    id: string;
    name: string;
    status: Status;
    classroomId: string | null;
  }[];
} & {
  id: string;
  name: string;
};

const data: Classroom[] = [
  {
    id: "classroom1",
    name: "Classroom A",
    stations: [
      {
        id: "station1",
        name: "Station 1",
        status: "Active" as Status,
        classroomId: "classroom1",
      },
      {
        id: "station2",
        name: "Station 2",
        status: "Inactive" as Status,
        classroomId: "classroom1",
      },
      {
        id: "station3",
        name: "Station 3",
        status: "Active" as Status,
        classroomId: "classroom1",
      },
    ],
  },
  {
    id: "classroom2",
    name: "Classroom B",
    stations: [
      {
        id: "station4",
        name: "Station 4",
        status: "Active" as Status,
        classroomId: "classroom2",
      },
      {
        id: "station5",
        name: "Station 5",
        status: "Inactive" as Status,
        classroomId: "classroom2",
      },
      {
        id: "station6",
        name: "Station 6",
        status: "Active" as Status,
        classroomId: "classroom2",
      },
    ],
  },
];

type DeviceResponse = {
  id: string;
  vendor_id: string;
  product_id: string;
  files: string[];
  description: string | null;
  serial_number: string | null;
  events: {
    userId: string;
    variation: string;
    createdAt: Date;
  }[];
};

const App = () => {
  const [filename, setFilename] = useState("");
  const { data: deviceData, error } = useSWR(
    filename ? `/api/filesearch?filename=${filename}` : null,
    fetcher
  );
  console.log(deviceData)

  return (
    <div className="h-screen text-2xl bg-[#131720] font-extralight text-white">
      <div className="flex items-center justify-between p-3 bg-[#0d1016] border-b-[#2d3547] border-b-1 text-white flex-col sm:flex-row">
        <h1 className="text-xl text-slate-500">Usb Guard</h1>
      </div>
      <div className='flex m-auto lg:w-2/3 flex-col gap-20 p-8 font-medium'>
        <div>
          <div className='flex'>Classrooms</div>
          <div className="text-sm flex flex-row gap-1 text-slate-400">
            {data.length !== 0 ? (data as Classroom[]).map((classroom) => (
              <div className="p-2 rounded-md border-slate-400 border-1 w-1/4" key={classroom.id}>
                <span className="block">Name: {classroom.name}</span>
                <span className="block">Computer count: {classroom.stations.length}</span>
              </div>
            ))
              :
              "Nothing is here yet"}
          </div>
        </div>
        <div className="flex gap-5 flex-col">
          <div>
            <span>File search</span>
            <input type="text" placeholder="Put the filename here" onChange={e => setFilename(e.target.value)} className="md:w-full outline-none bg-slate-800 p-1 rounded-md text-sm" />
          </div>
          {deviceData?.firstEvent ? (
            <>
              <div className='flex text-base'>First and Last Event</div>
              <div className="text-sm flex flex-col gap-2 text-slate-400">
                <div>
                  <span className="block">Last seen:</span>
                  <span className="block">User: {deviceData?.firstEvent?.user}</span>
                  <span className="block">Variation: {deviceData?.firstEvent?.variation}</span>
                  <span className="block">Last seen: {format(deviceData?.firstEvent?.createdAt, "'in ' Pp", {locale: cs})}</span>
                </div>
              </div>
            </>
          )
            : deviceData?.message ?
            (
              <div className="text-sm">{deviceData.message}</div>
            )
            :
            (
              <></>
            )}
        </div>
      </div>
    </div >
  );
};

export default App;