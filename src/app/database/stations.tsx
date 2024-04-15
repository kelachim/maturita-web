import type { Station } from "@prisma/client";
import Image from "next/image";
import Entry from "./entry";
import { useState, Fragment, useEffect } from "react";
import type { Models } from "./page"
//@ts-ignore
import { Menu, Transition } from '@headlessui/react'
import useSWR from "swr";
import Cookies from 'js-cookie';

function removeFields(data: any[], fieldsToRemove: any[]) {
  return data.map((obj: any) => {
    const newObj = { ...obj };
    fieldsToRemove.forEach((field: string | number) => delete newObj[field]);
    return newObj;
  });
}

const fetcher = (url: string, data?: any) =>
  fetch(url, {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json());

const FieldsCheckboxes = ({ fields, activeTab, setFields }: { fields: Fields, activeTab: Models, setFields: (fields: Fields) => void }) => {
  const toggleField = (field: keyof Fields) => {
    const newFields = {
      ...fields,
      [field]: !fields[field],
    };
    Cookies.set(`fields-${activeTab}`, JSON.stringify(newFields));
    const key = `fields-${activeTab as Models}`;
    const storedFields = Cookies.get(key);
    setFields(JSON.parse(storedFields!));
  };

  return (
    <div className="space-y-1">
      {Object.keys(fields).slice(1).map((field) => (
        <Fragment key={field}>
          <div
            className={`flex items-center rounded-md p-2 border-2 ${fields[field as keyof Fields]
                ? 'border-green-500 text-green-500'
                : 'border-white text-white'
              }`}
            onClick={() => toggleField(field as keyof Fields)}
          >
            <span className="text-sm font-medium">{field}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};
function MyDropdown({ fields, activeTab, setFields }: { fields: Fields, activeTab: Models, setFields: (fields: Fields) => void }) {
  return (
    <Menu>
      <Menu.Button className="px-2 relative inline-block text-left peer">+</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="rounded-md absolute right-0 w-56 origin-top-right divide-y divide-gray-100 bg-[#0a0c10] shadow-lg focus:outline-none peer-[-translate-y-full]:translate-y-0">
          <div className="px-1 py-1">
            <FieldsCheckboxes fields={fields} activeTab={activeTab} setFields={setFields} />
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

interface StationsProps {
  searchText?: string;
  searchField?: string;
  activeTab?: Models;
  isMenu: boolean;
  externalData?: any[];
}

interface SearchProps {
  searchText: string;
  searchField: string;
  activeTab: Models;
  fields: Fields;
}

type Fields =
  | Record<"id" | "name" | "devices" | "events", boolean>
  | Record<"id" | "tracked" | "vendor_id" | "product_id" | "files" | "description" | "serial_number" | "event" | "station", boolean>
  | Record<"id" | "user" | "variation" | "tracked" | "station" | "usbdevice" | "createdAt", boolean>

export default function Stations({ searchText, searchField, activeTab, isMenu, externalData }: StationsProps) {
  const fieldsMapping: Record<Models, Fields> = {
    Station: {
      id: true,
      name: false,
      devices: false,
      events: false,
    },
    Device: {
      id: true,
      tracked: false,
      vendor_id: false,
      product_id: false,
      files: false,
      description: false,
      serial_number: false,
      event: false,
      station: false,
    },
    Event: {
      id: true,
      user: false,
      variation: false,
      tracked: false,
      station: false,
      usbdevice: false,
      createdAt: false,
    },
  };

  const [fields, setFields] = useState<Fields>(() => {
    const key = `fields-${activeTab as Models}`;
    const storedFields = Cookies.get(key);
    return storedFields ? JSON.parse(storedFields) : fieldsMapping[activeTab as Models];
  });

  useEffect(() => {
    const key = `fields-${activeTab as Models}`;
    const storedFields = Cookies.get(key);
    setFields(storedFields ? JSON.parse(storedFields) : fieldsMapping[activeTab as Models])
  }, [activeTab]);

  const { data, error, isLoading } = !externalData ? useSWR(['/api/search', { searchText, searchField, activeTab, fields } as SearchProps], ([url, data]) => fetcher(url, data)) : { data: externalData, error: null, isLoading: null }
  if (error) {
    return <div className='text-white'> Failed to load! ❌ </div>;
  }
  if (isLoading) return (
    <div className='w-full absolute left-0 top-0 flex h-screen justify-center items-center'>
      <Image alt={"loading..."} src={"/rings.svg"} className='' width={100} height={100} />
    </div>
  );
  return (
    <div className={`overflow-x-auto w-full hide-scrollbar ${isMenu ? "bg-[#1a1f2b] overflow-y-hidden p-1 sticky" : "min-h-screen bg-transparent"}`}>
      <div className={`!mt-0 text-lg text-neutral-100 ${isMenu ? "bg-[#1f2634]" : "bg-[#0d1016]"} whitespace-nowrap inline-flex overflow-hidden`}>
        {Object.keys(data && data[0] ? data[0] : {}).map(key => (
          <div
            className={`flex-none border-[1px] border-l-0 p-1 font-semibold text-sm border-t-0 border-[#212633] ${key === "+" && !isMenu ? "min-w-[unset] w-auto" : "min-w-[200px]"
              }`}
            key={key}
          >
            {key}
          </div>
        ))}
        {!isMenu && (
          <MyDropdown fields={fields} activeTab={activeTab!} setFields={setFields} />
        )}
      </div>
      {data.map((station: Station) => (
        <Entry
          obj={station}
          variation={isMenu}
          tab={activeTab}
        />
      ))}
    </div>
  );
}