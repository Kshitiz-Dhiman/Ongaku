import React from 'react'
import { Skeleton } from './ui/skeleton'
const LyricsSkeleton = () => {
    return (
        <div>
            <p className='text-[22px] w-full font-bold text-gray-400 text-center flex  mb-2 whitespace-pre-line flex-col gap-7 items-center justify-center h-[400px] md:h-[560px]'>
                <Skeleton className="h-4 bg-[#262626] w-1/4" />
                <Skeleton className="h-4 bg-[#262626] w-2/4" />
                <Skeleton className="h-4 bg-[#262626] w-3/4" />
                <Skeleton className="h-4 bg-[#262626] w-2/4" />
                <Skeleton className="h-4 bg-[#262626] w-3/4" />
                <Skeleton className="h-4 bg-[#262626] w-3/4" />
                <Skeleton className="h-4 bg-[#262626] w-2/4" />
            </p>
        </div>
    )
}

export default LyricsSkeleton
