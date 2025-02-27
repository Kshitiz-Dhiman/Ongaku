import React from 'react'
import { Skeleton } from './ui/skeleton'
const MusicCardSkeleton = ({ key }) => {
    return (
        <div key={key} className="w-full sm:max-w-[250px] rounded-xl cursor-pointer p-2 md:p-3">
            <div className='relative group aspect-square overflow-hidden rounded-2xl'>
                <Skeleton className="bg-[#080c10] w-full h-full" />
            </div>
            <div className="py-3 md:py-5">
                <h5 className="space-y-1">
                    <Skeleton className="bg-[#080c10] w-3/4 h-4 md:h-5" />
                    <Skeleton className="bg-[#080c10] w-1/2 h-3 md:h-4" />
                </h5>
            </div>
        </div>
    )
}

export default MusicCardSkeleton
