import React from 'react'
import { Skeleton } from './ui/skeleton'
const LikedSongSkeleton = () => {
    return (
        <div className='flex flex-col gap-10 p-2'>

            {Array.from({ length: 5 }).map((_, i) => {
                return (
                    <div className='flex w-full gap-4 items-center justify-center' key={i}>
                        <Skeleton className="w-12 h-12 bg-[#202020] " />
                        <div className='flex flex-col w-full gap-3'>
                            <Skeleton className="w-3/3 h-4 bg-[#202020]" />
                            <Skeleton className="w-1/3 h-4 bg-[#202020]" />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default LikedSongSkeleton
