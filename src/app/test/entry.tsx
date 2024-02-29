import { Prisma } from "@prisma/client"; 

//@ts-ignore
export default function Entry({ obj }) {
  return (
    <div className="!m-0 w-full text-neutral-100 whitespace-nowrap">
      {Object.keys(obj).map((key) => (
        <>
        {
          Array.isArray(obj[key]) ? 
          <div key={key} className="inline-block overflow-y-hidden overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {obj[key].length}
          </div>
          : Object.prototype.toString.call(obj[key]) === '[object Object]' ?
          <div key={key} className="inline-block overflow-y-hidden overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {obj[key].id}
          </div>
          : <div key={key} className="inline-block hide-scrollbar overflow-y-hidden overflow-x-auto border-[1px] p-[6px] w-[200px] border-t-0 border-l-0 border-[#212633]">
            {obj[key]}
          </div>
        }
        </>
      ))}
    </div>
  );
}