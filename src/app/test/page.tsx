"use client"
import React, { useState } from 'react';
import Entry from "./entry"
import useSWR from 'swr';
import Image from 'next/image'
import 'tailwindcss/tailwind.css';
import { Prisma } from '@prisma/client';

type Station = Prisma.StationGetPayload<{
  include: {
    devices: true;
  }
}>

type Models = 'Station' | 'Event' | 'Device'
const tabs: Models[] = ['Station', 'Event', 'Device'];

function getFields(type: 'Station' | 'Event' | 'Device') {
  switch (type){
    case 'Station': return Object.keys(Prisma.StationScalarFieldEnum)
    case 'Device': return Object.keys(Prisma.UsbDeviceScalarFieldEnum)
    case 'Event': return Object.keys(Prisma.EventScalarFieldEnum)
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function Stations({data, isLoading, error} : any) {
  if (error) {
    return <div className='text-white'> Failed to load! ❌ </div>
  }
  if (isLoading) return <div className='w-full absolute left-0 top-0 flex h-screen justify-center items-center'><Image alt={"loading..."} src={"/rings.svg"} className='' width={100} height={100} /></div>
  return (
    <div className='overflow-x-auto w-full hide-scrollbar'>
      <div className="!mt-0 text-lg text-neutral-100 bg-[#0d1016] whitespace-nowrap inline-flex overflow-hidden">
        {Object.keys(data && data[0] ? data[0] : {}).map(key => (
          <div className="flex-none border-[1px] border-l-0 p-1 font-semibold text-sm min-w-[200px] border-t-0 border-[#212633]" key={key}>{key}</div>
        ))}
      </div>
      {data.map((station: Station) => (
          <Entry
            obj={station}
          />
        ))}
    </div>
  )
}

const App = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchText, setSearchText] = useState('')
  const [searchField, setSearchField] = useState('id')

  const { data, error, isLoading } = useSWR(
    `/api/search?text=${searchText}&field=${searchField}&tab=${activeTab}`, 
    fetcher
  )
  return (
       <div className="h-screen bg-[#131720] font-extralight">
           <div className="flex items-center justify-between p-3 bg-[#0d1016] border-b-[#2d3547] border-b-1 text-white flex-col sm:flex-row">
               <h1 className="text-xl text-slate-500">Usb Guard</h1>
               <div className="relative w-full sm:w-3/5 lg:w-1/3">

                <input
                  type="search"
                  onChange={e => setSearchText(e.target.value)} 
                  placeholder="Search..." 
                  className="w-full m-4 sm:m-0 outline-none border-none text-white placeholder-slate-500 bg-[#1d2330] px-4 py-2 border rounded-md focus:outline-none ring-1 ring-[#373f52]" 
                />

                <select
                  onChange={e => setSearchField(e.target.value)}
                  className="absolute right-0 top-0 bottom-0 w-1/4 border-none outline-none ring-none text-slate-500 bg-[#1d2330] rounded-md"
                >
                  {getFields(activeTab).map(key => (
                     <option value={key} className='bg-[#1d2330]'>{key}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="!mt-0 w-full text-neutral-100 bg-[#131720] border-b-[#2d3547] border-b-[1px]">
              {tabs.map(tab => (
                <div 
                  key={tab}
                  className={activeTab === tab ? 'transition-all hover:bg-[#0d1016] active:bg-[#0d1016] active inline-block border-[1px] border-l-0 p-1 px-6 font-medium border-t-0 border-b-0 border-[#212633] select-none' : 'transition-all hover:bg-[#0d1016] active:bg-[#0d1016] inline-block border-[1px] border-l-0 p-1 px-6 font-medium border-t-0 border-b-0 border-[#212633] select-none'}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
           <div className="space-y-4 flex items-center flex-col">
              <Stations data={data} isLoading={isLoading} error={error} />
           </div>
       </div>
   );
};

export default App;
