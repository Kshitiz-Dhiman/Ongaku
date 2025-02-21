import React from 'react'
import Image from "../assets/download.jpeg"
import { Play } from "lucide-react"
import { trimString } from "../utils/utils"
function MusicCard({ key, song }) {
    // console.log(song);


    return (
        <div className="max-w-[250px] rounded-xl cursor-pointer p-3">
            <div className='overflow-hidden rounded-2xl relative group'>
                <img className="hover:scale-[1.2] hover:transition-all rounded-2xl object-cover h-full w-full" src={song.image[2].link} alt="images lies here" />
                <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 transition-opacity h-full w-full  opacity-0  from-transparent to-black group-hover:bg-gradient-to-b lg:group-hover:flex">
                    <div className='bg-[#202020] p-3 rounded-full hover:scale-[1.2] hover:transition-all active:scale-[1]'>
                        <Play className="text-white" size={30} strokeWidth={3} />
                    </div>
                </div>
            </div>
            <div className="py-5">
                <h5 className="mb-2 text-xl font-bold leading-9 text-white">
                    <h1 className="">{trimString(song?.name, 16)}</h1>
                    <span className="text-[#6e7273] ">{trimString(song.subtitle, 17)}</span>
                </h5>
            </div>
        </div >
    )
}

export default MusicCard
