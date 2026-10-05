import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CiSaveDown2, CiFilter } from "react-icons/ci";
import logoImage from './logo.png';

const TableMaladies = forwardRef(({ maladies = [] }, ref) => {
  const [filteredMaladies, setFilteredMaladies] = useState(maladies);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    maladie: '',
    casMin: '',
    casMax: '',
    categorie: '',
    malesMin: '',
    malesMax: '',
    femalesMin: '',
    femalesMax: '',
    statut: '',
    picMensuel: '',
    severite: ''
  });

  // Exposition des données via ref
  useImperativeHandle(ref, () => ({
    getFilteredData: () => filteredMaladies,
    getAllData: () => maladies
  }));

  // Calcul des totaux
  const totalCas = filteredMaladies.reduce((sum, item) => sum + item.cas, 0);
  const totalMales = filteredMaladies.reduce((sum, item) => sum + item.males, 0);
  const totalFemales = filteredMaladies.reduce((sum, item) => sum + item.females, 0);
  const mainCategory = filteredMaladies.reduce((acc, item) => {
    acc[item.categorie] = (acc[item.categorie] || 0) + item.cas;
    return acc;
  }, {});
  const topCategory = Object.entries(mainCategory).sort((a, b) => b[1] - a[1])[0] || ['', 0];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.addImage(logoImage, 'PNG', 160, 10, 30, 15);
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le: ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`, 14, 25);
    doc.setFontSize(18);
    doc.text('Détails des Maladies Contagieuses', 14, 15);

    autoTable(doc, {
      startY: 35,
      head: [['Maladie', 'Cas', 'Catégorie', 'Males', 'Females', 'Statut', 'Pic Mensuel', 'Sévérité']],
      body: filteredMaladies.map(item => [
        item.maladie,
        item.cas.toString(),
        item.categorie,
        item.males.toString(),
        item.females.toString(),
        item.statut,
        item.picMensuel,
        item.severite
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [234, 240, 241], textColor: [100, 100, 100], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      body: [
        ['Total des cas', `${totalCas} cas`],
        ['Répartition par genre', `${totalMales} males / ${totalFemales} females`],
        ['Catégorie principale', `${topCategory[0]} (${topCategory[1]} cas)`],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [234, 240, 241] }
    });

    doc.save('maladies_contagieuses.pdf');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...maladies];
    
    if (filters.maladie) {
      filtered = filtered.filter(item => 
        item.maladie.toLowerCase().includes(filters.maladie.toLowerCase())
      );
    }
    
    if (filters.casMin) {
      filtered = filtered.filter(item => item.cas >= Number(filters.casMin));
    }
    
    if (filters.casMax) {
      filtered = filtered.filter(item => item.cas <= Number(filters.casMax));
    }
    
    if (filters.categorie) {
      filtered = filtered.filter(item => 
        item.categorie.toLowerCase().includes(filters.categorie.toLowerCase())
      );
    }
    
    if (filters.malesMin) {
      filtered = filtered.filter(item => item.males >= Number(filters.malesMin));
    }
    
    if (filters.malesMax) {
      filtered = filtered.filter(item => item.males <= Number(filters.malesMax));
    }
    
    if (filters.femalesMin) {
      filtered = filtered.filter(item => item.females >= Number(filters.femalesMin));
    }
    
    if (filters.femalesMax) {
      filtered = filtered.filter(item => item.females <= Number(filters.femalesMax));
    }
    
    if (filters.statut) {
      filtered = filtered.filter(item => 
        item.statut.toLowerCase().includes(filters.statut.toLowerCase())
      );
    }
    
    if (filters.picMensuel) {
      filtered = filtered.filter(item => 
        item.picMensuel.toLowerCase().includes(filters.picMensuel.toLowerCase())
      );
    }
    
    if (filters.severite) {
      filtered = filtered.filter(item => 
        item.severite.toLowerCase().includes(filters.severite.toLowerCase())
      );
    }
    
    setFilteredMaladies(filtered);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      maladie: '',
      casMin: '',
      casMax: '',
      categorie: '',
      malesMin: '',
      malesMax: '',
      femalesMin: '',
      femalesMax: '',
      statut: '',
      picMensuel: '',
      severite: ''
    });
    setFilteredMaladies(maladies);
    setFilterOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mx-4 my-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-800 text-lg">Détails des Maladies Contagieuses</h2>
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
        <div className="absolute right-2 top-16 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10 w-80 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maladie</label>
              <input
                type="text"
                name="maladie"
                value={filters.maladie}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Filtrer par maladie"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cas Min</label>
              <input
                type="number"
                name="casMin"
                value={filters.casMin}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Cas minimum"
                min="0"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cas Max</label>
              <input
                type="number"
                name="casMax"
                value={filters.casMax}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Cas maximum"
                min="0"
              />
            </div>

            <div className="mb-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                name="categorie"
                value={filters.categorie}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Filtrer par catégorie"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Males Min</label>
              <input
                type="number"
                name="malesMin"
                value={filters.malesMin}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Males minimum"
                min="0"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Males Max</label>
              <input
                type="number"
                name="malesMax"
                value={filters.malesMax}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Males maximum"
                min="0"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Females Min</label>
              <input
                type="number"
                name="femalesMin"
                value={filters.femalesMin}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Females minimum"
                min="0"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Females Max</label>
              <input
                type="number"
                name="femalesMax"
                value={filters.femalesMax}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Females maximum"
                min="0"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <input
                type="text"
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Filtrer par statut"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pic Mensuel</label>
              <input
                type="text"
                name="picMensuel"
                value={filters.picMensuel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Filtrer par pic"
              />
            </div>

            <div className="mb-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sévérité</label>
              <input
                type="text"
                name="severite"
                value={filters.severite}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Filtrer par sévérité"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
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

      <div className="max-h-[300px] min-h-[250px] overflow-y-auto border border-gray-200 rounded-[10px]">
        <table className="min-w-full bg-white">
          <thead className="sticky top-0">
            <tr className="bg-[#EAF0F1] text-gray-600">
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Maladie</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Cas</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Males</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Females</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Statut</th>
              <th className="py-3 px-4 text-left border-b border-gray-200 text-sm font-medium">Pic Mensuel</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {filteredMaladies.length > 0 ? (
              filteredMaladies.map((maladie, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{maladie.maladie}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{maladie.cas}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{maladie.males}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{maladie.females}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{maladie.statut}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-sm">{maladie.picMensuel}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  Aucune maladie trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredMaladies.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-700">Total des cas</div>
            <div className="text-lg font-bold">{totalCas} cas</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-700">Répartition par genre</div>
            <div className="text-lg font-bold">{totalMales} males / {totalFemales} females</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-700">Catégorie principale</div>
            <div className="text-lg font-bold">{topCategory[0]} ({topCategory[1]} cas)</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TableMaladies;