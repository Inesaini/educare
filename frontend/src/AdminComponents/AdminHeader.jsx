import React from 'react'
import { FaUser } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const AdminHeader = ({title}) => {
  return (
    <div>
      <div className='fixed top-0  w-full bg-[#FFFEFE] shadow-md flex justify-between items-center px-4 md:px-12 bg-[#FFFEFE]  w-full h[40px] md:h-[60px]'>
          <h1 className='text-l md:text-2xl font-bold    '>{title}</h1>
        <div className='flex justify-center items-center gap-2'>
          <div className='bg-[#F4A261] p-2 rounded-full'>
            <FaUser  className='text-[12px] md:text-l' />
          </div>
          <button>
          <IoIosArrowDown />
          </button>
          </div>
      </div>
    </div>
  )
}

export default AdminHeader
