import React, { useState, useRef, useEffect } from 'react';
import SidebarDirecteur from './SidebarDirecteur';
import Stat from './Stat';
import TableConsultation from './TableConsultation';
import TableMaladies from './TableMaladies';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from './logo.png'; 
import LineChartComponent from '../ChartsComponents/LineChart';
import PieChart from '../ChartsComponents/PieChart';
import StackedBarComponent from '../ChartsComponents/stackedBar';
import { API_URL } from "../api.js";

// Année universitaire en cours (elle commence en septembre), ex. "2026-2027"
const today = new Date();
const academicStartYear =
  today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
const currentAcademicYear = `${academicStartYear}-${academicStartYear + 1}`;

const Directeur = () => {
  const [activeTab, setActiveTab] = useState('consultations');
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [consultationsData, setConsultationsData] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [maladiesData, setMaladiesData] = useState([]);
  const [loadingMaladies, setLoadingMaladies] = useState(false);

  const tableConsultationRef = useRef();
  const tableMaladiesRef = useRef();
  const secondYear = selectedYear.split('-')[1];

  const api = `${API_URL}/directeur/getConsultationsParMois/${secondYear}`;
  const apiUrl = `${API_URL}/directeur/getConsultationsParCategorieAnnuelle/${secondYear}`;
  const title = "Répartition des patients par mois";
  const apiCont = `${API_URL}/directeur/getMaladiesParMois/${secondYear}/contagieuse`;
  const apiCont2 = `${API_URL}/directeur/getStatistiquesMaladiesParTypeEtAnnee/contagieuse/${secondYear}`;
  const apich2 = ``;
  const apiCh = `${API_URL}/directeur/getMaladiesParMois/${secondYear}/cronique`;



  const generateYearPairs = () => {
    const years = [];
    for (let i = 2014; i <= academicStartYear; i++) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };
  const yearPairs = generateYearPairs();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoadingConsultations(true);
        const response = await fetch(`${API_URL}/directeur/consultation_stats/${secondYear}`);
        const data = await response.json();
        const formatted = data.map(c => ({
          mois: c.mois,
          total: c.total,
          etudiants: parseInt(c.etudiants),
          enseignants: parseInt(c.enseignants),
          ats: parseInt(c.ats),
          jourDePointe: c.jourDePointe
        }));
        setConsultationsData(formatted);
      } catch (error) {
        console.error('Erreur de chargement des consultations:', error);
      } finally {
        setLoadingConsultations(false);
      }
    };
    fetchConsultations();
  }, [selectedYear]);

  useEffect(() => {
    const fetchMaladies = async () => {
      if (activeTab !== 'contagieuses' && activeTab !== 'chroniques') return;
      const type = activeTab === 'contagieuses' ? 'Contagieuse' : 'cronique';
      const url = `${API_URL}/directeur/getStatsMaladies/${type}/${secondYear}`;

      try {
        setLoadingMaladies(true);
        const response = await fetch(url);
        const data = await response.json();
        const formatted = data.map(m => ({
          maladie: m.maladie,
          cas: parseInt(m.nombre_de_cas),
          categorie: '', // à remplir si dispo
          males: m.repartition_sexe?.Male || 0,
          females: m.repartition_sexe?.Female || 0,
          statut: '', // à remplir si dispo
          picMensuel: m.pic_mensuel,
          severite: '', // à remplir si dispo
        }));
        setMaladiesData(formatted);
      } catch (error) {
        console.error('Erreur de chargement des maladies:', error);
      } finally {
        setLoadingMaladies(false);
      }
    };
    fetchMaladies();
  }, [activeTab, selectedYear]);

  const handleExportAll = () => {
    const doc = new jsPDF();
    doc.addImage(logoImage, 'PNG', 160, 10, 30, 15);
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le: ${now.toLocaleDateString()} à ${now.toLocaleTimeString()}`, 14, 25);
    doc.setFontSize(18);
    doc.text(`Rapport Complet - Statistiques Médicales (${selectedYear})`, 14, 15);

    const consultations = tableConsultationRef.current?.getFilteredData() || consultationsData;
    const maladies = tableMaladiesRef.current?.getFilteredData() || maladiesData;

    doc.setFontSize(16);
    doc.text('Détails des Consultations', 14, 35);
    autoTable(doc, {
      startY: 45,
      head: [['Mois', 'Total', 'Étudiants', 'Enseignants', 'ATS', 'Jour de Pointe']],
      body: consultations.map(c => [
        c.mois,
        c.total.toString(),
        c.etudiants.toString(),
        c.enseignants?.toString() || '',
        c.ats.toString(),
        c.jourDePointe
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [234, 240, 241] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.setFontSize(16);
    doc.text('Détails des Maladies', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Maladie', 'Cas', 'Catégorie', 'Males', 'Females', 'Statut', 'Pic Mensuel', 'Sévérité']],
      body: maladies.map(m => [
        m.maladie,
        m.cas.toString(),
        m.categorie,
        m.males.toString(),
        m.females.toString(),
        m.statut,
        m.picMensuel,
        m.severite
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [234, 240, 241] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const totalConsultations = consultations.reduce((sum, c) => sum + c.total, 0);
    const totalMaladies = maladies.reduce((sum, m) => sum + m.cas, 0);
    const totalMales = maladies.reduce((sum, m) => sum + m.males, 0);
    const totalFemales = maladies.reduce((sum, m) => sum + m.females, 0);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      body: [
        ['Total consultations', totalConsultations],
        ['Total maladies', totalMaladies],
        ['Répartition par genre', `${totalMales} males / ${totalFemales} females`],
        ['Dernière mise à jour', now.toLocaleString()]
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [234, 240, 241] }
    });

    doc.save(`rapport_medical_complet_${selectedYear}.pdf`);
  };

  return (
    <div className="relative flex bg-[#EFEFEF]">
      <SidebarDirecteur />
      <div className="flex flex-col w-full">
        <div className="flex h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1] sticky top-0">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold">
            Statistiques
          </h1>
        </div>

        <div className='justify-end flex mt-4 mr-5 gap-4 items-center'>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='shadow-xl cursor-pointer text-[#5D5F60] hover:bg-gray-100 rounded-[10px] px-2 py-1 bg-white'
          >
            {yearPairs.map((year) => (
              <option key={year} value={year}>
                Année {year}
              </option>
            ))}
          </select>
          <button 
            onClick={handleExportAll}
            className='flex cursor-pointer px-4 hover:bg-gray-100 text-[#5D5F60] bg-[#FFFEFE] rounded-[10px] shadow-xl p-1'
          >
            Exporter tout
          </button>
        </div>

        <Stat />

        <div className="flex justify-between border-b border-gray-300 bg-[#EAF0F1] m-2 rounded-[20px] shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]">
          <button
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'consultations' ? 'text-[#679294] border-b-2 rounded-l-[20px] border-[#679294]' : 'text-black hover:text-[#679294]'}`}
            onClick={() => setActiveTab('consultations')}
          >
            Consultations
          </button>
          <button
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'contagieuses' ? 'text-[#679294] border-b-2 border-[#679294]' : 'text-black hover:text-[#679294]'}`}
            onClick={() => setActiveTab('contagieuses')}
          >
            Maladies Contagieuses
          </button>
          <button
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'chroniques' ? 'text-[#679294] border-b-2 rounded-r-[20px] border-[#679294]' : 'text-black hover:text-[#679294]'}`}
            onClick={() => setActiveTab('chroniques')}
          >
            Maladies Chroniques
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'consultations' && (
            loadingConsultations ? (
              <p>Chargement des consultations...</p>
            ) : (
              <div className='w-full'>
                <div className='w-full flex gap-2'>
                <div className='w-1/2'>
                  <LineChartComponent apiUrl={api} title="Consultations par Mois" />
                </div>
                <div className='w-1/2'>
                  <PieChart apiUrl={apiUrl} title={title} />
                </div>
</div>
                <TableConsultation ref={tableConsultationRef} consultations={consultationsData} />
              </div>
            )
          )}

          {(activeTab === 'contagieuses' ) && (
            loadingMaladies ? (
              <p>Chargement des maladies...</p>
            ) : (
              <div className='w-full'>
                <div className='w-full flex gap-2'>
                <div className='w-1/2'>
              <LineChartComponent apiUrl={apiCont} title="Consultations par Mois" />                </div>
              <div className='w-1/2'>
            <StackedBarComponent
              dataUrl={`${API_URL}/directeur/getStatistiquesMaladiesParTypeEtAnnee/contagieuse/${secondYear}`}
              title="Médicaments les plus Prescrits"
            />              
            </div>
            </div>     
            </div> )
          )}
          {(activeTab === 'chroniques' ) && (
            loadingMaladies ? (
              <p>Chargement des maladies...</p>
            ) : (
              <div className='w-full'>
                <div className='w-full flex gap-2'>
                <div className='w-1/2'>
              <LineChartComponent apiUrl={apiCont} title="Consultations par Mois" />                </div>
              <div className='w-1/2'>
            <StackedBarComponent
              dataUrl={`${API_URL}/directeur/getStatistiquesMaladiesParTypeEtAnnee/cronique/${secondYear}`}
              title="Médicaments les plus Prescrits"
            />              
            </div>
            </div>     
            </div> )
          )}

          {(activeTab === 'contagieuses' || activeTab === 'chroniques') && (
            loadingMaladies ? (
              <p>Chargement des maladies...</p>
            ) : (
              <TableMaladies ref={tableMaladiesRef} maladies={maladiesData} />
            )
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Directeur;
