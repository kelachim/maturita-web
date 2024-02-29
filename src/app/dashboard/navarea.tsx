import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

interface NavAreaProps{
    activeBtn: boolean,
    setActiveBtn: Dispatch<SetStateAction<boolean>>
}

export default function Navarea({activeBtn, setActiveBtn}: NavAreaProps) {

    return (
        <div className="m-auto absolute p-6 text-slate-500">
            <div className='max-w-md mx-auto'>
                <div className="relative flex items-center w-full h-12 rounded-lg shadow-lg bg-white overflow-hidden">
                    <div className="grid place-items-center h-full w-12 text-gray-300">
                        <Image width={25} height={25} className='inline' src={'/search_icon.svg'} alt={'identification_icon'} />
                    </div>
                    <input
                        className="peer h-full w-full outline-none text-sm text-slate-500 placeholder:italic pr-2"
                        type="text"
                        id="search"
                        placeholder="Search something.." 
                    />
                </div>
            </div>
            <div className="my-3 inline-block py-4 px-8 shadow-lg bg-white rounded-2xl m-5" onClick={() => setActiveBtn(true)}>
                <h1 className='text-lg'>Trackers</h1>
            </div>
            <div className="my-3 inline-block py-4 px-8 shadow-lg bg-white rounded-2xl m-5" onClick={() => setActiveBtn(false)}>
                <h1 className='text-lg'>Stations</h1>
            </div>
        </div>
    )
}