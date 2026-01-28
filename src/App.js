import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Bell, Plus, Trash2, Search, ChevronLeft, ChevronRight, User, Phone, ArrowLeft } from 'lucide-react';

// API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbwxfFPnYvOQcKsmevzV66Ew0dHo40mbH6GegbAc2tlsTye6HVyBtXvSCoUlDcHR58p_6A/exec';
const ADMIN_SECRET = 'ShsHockey_2026_!Seleznev';

// Brand Logo as base64
const BRAND_LOGO = "data:image/webp;base64,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";

// Telegram тренера для связи
const TRAINER_TELEGRAM = "seleznev_88";

// API Functions
const api = {
  // GET request
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
  
  // POST request
  post: async (action, data = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await response.json();
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
    full: { name: 'Полный день (9:00 - 21:30)', times: ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'] },
    morning: { name: 'Утро (9:00 - 12:45)', times: ['09:00', '10:15', '11:30', '12:45'] },
    afternoon: { name: 'День (14:00 - 17:45)', times: ['14:00', '15:15', '16:30', '17:45'] },
    evening: { name: 'Вечер (19:00 - 21:30)', times: ['19:00', '20:15', '21:30'] }
  };

  // Load slots from API
  const loadSlots = async () => {
    setLoading(true);
    const result = await api.get('getSlots');
    if (result.ok) {
      setHockeySlots(result.slots || []);
    } else {
      setError('Ошибка загрузки слотов');
    }
    setLoading(false);
  };

  // Load bookings by phone
  const loadBookingsByPhone = async (phone) => {
    setLoading(true);
    const result = await api.get('getBookingsByPhone', { phone });
    if (result.ok) {
      setHockeyBookings(result.bookings || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSlots();
  }, []);

  // Admin login
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_SECRET) {
      setIsAdminAuth(true);
      setView('admin');
    } else {
      alert('Неверный пароль');
    }
  };

  // Add slots (admin)
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
      alert(`Добавлено ${result.added} слотов`);
      await loadSlots();
      setSelectedDates([]);
    } else {
      alert('Ошибка: ' + result.error);
    }
    setLoading(false);
  };

  // Create booking (client)
  const submitBooking = async () => {
    if (!clientForm.name || !clientForm.phone || selectedSlots.length === 0) {
      return alert('Заполните имя, телефон и выберите время');
    }

    setLoading(true);
    const result = await api.post('createBooking', {
      slotIds: selectedSlots,
      name: clientForm.name,
      phone: clientForm.phone,
      telegram: clientForm.telegram,
      comment: clientForm.comment
    });

    if (result.ok) {
      setBookingSuccess(true);
      setSelectedSlots([]);
      setClientForm({ name: '', phone: '', telegram: '', comment: '' });
      await loadSlots();
    } else {
      alert('Ошибка: ' + result.error);
    }
    setLoading(false);
  };

  // Confirm booking (admin)
  const confirmBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminConfirmBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) {
      alert('Заявка подтверждена');
      await loadSlots();
    }
    setLoading(false);
  };

  // Reject booking (admin)
  const rejectBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminRejectBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) {
      alert('Заявка отклонена');
      await loadSlots();
    }
    setLoading(false);
  };

  // Helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { daysInMonth, startingDayOfWeek: firstDay === 0 ? 6 : firstDay - 1 };
  };

  const getAvailableDates = () => {
    return [...new Set(hockeySlots.filter(s => s.status === 'available').map(s => s.date))];
  };

  const getSlotsForDate = (dateStr) => {
    return hockeySlots.filter(s => s.date === dateStr && s.status === 'available').sort((a, b) => a.time.localeCompare(b.time));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // ========== SELECT VIEW ==========
  if (view === 'select') {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-12">
            <img src={BRAND_LOGO} alt="Logo" className="w-32 h-32 mx-auto mb-6 object-contain" />
            <h1 className="text-4xl font-bold text-black">HOCKEY TRAINING</h1>
            <p className="text-gray-600 mt-2">Система бронирования тренировок</p>
          </div>
          <button
            onClick={() => { loadSlots(); setView('client'); }}
            className="w-full bg-black text-white p-6 rounded-2xl mb-4 hover:bg-gray-800 transition-all"
          >
            <h2 className="text-xl font-bold">🏒 Записаться на тренировку</h2>
            <p className="text-gray-300 text-sm mt-1">Выберите удобное время</p>
          </button>
          <button
            onClick={() => setView('admin-login')}
            className="w-full text-gray-500 hover:text-black underline"
          >
            Вход для тренера
          </button>
        </div>
      </div>
    );
  }

  // ========== ADMIN LOGIN ==========
  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border-2 border-black">
          <img src={BRAND_LOGO} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4">Вход тренера</h2>
          <input
            type="password"
            placeholder="Пароль"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            className="w-full p-3 border-2 rounded-lg mb-4"
          />
          <button onClick={handleAdminLogin} className="w-full bg-black text-white p-3 rounded-lg mb-2">
            Войти
          </button>
          <button onClick={() => setView('select')} className="w-full text-gray-500">Назад</button>
        </div>
      </div>
    );
  }

  // ========== CLIENT BOOKING ==========
  if (view === 'client') {
    const availableDates = getAvailableDates();
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(clientMonth);
    const today = new Date().toISOString().split('T')[0];

    // Success screen
    if (bookingSuccess) {
      return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-2 border-black">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-4">Заявка отправлена!</h2>
            <p className="text-gray-600 mb-6">Ожидайте подтверждения от тренера</p>
            <div className="bg-gray-100 p-4 rounded-xl mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">📍 Место проведения:</p>
              <p className="font-bold">Каток «Галактика»</p>
              <p className="text-gray-600">г. Мытищи, ТЦ Июнь</p>
            </div>
            <button onClick={() => setBookingSuccess(false)} className="w-full bg-black text-white p-3 rounded-lg">
              Записаться ещё
            </button>
          </div>
        </div>
      );
    }

    // My bookings
    if (showMyBookings) {
      return (
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setShowMyBookings(false)} className="flex items-center gap-2 text-gray-600 mb-6">
              <ArrowLeft size={20} /> Назад
            </button>
            <h2 className="text-2xl font-bold mb-4">📋 Мои записи</h2>
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Введите телефон"
                value={myBookingsPhone}
                onChange={(e) => setMyBookingsPhone(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
              />
              <button 
                onClick={() => loadBookingsByPhone(myBookingsPhone)}
                className="w-full bg-black text-white p-3 rounded-lg mt-2"
              >
                Найти записи
              </button>
            </div>
            {hockeyBookings.length > 0 ? (
              <div className="space-y-3">
                {hockeyBookings.map(booking => (
                  <div key={booking.id} className="bg-white p-4 rounded-xl border">
                    <p className="font-bold">{booking.name}</p>
                    <p className="text-gray-600">Статус: {booking.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Записи не найдены</p>
            )}
          </div>
        </div>
      );
    }

    // Main booking view
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setView('select')} className="flex items-center gap-2 text-gray-600">
              <ArrowLeft size={20} /> Выход
            </button>
            <button onClick={() => setShowMyBookings(true)} className="bg-white px-4 py-2 rounded-lg border">
              📋 Мои записи
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="text-center mb-6">
                <img src={BRAND_LOGO} alt="Logo" className="w-12 h-12 mx-auto mb-2" />
                <h1 className="text-2xl font-bold">Выберите дату и время</h1>
                <p className="text-sm text-gray-500">Зелёные даты — есть свободные места</p>
              </div>

              {/* Calendar */}
              <div className="bg-white p-6 rounded-2xl border-2 border-black mb-6">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() - 1))} className="p-2">
                    <ChevronLeft />
                  </button>
                  <h3 className="font-bold">{monthNames[clientMonth.getMonth()]} {clientMonth.getFullYear()}</h3>
                  <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() + 1))} className="p-2">
                    <ChevronRight />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(d => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(startingDayOfWeek)].map((_, i) => <div key={`empty-${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${clientMonth.getFullYear()}-${String(clientMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isAvailable = availableDates.includes(dateStr);
                    const isPast = dateStr < today;
                    const isSelected = clientSelectedDate === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && isAvailable && setClientSelectedDate(dateStr)}
                        disabled={isPast || !isAvailable}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          isSelected ? 'bg-black text-white' :
                          isAvailable ? 'bg-green-100 hover:bg-green-200 text-green-800 font-bold' :
                          isPast ? 'text-gray-300' : 'text-gray-400'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {clientSelectedDate && (
                <div className="bg-white p-6 rounded-2xl border-2 border-black mb-6">
                  <h3 className="font-bold mb-4">🕐 {formatDate(clientSelectedDate)}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {getSlotsForDate(clientSelectedDate).map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlots(prev => 
                          prev.includes(slot.id) ? prev.filter(id => id !== slot.id) : [...prev, slot.id]
                        )}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSlots.includes(slot.id) ? 'bg-black text-white border-black' : 'hover:border-black'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking form */}
              {selectedSlots.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border-2 border-black">
                  <h3 className="font-bold mb-4">📝 Ваши данные</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="ФИО *"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="Телефон *"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Telegram (необязательно)"
                      value={clientForm.telegram}
                      onChange={(e) => setClientForm({ ...clientForm, telegram: e.target.value.replace('@', '') })}
                      className="w-full p-3 border-2 rounded-lg"
                    />
                    <textarea
                      placeholder="Комментарий"
                      value={clientForm.comment}
                      onChange={(e) => setClientForm({ ...clientForm, comment: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg"
                      rows={2}
                    />
                    <button
                      onClick={submitBooking}
                      disabled={loading}
                      className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
                    >
                      {loading ? 'Отправка...' : `Записаться (${selectedSlots.length} занятий)`}
                    </button>
                  </div>
                </div>
              )}

              {availableDates.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center border">
                  <p className="text-gray-500">Нет доступных слотов. Загляните позже.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ========== ADMIN DASHBOARD ==========
  if (isAdminAuth && view === 'admin') {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const today = new Date().toISOString().split('T')[0];

    // Get pending bookings from slots
    const pendingSlots = hockeySlots.filter(s => s.status === 'pending');
    const confirmedSlots = hockeySlots.filter(s => s.status === 'booked');

    // Group by bookingId
    const pendingBookings = {};
    pendingSlots.forEach(slot => {
      if (slot.bookingId) {
        if (!pendingBookings[slot.bookingId]) {
          pendingBookings[slot.bookingId] = { slots: [], ...slot };
        }
        pendingBookings[slot.bookingId].slots.push(slot);
      }
    });

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border-2 border-black">
            <div className="flex items-center gap-4">
              <img src={BRAND_LOGO} alt="Logo" className="w-10 h-10" />
              <h1 className="text-xl font-bold">Панель тренера</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={loadSlots} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
                🔄 Обновить
              </button>
              <button onClick={() => { setIsAdminAuth(false); setView('select'); }} className="bg-black text-white px-4 py-2 rounded-lg">
                Выход
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border text-center">
              <div className="text-3xl font-bold">{hockeySlots.filter(s => s.status === 'available').length}</div>
              <div className="text-gray-500">Свободных слотов</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-400 text-center">
              <div className="text-3xl font-bold text-yellow-700">{Object.keys(pendingBookings).length}</div>
              <div className="text-yellow-700">Ожидают подтверждения</div>
            </div>
            <div className="bg-green-100 p-4 rounded-xl border border-green-400 text-center">
              <div className="text-3xl font-bold text-green-700">{confirmedSlots.length}</div>
              <div className="text-green-700">Подтверждённых</div>
            </div>
          </div>

          {/* Pending bookings */}
          {Object.keys(pendingBookings).length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-400 mb-6">
              <h2 className="text-xl font-bold mb-4">⏳ Новые заявки</h2>
              <div className="space-y-4">
                {Object.entries(pendingBookings).map(([bookingId, booking]) => (
                  <div key={bookingId} className="bg-white p-4 rounded-xl border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{booking.slots.map(s => `${s.date} ${s.time}`).join(', ')}</p>
                        <p className="text-gray-600">ID: {bookingId.slice(0, 8)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmBooking(bookingId)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          ✅ Подтвердить
                        </button>
                        <button
                          onClick={() => rejectBooking(bookingId)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          ❌ Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add slots */}
          <div className="bg-white p-6 rounded-2xl border-2 border-black mb-6">
            <h2 className="text-xl font-bold mb-4">➕ Добавить слоты</h2>
            
            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2">
                  <ChevronLeft />
                </button>
                <h3 className="font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2">
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(startingDayOfWeek)].map((_, i) => <div key={`empty-${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isPast = dateStr < today;
                  const isSelected = selectedDates.includes(dateStr);
                  const hasSlots = hockeySlots.some(s => s.date === dateStr);

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && setSelectedDates(prev => 
                        prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
                      )}
                      disabled={isPast}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        isSelected ? 'bg-black text-white' :
                        hasSlots ? 'bg-green-100 text-green-800' :
                        isPast ? 'text-gray-300' : 'hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Шаблон времени:</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
              >
                {Object.entries(timeTemplates).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
            </div>

            {selectedDates.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Выбрано дат: {selectedDates.length}</p>
                <p className="text-sm text-gray-600">Слотов на дату: {timeTemplates[selectedTemplate].times.length}</p>
              </div>
            )}

            <button
              onClick={addSlotsFromCalendar}
              disabled={selectedDates.length === 0 || loading}
              className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Добавление...' : 'Добавить слоты'}
            </button>
          </div>

          {/* Available slots list */}
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="text-xl font-bold mb-4">📅 Все слоты ({hockeySlots.length})</h2>
            <div className="max-h-64 overflow-y-auto">
              {hockeySlots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Слотов пока нет</p>
              ) : (
                <div className="space-y-2">
                  {hockeySlots.slice(0, 20).map(slot => (
                    <div key={slot.id} className={`flex justify-between items-center p-2 rounded border ${
                      slot.status === 'available' ? 'bg-green-50' :
                      slot.status === 'pending' ? 'bg-yellow-50' :
                      slot.status === 'booked' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <span>{slot.date} {slot.time}</span>
                      <span className="text-sm text-gray-500">{slot.status}</span>
                    </div>
                  ))}
                  {hockeySlots.length > 20 && (
                    <p className="text-center text-gray-500">... и ещё {hockeySlots.length - 20}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BookingSystem;
