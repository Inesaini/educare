import React, { useState } from 'react'
import SideBar from './SideBar';
import DisplayUsers from './DisplayUsers'
import { Search } from 'lucide-react';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className='relative flex bg-[#EFEFEF]'>
      <SideBar />
      <div className="flex flex-col h-full w-full">



        <div className="flex h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1] ml-[100px]">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold ml-[95px]">


            Patients
          </h1>

          {/* Search Bar in Header */}
          <div className="relative w-1/3 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="recherche patients..."
              className="block w-full text-black pl-10 pr-3 py-1 border border-gray-300 rounded-[12px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#679294] focus:border-[#679294] sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <DisplayUsers searchQuery={searchQuery} />
      </div>
    </div>
  )
}
