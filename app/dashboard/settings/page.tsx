"use client";   // <— add this at the very top

import React from 'react'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const page = () => {
    return (
        <div className='w-full h-full flex items-center justify-between border-t-6 border-l-6 rounded-4xl border-[var(--primary)]'>
            <ThemeSwitcher />
        </div>
    )
}

export default page