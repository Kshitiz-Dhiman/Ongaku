import React from 'react'
import { Skeleton } from './ui/skeleton'

const AlbumsCardSkeleton = ({ key }) => {
    return (
        <div key={key} className="w-full max-w-sm">
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-[#202020]">
                <div className="relative">
                    <Skeleton className="w-15 h-15 sm:w-15 sm:h-15 rounded-xl bg-[#262626]" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 bg-[#262626] w-3/4" />
                </div>
            </div>
        </div>
    )
}

export default AlbumsCardSkeleton
