import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { MdLibraryMusic } from "react-icons/md";
import { Link } from 'react-router-dom';
import { Input } from "./ui/input";
import { Music } from "lucide-react"
const NavBar = () => {
    return (
        <div className='fixed bg-[#0a1113] w-full h-[12vh] flex justify-between items-center px-12 z-[100]'>
            <div className='flex items-center justify-center gap-2'>
                <Music size={34} color='#f2371d' strokeWidth={4} className='mt-2' />
                <h1 className='text-3xl font-bold'> Ongaku</h1>
            </div>
            <div className="relative w-1/3 flex items-center">
                <FiSearch className="absolute left-3 text-gray-400 w-5 h-5" />
                <Input
                    className='font-bold w-full bg-[#080c10] outline-none border-none text-white pl-10 py-7 rounded-2xl'
                    placeholder='Search for music , playlist or albums'
                />
            </div>
            <div className='flex gap-4'>
                <Link to='/'>
                    <GoHomeFill size={30} />
                </Link>
                <Link to='/search'>
                    <FiSearch size={30} />
                </Link>
                <Link to='/library'>
                    <MdLibraryMusic size={30} />
                </Link>
            </div>
        </div>
    )
}

export default NavBar
