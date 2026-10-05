import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CiSaveDown2, CiFilter } from "react-icons/ci";
import logoImage from './logo.png';

const TableConsultation = forwardRef(({ consultations = [] }, ref) => {
  const [filteredData, setFilteredData] = useState(consultations);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    mois: '',
    minTotal: '',
    maxTotal: ''
  });

  // Exposition des données via ref
  useImperativeHandle(ref, () => ({
    getFilteredData: () => filteredData,
    getAllData: () => consultations
  }));

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.addImage(logoImage, 'PNG', 160, 10, 30, 15);
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le: ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`, 14, 25);
    doc.setFontSize(18);
    doc.text('Détails des Consultations', 14, 15);

    autoTable(doc, {
      startY: 35,
      head: [['Mois', 'Total', 'Étudiants', 'Enseignants', 'ATS', 'Jour de Pointe']],
      body: filteredData.map(item => [
        item.mois,
        item.total.toString(),
        item.etudiants.toString(),
        item.enseignants?.toString() || '',
        item.ats.toString(),
        item.jourDePointe
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [234, 240, 241], textColor: [100, 100, 100], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save('consultations.pdf');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...consultations];
    
    if (filters.mois) {
      filtered = filtered.filter(item => 
        item.mois.toLowerCase().includes(filters.mois.toLowerCase())
      );
    }
    
    if (filters.minTotal) {
      filtered = filtered.filter(item => item.total >= Number(filters.minTotal));
    }
    
    if (filters.maxTotal) {
      filtered = filtered.filter(item => item.total <= Number(filters.maxTotal));
    }
    
    setFilteredData(filtered);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({ mois: '', minTotal: '', maxTotal: '' });
    setFilteredData(consultations);
    setFilterOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mx-4 my-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-800 text-lg">Détails des Consultations</h2>
        <div className="flex justify-center items-center">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center rounded-lg transition-colors"
          >
            <div className='bg-gray-100 hover:bg-[#CFE3E4] px-2 shadow-l text-[#2E3D40] p-1 rounded'>
              <CiFilter className='text-2xl font-extrabold shadow-xl'/>
            </div>
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 rounded-lg transition-colors"
          >
            <div className='bg-gray-100 px-2 hover:bg-[#CFE3E4] shadow-l text-[#2E3D40] p-1 rounded'>
              <CiSaveDown2 className='text-2xl font-extrabold shadow-xl' />
            </div>
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="absolute right-2 top-16 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10 w-64">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <input
              type="text"
              name="mois"
              value={filters.mois}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Filtrer par mois"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Min</label>
            <input
              type="number"
              name="minTotal"
              value={filters.minTotal}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Total minimum"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Max</label>
            <input
              type="number"
              name="maxTotal"
              value={filters.maxTotal}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Total maximum"
              min="0"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Réinitialiser
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#679294] text-white rounded-md hover:bg-[#5a7e80] text-sm"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      <div className="max-h-[300px]  overflow-y-auto border border-gray-200 rounded-[10px]">
        <table className="min-w-full bg-white">
          <thead className="sticky top-0">
            <tr className="bg-[#EAF0F1] text-gray-600">
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Mois</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Total</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Étudiants</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Enseignants</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">ATS</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Jour de Pointe</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {filteredData.map((consultation, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.mois}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.total}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.etudiants}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.enseignants}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.ats}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm">{consultation.jourDePointe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TableConsultation;