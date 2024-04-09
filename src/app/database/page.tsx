"use client"
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import 'tailwindcss/tailwind.css';
import { Prisma } from '@prisma/client';
import Stations from './stations'
import webPush from "web-push"

type Station = Prisma.StationGetPayload<{
  include: {
    devices: true;
  }
}>

export type Models = 'Station' | 'Event' | 'Device'
const tabs: Models[] = ['Station', 'Event', 'Device'];

function getFields(type: 'Station' | 'Event' | 'Device') {
  switch (type) {
    case 'Station': return Object.keys(Prisma.StationScalarFieldEnum)
    case 'Device': return Object.keys(Prisma.UsbDeviceScalarFieldEnum)
    case 'Event': return Object.keys(Prisma.EventScalarFieldEnum)
  }
}
   
const App = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchText, setSearchText] = useState<string>('')
  const [searchField, setSearchField] = useState<string>('id')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const removeSubscription = (subscription: PushSubscription) => {
    fetch('/api/subscription/remove', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ subscription }),
    })
       .then(response => response.json())
       .then(data => {
         console.log('Subscription removed successfully:', data);
         setSubscription(null);
       })
       .catch(error => {
         console.error('Error removing subscription:', error);
       });
   };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          navigator.serviceWorker.ready
            .then((registration) => registration.pushManager.subscribe({ userVisibleOnly: true }))
            .then((subscription) => {
              setSubscription(subscription);
            })
            .catch((err) => console.error('Failed to subscribe:', err));
        } else {
          console.log('Permission denied or not supported');
          if (subscription) {
            removeSubscription(subscription);
          }
        }
      });
    } else {
      console.log('Push Notifications are not supported in this browser');
    }
  }, []);



  useEffect(() => {
    if (subscription) {
      fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Subscription sent successfully:', data);
        })
        .catch(error => {
          console.error('Error saving subscription:', error);
        });
    }
  }, [subscription]);
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
            {getFields(activeTab).map((key, index) => (
              <option value={key} key={index} className='bg-[#1d2330]'>{key}</option>
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
        <Stations activeTab={activeTab} searchText={searchText} searchField={searchField} isMenu={false} />
      </div>
    </div>
  );
};

export default App;
