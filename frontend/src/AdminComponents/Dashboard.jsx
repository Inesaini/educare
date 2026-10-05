import React from 'react'
import Admin from '../Admin'
import SideBar from './SideBar'

const Dashboard = () => {
  return (
    <div className="relative flex bg-[#EFEFEF]">
      <SideBar />
      <div className="flex flex-col w-full">
        <div className="flex h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1]">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold">
            Medical team
          </h1>
        </div>

        
      </div>
    </div>
  )
}

export default Dashboard
