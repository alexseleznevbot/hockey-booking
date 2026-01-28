import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Bell, Plus, Trash2, Search, ChevronLeft, ChevronRight, User, Phone, ArrowLeft } from 'lucide-react';

// API Configuration
// ВАЖНО: Вставь свою ссылку /exec между кавычек ниже
const API_URL = 'https://script.google.com/macros/s/AKfycbwp3-LW4GeUVzMO4Bc-Bdca39SUVeRfViNoSVWIRD1Q5Y54T96hIhtxJ58AOnmIhjGlPg/exec';
const ADMIN_SECRET = 'ShsHockey_2026_!Seleznev';

// Brand Logo
const BRAND_LOGO = "data:image/webp;base64,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";

const TRAINER_TELEGRAM = "seleznev_88";

// API Functions - Исправлено для Mac/iOS и Google CORS
const api = {
  get: async (action, params = {}) => {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    try {
      const response = await fetch(url.toString());
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      return { ok: false, error: error.message };
    }
  },

  post: async (action, data = {}) => {
    try {
      // Режим no-cors позволяет отправить данные без ошибок безопасности
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...data })
      });
      // В no-cors мы не видим ответа, поэтому всегда возвращаем ok
      return { ok: true };
    } catch (error) {
      console.error('API POST error:', error);
      return { ok: false, error: error.message };
    }
  }
};

const BookingSystem = () => {
  const [view, setView] = useState('select');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hockeySlots, setHockeySlots] = useState([]);
  const [hockeyBookings, setHockeyBookings] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('full');
  
  const [clientForm, setClientForm] = useState({ name: '', phone: '', telegram: '', comment: '' });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [clientSelectedDate, setClientSelectedDate] = useState(null);
  const [clientMonth, setClientMonth] = useState(new Date());
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myBookingsPhone, setMyBookingsPhone] = useState('');

  const timeTemplates = {
    full: { name: 'Полный день', times: ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'] },
    morning: { name: 'Утро', times: ['09:00', '10:15', '11:30', '12:45'] },
    afternoon: { name: 'День', times: ['14:00', '15:15', '16:30', '17:45'] },
    evening: { name: 'Вечер', times: ['19:00', '20:15', '21:30'] }
  };

  const loadSlots = async () => {
    setLoading(true);
    const result = await api.get('getSlots');
    if (result.ok) setHockeySlots(result.slots || []);
    setLoading(false);
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_SECRET) {
      setIsAdminAuth(true);
      setView('admin');
    } else {
      alert('Неверный пароль');
    }
  };

  const addSlotsFromCalendar = async () => {
    if (selectedDates.length === 0) return alert('Выберите даты');
    const times = timeTemplates[selectedTemplate].times;
    const slotsToAdd = [];
    selectedDates.forEach(date => {
      times.forEach(time => {
        slotsToAdd.push({ date, time, id: `${date}-${time}-${Date.now()}` });
      });
    });

    setLoading(true);
    const result = await api.post('adminAddSlots', { adminSecret: ADMIN_SECRET, slots: slotsToAdd });
    if (result.ok) {
      alert('Запрос на добавление отправлен! Проверьте таблицу через 10 сек.');
      setSelectedDates([]);
      setTimeout(loadSlots, 3000);
    }
    setLoading(false);
  };

  const submitBooking = async () => {
    if (!clientForm.name || !clientForm.phone || selectedSlots.length === 0) return alert('Заполните данные');
    setLoading(true);
    const result = await api.post('createBooking', {
      slotIds: selectedSlots,
      ...clientForm
    });
    if (result.ok) {
      setBookingSuccess(true);
      setSelectedSlots([]);
      setTimeout(loadSlots, 2000);
    }
    setLoading(false);
  };

  // Вспомогательные функции для календаря
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { daysInMonth, startingDayOfWeek: firstDay === 0 ? 6 : firstDay - 1 };
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => { loadSlots(); }, []);

  // ========== ЭКРАН ВЫБОРА ==========
  if (view === 'select') {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
        <img src={BRAND_LOGO} alt="Logo" className="w-32 h-32 mb-6 object-contain" />
        <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-tighter">Hockey Training</h1>
        <button onClick={() => setView('client')} className="w-full max-w-xs bg-black text-white p-5 rounded-2xl mb-4 font-bold shadow-xl">🏒 ЗАПИСАТЬСЯ</button>
        <button onClick={() => setView('admin-login')} className="text-gray-400 text-sm underline">Вход для тренера</button>
      </div>
    );
  }

  // ========== ВХОД АДМИНА ==========
  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border">
          <h2 className="text-2xl font-bold mb-6 text-center">Доступ ограничен</h2>
          <input type="password" placeholder="Пароль" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border rounded-xl mb-4" />
          <button onClick={handleAdminLogin} className="w-full bg-black text-white p-4 rounded-xl font-bold mb-2">Войти</button>
          <button onClick={() => setView('select')} className="w-full text-gray-500 text-sm">Назад</button>
        </div>
      </div>
    );
  }

  // ========== КЛИЕНТСКИЙ ИНТЕРФЕЙС ==========
  if (view === 'client') {
    if (bookingSuccess) {
      return (
        <div className="min-h-screen p-6 flex items-center justify-center text-center">
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Заявка принята!</h2>
            <p className="text-gray-500 mb-8">Тренер свяжется с вами для подтверждения.</p>
            <button onClick={() => {setBookingSuccess(false); setView('select');}} className="bg-black text-white px-8 py-3 rounded-full">На главную</button>
          </div>
        </div>
      );
    }

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(clientMonth);
    const availableDates = [...new Set(hockeySlots.filter(s => s.status === 'available').map(s => s.date))];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-md mx-auto p-4">
          <button onClick={() => setView('select')} className="mb-6 flex items-center gap-2 text-gray-500"><ArrowLeft size={18}/> Назад</button>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border mb-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth()-1))}><ChevronLeft/></button>
              <h3 className="font-bold text-lg">{monthNames[clientMonth.getMonth()]} {clientMonth.getFullYear()}</h3>
              <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth()+1))}><ChevronRight/></button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {dayNames.map(d => <div key={d} className="text-xs text-gray-400 font-medium">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {[...Array(startingDayOfWeek)].map((_, i) => <div key={i}/>)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dStr = `${clientMonth.getFullYear()}-${String(clientMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const hasSlots = availableDates.includes(dStr);
                return (
                  <button 
                    key={day} 
                    onClick={() => setClientSelectedDate(dStr)}
                    className={`h-10 rounded-xl text-sm font-bold transition-all ${clientSelectedDate === dStr ? 'bg-black text-white' : hasSlots ? 'bg-green-100 text-green-700' : 'text-gray-300'}`}
                  >{day}</button>
                );
              })}
            </div>
          </div>

          {clientSelectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="font-bold px-2">Доступное время:</h4>
              <div className="grid grid-cols-3 gap-2">
                {hockeySlots.filter(s => s.date === clientSelectedDate && s.status === 'available').map(slot => (
                  <button 
                    key={slot.id}
                    onClick={() => setSelectedSlots(prev => prev.includes(slot.id) ? prev.filter(id => id !== slot.id) : [...prev, slot.id])}
                    className={`p-3 rounded-2xl border-2 font-bold text-sm ${selectedSlots.includes(slot.id) ? 'border-black bg-black text-white' : 'bg-white border-transparent'}`}
                  >{slot.time}</button>
                ))}
              </div>
            </div>
          )}

          {selectedSlots.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-3xl border shadow-lg space-y-4">
               <input type="text" placeholder="Ваше имя" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" />
               <input type="tel" placeholder="Номер телефона" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black" />
               <button onClick={submitBooking} disabled={loading} className="w-full bg-black text-white p-5 rounded-2xl font-bold text-lg">{loading ? 'ОТПРАВКА...' : 'ЗАПИСАТЬСЯ'}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== ПАНЕЛЬ ТРЕНЕРА ==========
  if (isAdminAuth && view === 'admin') {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
            <h1 className="font-black text-xl">АДМИН-ПАНЕЛЬ</h1>
            <button onClick={() => setView('select')} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-bold">Выйти</button>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Добавить новые слоты</h2>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {Object.entries(timeTemplates).map(([key, t]) => (
                <button key={key} onClick={() => setSelectedTemplate(key)} className={`p-2 rounded-xl text-xs font-bold border-2 ${selectedTemplate === key ? 'border-black bg-black text-white' : 'border-gray-100'}`}>{t.name}</button>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6 border-t pt-4">
              {[...Array(startingDayOfWeek)].map((_, i) => <div key={i}/>)}
              {[...Array(daysInMonth)].map((_, i) => {
                const dStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedDates(prev => prev.includes(dStr) ? prev.filter(d => d !== dStr) : [...prev, dStr])}
                    className={`h-10 rounded-lg text-sm font-bold ${selectedDates.includes(dStr) ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}
                  >{i+1}</button>
                );
              })}
            </div>
            
            <button onClick={addSlotsFromCalendar} className="w-full bg-black text-white p-4 rounded-2xl font-bold shadow-lg">ДОБАВИТЬ СЛОТЫ</button>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <h2 className="font-bold">Текущие слоты ({hockeySlots.length})</h2>
               <button onClick={loadSlots} className="text-sm text-blue-600 font-bold">Обновить</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {hockeySlots.map(slot => (
                <div key={slot.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                  <div>
                    <div className="font-bold text-sm">{slot.date}</div>
                    <div className="text-xs text-gray-500">{slot.time}</div>
                  </div>
                  <div className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${slot.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {slot.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BookingSystem;
