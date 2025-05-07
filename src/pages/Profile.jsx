import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator';
const Profile = () => {

    const [userInfo, setUserInfo] = useState({
        _id: '',
        name: '',
        email: '',
        image: '',
        likedSong: [],
        likedArtist: [],
        likedAlbum: [],
        history: [],
    });



    const getProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            })

            setUserInfo(response.data.user);

        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        getProfile();
    }, []);

    if (!localStorage.getItem("token")) {
        return (
            <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20'>
                <h1 className='
                    text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left
                '>
                    Login Required
                </h1>
            </div>
        )
    }


    return (
        <div className='
            w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-2
'>
            <h1 className='
                text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left

            '>
                Profile
            </h1>
            <div className='w-full bg-[#101010] flex gap-3 items-center rounded-2xl'>
                <img src={userInfo?.image} alt="" className='w-32 h-32 rounded-full p-3' />
                <div className='flex flex-col'>
                    <h1 className='
                        text-xl sm:text-xl  md:text-2xl lg:text-3xl font-bold md:mt-10 text-[#6e7273] text-left
                    '>{userInfo?.name}</h1>
                    <h2 className='
                        text-md sm:text-md  md:text-xl lg:text-2xl font-bold md:mt-10 text-[#6e7273] text-left
                    '>{userInfo?.email}</h2>
                </div>
            </div>
            <div className='flex justify-between items-center gap-4 mt-8 p-6 bg-[#101010] rounded-xl'>
                <div className='flex flex-col items-center text-[#6e7273]'>
                    <span className='text-2xl font-bold'>{userInfo?.likedSong?.length}</span>
                    <span className='text-sm'>Liked Songs</span>
                </div>
                <Separator orientation='vertical' className='h-12 bg-[#6e7273] w-[2px]' />
                <div className='flex flex-col items-center text-[#6e7273]'>
                    <span className='text-2xl font-bold'>{userInfo?.likedArtist?.length}</span>
                    <span className='text-sm'>Liked Artists</span>
                </div>
                <Separator orientation='vertical' className='h-12 bg-[#6e7273] w-[2px]' />
                <div className='flex flex-col items-center text-[#6e7273]'>
                    <span className='text-2xl font-bold'>{userInfo?.likedAlbum?.length}</span>
                    <span className='text-sm'>Liked Albums</span>
                </div>
            </div>
        </div>
    )
}

export default Profile
