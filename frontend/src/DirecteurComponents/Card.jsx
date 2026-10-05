import React from 'react'

const Card = ({title , number}) => {
  return (
    <div className='bg-[#E8F4F5] rounded-[10px] pl-4 pr-12  py-2 flex flex-col justify-center gap-2 items-start min-w-[200px] shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]'>
        <h1 className='text-[#2E3D40]/62 font-extrabold'>{title}</h1>
        <h1 className='font-extrabold text-2xl text-[#2E3D40]'>{number}</h1>
      
    </div>
  )
}

export default Card
