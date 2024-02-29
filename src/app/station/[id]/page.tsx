"use client"
import { notFound } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import Modal from "react-modal";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

function StationPanel({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR(`/api/station/${id}`, fetcher);
  const [modalIsOpen, setIsOpen] = useState(false);

  Modal.defaultStyles.overlay = {
    ...(Modal.defaultStyles.overlay || {}),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  };
  
  if (error) return notFound()
  if (isLoading) return <div className="items-center justify-center align-middle flex min-w-full h-screen min-h-screen bg-gradient-to-r from-slate-300 to-zinc-100"><Image alt={"loading..."} src={"/rings.svg"} width={100} height={100} /></div>
  if (data === undefined) return notFound()

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        contentLabel="Usb Modal"
        className="w-full h-full bg-none"
      >
        <div onClick={() => setIsOpen(false)} className="w-full h-full cursor-pointer flex items-center justify-center">
          <div onClick={(e) => e.stopPropagation()} className="w-[34rem] xs:w-[min(34rem,100vw)] h-96 bg-white shadow-2xl cursor-auto rounded-md">
          </div>
        </div>  
      </Modal>
      <div className="flex flex-col w-full md:w-7/12 rounded-2xl overflow-hidden">
        <div className="h-28 bg-white mb-2 relative">
          <div className="text-center flex justify-center items-end h-full py-3 text-slate-500 font-medium text-xl">
            <div className="w-1/3">Number</div>
            <div className="w-1/3">Class</div>
            <div className="w-1/3">Mount</div>
            <div className="absolute top-0 left-0 right-0 flex justify-center p-2 font-semibold text-2xl">
              <div>
                <p className="inline-block pr-4">{data.name}</p>
                <p className="absolute top-0 left-0 px-3 py-1 text-sm">{data.status}  <div className={`inline-block rounded-full w-2 h-2 ${data.status == 'Inactive' ? "bg-red-400" : "bg-green-400"}`}></div></p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  )
}

export default function Panel({ params }: { params: { id: string } }) {
  return (
    <>
      <div className="items-center justify-center flex h-screen min-h-screen bg-gradient-to-r max-w-full from-slate-300 to-zinc-100">
        <StationPanel id={params.id} />
      </div>
    </>
  )
}