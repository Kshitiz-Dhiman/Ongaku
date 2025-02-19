import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { MdLibraryMusic } from "react-icons/md";
import { Link } from 'react-router-dom';
const NavBar = () => {
    return (
        <div className='fixed bottom-0 px-10 flex justify-between items-center w-full bg-[#202020] p-4'>
            <Link to="/">
                <div className='hover:bg-[#333333] p-3 rounded-xl cursor-pointer flex flex-col gap-2 items-center text-white'>
                    <GoHomeFill size={"30px"} />
                    <h1 className='text-sm'>Home</h1>
                </div>
            </Link>
            <Link to="/search">
                <div className='hover:bg-[#333333] p-3 rounded-xl cursor-pointer flex flex-col gap-2 items-center text-white'>
                    <FiSearch size={"30px"} />
                    <h1 className='text-sm'>Search</h1>
                </div>
            </Link>
            <div className='hover:bg-[#333333] p-3 rounded-xl cursor-pointer flex flex-col gap-2 items-center text-white'>
                <MdLibraryMusic size={"30px"} />
                <h1 className='text-sm'>Library</h1>
            </div>
        </div>
    )
}

export default NavBar
