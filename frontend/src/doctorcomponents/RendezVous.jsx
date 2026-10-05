import {React , useState} from 'react'
import SideBar from '../medicalcomponents/SideBar'
import RendezVouscomponent from './RendezVouscomponent';
import Demandes from './Demandes';

const RendezVous = () => {
    const [activeTab, setActiveTab] = useState('rendezvous');
  
  return (
    <div className='h-screen flex flex-col items-start  bg-[#EFEFEF] border border-[#CACACA] shadow-md  ml-[150px]'>
    <SideBar />
    <div className='flex flex-col w-full'>

    <div className="flex  h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1]">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold">
            Rendez-vous
          </h1>
        </div>

    </div>
    {/* Tabs */}
    <div className=" z-10 px-8 pt-4 pb-2 flex  ">
          <ul className="flex gap-6 text-[15px] relative">
            <li>
              <button
                onClick={() => setActiveTab('rendezvous')}
                className={`transition-all duration-300 pb-2 border-b-2 ${activeTab === 'rendezvous' ? 'border-[#F4A261] font-semibold' : 'border-transparent hover:border-[#F4A261]'}`}
              >
                Rendez-vous
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('demandes')}
                className={`transition-all duration-300 pb-2 border-b-2 ${activeTab === 'demandes' ? 'border-[#F4A261] font-semibold' : 'border-transparent hover:border-[#F4A261]'}`}
              >
                Demandes
              </button>
            </li>
          </ul>
          <div className="h-[1.5px]   bg-[rgba(146,154,155,0.35)] mt-[-2px]"></div>
        </div>

          <div className="flex-1 transition-all overflow-y-auto px-8  w-full">
          
              

              {activeTab === 'rendezvous' && (
                <div className="p-4 bg-white rounded-[20px] w-full mb-[20px]  ">
                    <RendezVouscomponent/>
                </div>
              )}

              {activeTab === 'demandes' && (
                <div className="p-4  rounded-[20px]">
                  <Demandes/>
                </div>
              )}
        
        </div>  



    
</div>
  )
}

export default RendezVous
