import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

const calendarStyles = `
  .react-calendar {
    width: 100% !important;
    max-width: none !important;
  }
  .react-calendar__tile--active {
    background: #10b981 !important;
    color: white !important;
  }
  .react-calendar__tile--active:hover,
  .react-calendar__tile--active:focus {
    background: #679294 !important;
  }
  .react-calendar__tile:hover {
    background: #F4A261 !important;
  }
  .react-calendar__tile--now {
    background: #6F8286 !important;
  }
  .react-calendar__tile--weekend {
    background-color: #f0f0f0;
    color: #999;
  }
  .react-calendar__tile--weekend:enabled:hover {
    background-color: #e6e6e6;
  }
`;

const CalendarR = ({ rendezVous, onEdit, onDateSelect }) => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});

  useEffect(() => {
    const formattedEvents = {};
    
    rendezVous.forEach(rdv => {
      const dateStr = format(parseISO(rdv.date), 'yyyy-MM-dd');
      if (!formattedEvents[dateStr]) {
        formattedEvents[dateStr] = [];
      }
      
      formattedEvents[dateStr].push({
        id: rdv.id,
        time: rdv.heure,
        title: `${rdv.nom} ${rdv.prenom}`,
        motif: rdv.motif,
        status: rdv.statut,
        originalData: rdv
      });
    });
    
    setEvents(formattedEvents);
  }, [rendezVous]);

  const formatDate = (date) => format(date, 'yyyy-MM-dd');

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      return events[dateStr] ? (
        <div className="absolute top-1 right-1 text-xs">
          {events[dateStr].length > 0 && '•'}
        </div>
      ) : null;
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      const day = date.getDay(); // 0 = dimanche, 6 = samedi
      const classes = [];
      
      if (events[dateStr]) classes.push('bg-blue-50');
      if (day === 5 || day === 6) classes.push('react-calendar__tile--weekend');
      
      return classes.join(' ') + ' relative';
    }
    return '';
  };

  // Fonction pour désactiver les vendredis et samedis
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const day = date.getDay();
      return day === 5 || day === 6; // Désactive vendredi (5) et samedi (6)
    }
    return false;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleDateClick = (date) => {
    const day = date.getDay();
    if (day !== 5 && day !== 6) { // Ne permet le clic que si ce n'est pas vendredi ou samedi
      setDate(date);
      onDateSelect(date);
    }
  };

  return (
    <div className="p-2 w-full">
      <style>{calendarStyles}</style>
      
      <div className="flex w-full gap-4 flex-col md:flex-row">
        <div className="w-full bg-white rounded-lg shadow">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
            className="border rounded-lg p-2 text-lg"
            onClickDay={handleDateClick}
          />
        </div>

        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {format(date, 'EEEE d MMMM yyyy')}
          </h2>

          <div className="space-y-3">
            {events[formatDate(date)]?.length > 0 ? (
              events[formatDate(date)].map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEdit(event.originalData)}
                  className="p-3 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{event.time} - {event.title}</p>
                      <p className="text-sm text-gray-600">{event.motif}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 p-4 text-center">Aucun rendez-vous prévu ce jour</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarR;