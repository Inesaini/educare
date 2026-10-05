import { React, useState } from 'react';
import { IoMdEye } from "react-icons/io";

const RendezvousList = ({ rendezVous }) => {
    const [expandedMotifs, setExpandedMotifs] = useState({});

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800'; 
        switch (status.toLowerCase().trim()) {  // <--- ici
            case 'terminé':
                return 'bg-green-100 text-green-800';
            case 'annulé':
                return 'bg-red-100 text-red-800';
            case 'programmé':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const toggleMotifExpansion = (id) => {
        setExpandedMotifs(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const displayMotif = (motif, id) => {
        const MAX_LENGTH = 25;
        if (motif.length <= MAX_LENGTH || expandedMotifs[id]) {
            return motif;
        }
        return `${motif.substring(0, MAX_LENGTH)}...`;
    };

    return (
        <div className="w-full">
            <div className="overflow-hidden max-h-[350px] overflow-y-auto rounded-lg w-full">
                <table className="w-full overflow-y-auto max-h-[calc(100vh-200px)] divide-y divide-gray-300">
                    <thead>
                        <tr className="bg-white w-full sticky top-0 z-10">
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-500">Nom</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-500">Motif</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-500">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-500">Heure</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-500">Statut</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {rendezVous.map((rdv) => (
                            <tr key={rdv.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">{rdv.nom} {rdv.prenom}</td>
                                <td 
                                    className="px-3 py-4 text-sm cursor-pointer hover:text-[#679294]"
                                    onClick={() => toggleMotifExpansion(rdv.id)}
                                >
                                    {displayMotif(rdv.motif, rdv.id)}
                                    {rdv.motif.length > 25 && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            {expandedMotifs[rdv.id] ? '(réduire)' : '(voir plus)'}
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{formatDate(rdv.date)}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{rdv.heure}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(rdv.status)}`}>
                                        {rdv.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap text-gray-500 px-3 py-4 text-sm">
                                    <button className="hover:text-[#679294]">
                                        <IoMdEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RendezvousList;