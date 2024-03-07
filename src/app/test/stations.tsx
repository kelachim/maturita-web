import { Station } from "@prisma/client";
import Image from "next/image";
import Entry from "./entry";

export default function Stations({ data, isLoading, error, isMenu }: any) {
 if (error) {
    return <div className='text-white'> Failed to load! ❌ </div>;
 }
 if (isLoading) return (
    <div className='w-full absolute left-0 top-0 flex h-screen justify-center items-center'>
      <Image alt={"loading..."} src={"/rings.svg"} className='' width={100} height={100} />
    </div>
 );
 return (
    <div className={`overflow-x-auto w-full hide-scrollbar ${isMenu ? "bg-[#1a1f2b] overflow-y-hidden p-1" : "bg-transparent"}`}>
      <div className={`!mt-0 text-lg text-neutral-100 ${isMenu ? "bg-[#1f2634]" : "bg-[#0d1016]"} whitespace-nowrap inline-flex overflow-hidden`}>
        {Object.keys(data && data[0] ? data[0] : {}).map(key => (
          <div className="flex-none border-[1px] border-l-0 p-1 font-semibold text-sm min-w-[200px] border-t-0 border-[#212633]" key={key}>{key}</div>
        ))}
      </div>
      {data.map((station: Station) => (
        <Entry
          obj={station}
          variation={isMenu}
        />
      ))}
    </div>
 );
}
