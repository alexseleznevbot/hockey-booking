import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, ChevronLeft, ChevronRight, Phone, ArrowLeft, X, History, AlertCircle, List, Users } from 'lucide-react';

// API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbwp3-LW4GeUVzMO4Bc-Bdca39SUVeRfViNoSVWIRD1Q5Y54T96hIhtxJ58AOnmIhjGlPg/exec';
const ADMIN_SECRET = 'ShsHockey_2026_!Seleznev';

// Hockey puck logo (simple SVG as data URI)
const BRAND_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='45' ry='25' fill='%23111'/%3E%3Cellipse cx='50' cy='45' rx='45' ry='25' fill='%23333'/%3E%3Cellipse cx='50' cy='45' rx='35' ry='18' fill='none' stroke='%23555' stroke-width='2'/%3E%3C/svg%3E";

const TRAINER_TELEGRAM = "seleznev_88";

// Detect Telegram Mini App
const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp;
if (isTelegramWebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// API Functions
const api = {
  get: async (action, params = {}) => {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    try {
      const response = await fetch(url.toString());
      return await response.json();
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },
  post: async (action, data = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...data })
      });
      return await response.json();
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
};

// Toast
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800'
  } text-white`} style={{ animation: 'slideDown 0.3s ease' }}>
    <div className="flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4"><X size={18} /></button>
    </div>
  </div>
);

// Modal
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Spinner
const Spinner = () => (
  <div className="flex justify-center py-8">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>
);

const BookingSystem = () => {
  const [view, setView] = useState('select');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [hockeySlots, setHockeySlots] = useState([]);
  const [hockeyBookings, setHockeyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [cancellations, setCancellations] = useState([]);

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
  
  const [slotsToDelete, setSlotsToDelete] = useState([]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');

  // Admin tabs and filters
  const [adminTab, setAdminTab] = useState('main'); // 'main' or 'history'
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled', 'rejected'
  
  // Admin cancel modal
  const [adminCancelModal, setAdminCancelModal] = useState({ open: false, booking: null });
  const [adminCancelReason, setAdminCancelReason] = useState('');

  const timeTemplates = {
    full: { name: 'Весь день', times: ['09:00','10:15','11:30','12:45','14:00','15:15','16:30','17:45','19:00','20:15','21:30'] },
    morning: { name: 'Утро', times: ['09:00','10:15','11:30','12:45'] },
    afternoon: { name: 'День', times: ['14:00','15:15','16:30','17:45'] },
    evening: { name: 'Вечер', times: ['19:00','20:15','21:30'] }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSlots = async () => {
    setLoading(true);
    const result = await api.get('getSlots');
    if (result.ok) setHockeySlots(result.slots || []);
    setLoading(false);
  };

  const loadAllBookings = async () => {
    const result = await api.get('getAllBookings', { adminSecret: ADMIN_SECRET });
    if (result.ok) setAllBookings(result.bookings || []);
  };

  const loadCancellations = async () => {
    const result = await api.get('getCancellations', { adminSecret: ADMIN_SECRET });
    if (result.ok) setCancellations(result.cancellations || []);
  };

  const loadBookingsByPhone = async (phone) => {
    if (!phone) return;
    setLoading(true);
    const result = await api.get('getBookingsByPhone', { phone: phone.replace(/\D/g, '') });
    setHockeyBookings(result.ok ? result.bookings || [] : []);
    setLoading(false);
  };

  useEffect(() => { loadSlots(); }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_SECRET) {
      setIsAdminAuth(true);
      setView('admin');
      loadSlots(); loadAllBookings(); loadCancellations();
    } else {
      showToast('Неверный пароль', 'error');
    }
  };

  const addSlotsFromCalendar = async () => {
    if (selectedDates.length === 0) return showToast('Выберите даты', 'error');
    const slotsToAdd = [];
    selectedDates.forEach(date => {
      timeTemplates[selectedTemplate].times.forEach(time => {
        slotsToAdd.push({ date, time, id: `${date}-${time}-${Date.now()}` });
      });
    });
    setLoading(true);
    const result = await api.post('adminAddSlots', { adminSecret: ADMIN_SECRET, slots: slotsToAdd });
    if (result.ok) {
      showToast(`Добавлено ${result.added} слотов`, 'success');
      await loadSlots();
      setSelectedDates([]);
    }
    setLoading(false);
  };

  const deleteSelectedSlots = async () => {
    if (slotsToDelete.length === 0) return;
    setLoading(true);
    const result = await api.post('adminDeleteSlots', { adminSecret: ADMIN_SECRET, slotIds: slotsToDelete });
    if (result.ok) {
      showToast(`Удалено ${result.deleted} слотов`, 'success');
      await loadSlots();
      setSlotsToDelete([]);
      setShowDeleteMode(false);
    }
    setLoading(false);
  };

  const submitBooking = async () => {
    if (!clientForm.name || !clientForm.phone || selectedSlots.length === 0) {
      return showToast('Заполните имя и телефон', 'error');
    }
    setLoading(true);
    const result = await api.post('createBooking', {
      slotIds: selectedSlots,
      ...clientForm
    });
    if (result.ok) {
      setBookingSuccess(true);
      setSelectedSlots([]);
      setClientForm({ name: '', phone: '', telegram: '', comment: '' });
      await loadSlots();
    } else {
      showToast('Ошибка: ' + result.error, 'error');
    }
    setLoading(false);
  };

  const requestCancellation = async () => {
    if (!cancelModal.booking) return;
    setLoading(true);
    const result = await api.post('requestCancellation', {
      bookingId: cancelModal.booking.id,
      phone: myBookingsPhone,
      reason: cancelReason
    });
    if (result.ok) {
      showToast('Запрос на отмену отправлен', 'success');
      setCancelModal({ open: false, booking: null });
      setCancelReason('');
      await loadBookingsByPhone(myBookingsPhone);
    } else {
      showToast('Ошибка: ' + result.error, 'error');
    }
    setLoading(false);
  };

  const confirmBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminConfirmBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) { showToast('Подтверждено', 'success'); await loadSlots(); await loadAllBookings(); }
    setLoading(false);
  };

  const rejectBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminRejectBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) { showToast('Отклонено', 'success'); await loadSlots(); await loadAllBookings(); }
    setLoading(false);
  };

  const approveCancellation = async (cancellationId) => {
    setLoading(true);
    const result = await api.post('adminApproveCancellation', { adminSecret: ADMIN_SECRET, cancellationId });
    if (result.ok) { showToast('Отмена одобрена', 'success'); await loadSlots(); await loadAllBookings(); await loadCancellations(); }
    setLoading(false);
  };

  const rejectCancellation = async (cancellationId) => {
    setLoading(true);
    const result = await api.post('adminRejectCancellation', { adminSecret: ADMIN_SECRET, cancellationId });
    if (result.ok) { showToast('Отмена отклонена', 'success'); await loadCancellations(); await loadAllBookings(); }
    setLoading(false);
  };

  // Admin cancel confirmed booking (force-majeure)
  const adminCancelBooking = async () => {
    if (!adminCancelModal.booking) return;
    
    const bookingId = String(adminCancelModal.booking.id).trim();
    if (!bookingId) {
      showToast('Ошибка: ID записи не найден', 'error');
      return;
    }
    
    setLoading(true);
    const result = await api.post('adminCancelBooking', { 
      adminSecret: ADMIN_SECRET, 
      bookingId: bookingId,
      reason: adminCancelReason
    });
    
    if (result.ok) { 
      showToast('Запись отменена. Уведомление отправлено.', 'success'); 
      setAdminCancelModal({ open: false, booking: null });
      setAdminCancelReason('');
      await loadSlots(); 
      await loadAllBookings(); 
    } else {
      showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    }
    setLoading(false);
  };

  // Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth: new Date(year, month + 1, 0).getDate(), startingDayOfWeek: firstDay === 0 ? 6 : firstDay - 1 };
  };

  const getAvailableDates = () => [...new Set(hockeySlots.filter(s => s.status === 'available').map(s => s.date))];
  const getSlotsForDate = (dateStr) => hockeySlots.filter(s => s.date === dateStr && s.status === 'available').sort((a, b) => a.time.localeCompare(b.time));
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const parseSlotIds = (slotIds) => {
    if (!slotIds) return [];
    return String(slotIds).split(',').map(id => {
      const parts = id.trim().split('-');
      if (parts.length >= 4) {
        return { date: `${parts[0]}-${parts[1]}-${parts[2]}`, time: parts[3] };
      }
      return { date: '', time: '' };
    });
  };

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const getTodayStr = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; };

  const getStatusBadge = (status) => {
    const styles = { 
      pending: 'bg-yellow-100 text-yellow-700', 
      confirmed: 'bg-green-100 text-green-700', 
      rejected: 'bg-red-100 text-red-700', 
      cancelled: 'bg-gray-100 text-gray-700', 
      cancelled_by_admin: 'bg-red-100 text-red-700',
      cancellation_requested: 'bg-orange-100 text-orange-700' 
    };
    const labels = { 
      pending: '⏳ Ожидает', 
      confirmed: '✅ Подтверждено', 
      rejected: '❌ Отклонено', 
      cancelled: '🚫 Отменено', 
      cancelled_by_admin: '🚫 Отменено тренером',
      cancellation_requested: '⚠️ Запрос отмены' 
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const styles = `@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`;

  // ========== SELECT VIEW ==========
  if (view === 'select') {
    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
          <div className="max-w-md mx-auto pt-10">
            <div className="text-center mb-10">
              <img src={BRAND_LOGO} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
              <h1 className="text-3xl font-black">HOCKEY TRAINING</h1>
              <p className="text-gray-500 text-sm mt-1">Персональные тренировки</p>
            </div>
            <button onClick={() => { loadSlots(); setView('client'); }} className="w-full bg-black text-white p-5 rounded-2xl mb-4 hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🏒</span>
                <div className="text-left">
                  <h2 className="text-lg font-bold">Записаться</h2>
                  <p className="text-gray-400 text-xs">Выберите время</p>
                </div>
              </div>
            </button>
            <div className="bg-white rounded-2xl p-4 border shadow-sm mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-semibold">Каток «Галактика»</p>
                  <p className="text-gray-500 text-sm">г. Мытищи, ТЦ Июнь</p>
                </div>
              </div>
            </div>
            <button onClick={() => setView('admin-login')} className="w-full text-gray-400 text-sm">Вход для тренера</button>
          </div>
        </div>
      </>
    );
  }

  // ========== ADMIN LOGIN ==========
  if (view === 'admin-login') {
    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
            <img src={BRAND_LOGO} alt="" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-center mb-6">Вход тренера</h2>
            <input type="password" placeholder="Пароль" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdminLogin()} className="w-full p-4 border-2 rounded-xl mb-4 focus:border-black outline-none" />
            <button onClick={handleAdminLogin} className="w-full bg-black text-white p-4 rounded-xl font-medium">Войти</button>
            <button onClick={() => setView('select')} className="w-full text-gray-500 mt-4">Назад</button>
          </div>
        </div>
      </>
    );
  }

  // ========== CLIENT VIEW ==========
  if (view === 'client') {
    const availableDates = getAvailableDates();
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(clientMonth);
    const today = getTodayStr();

    if (bookingSuccess) {
      return (
        <>
          <style>{styles}</style>
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Заявка отправлена!</h2>
              <p className="text-gray-500 mb-6">Ожидайте подтверждения</p>
              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                <p className="text-xs text-gray-400 mb-1">📍 Место</p>
                <p className="font-semibold">Каток «Галактика»</p>
                <p className="text-gray-500 text-sm">г. Мытищи</p>
              </div>
              <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white p-4 rounded-xl mb-3">✈️ Написать тренеру</a>
              <button onClick={() => { setBookingSuccess(false); loadSlots(); }} className="w-full bg-black text-white p-4 rounded-xl">Записаться ещё</button>
            </div>
          </div>
        </>
      );
    }

    if (showMyBookings) {
      return (
        <>
          <style>{styles}</style>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
          <Modal isOpen={cancelModal.open} onClose={() => setCancelModal({ open: false, booking: null })} title="Отмена записи">
            <p className="text-gray-600 mb-4">Вы уверены?</p>
            <textarea placeholder="Причина (необязательно)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full p-3 border-2 rounded-xl mb-4 outline-none" rows={3} />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({ open: false, booking: null })} className="flex-1 p-3 border-2 rounded-xl">Отмена</button>
              <button onClick={requestCancellation} disabled={loading} className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50">{loading ? '...' : 'Отменить'}</button>
            </div>
          </Modal>
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-lg mx-auto">
              <button onClick={() => setShowMyBookings(false)} className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={20} /> Назад</button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center"><History className="text-white" size={24} /></div>
                <div><h2 className="text-xl font-bold">Мои записи</h2><p className="text-gray-500 text-sm">История</p></div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <input type="tel" placeholder="Ваш телефон" value={myBookingsPhone} onChange={e => setMyBookingsPhone(e.target.value)} className="w-full p-3 border-2 rounded-xl mb-3 outline-none" />
                <button onClick={() => loadBookingsByPhone(myBookingsPhone)} disabled={loading || !myBookingsPhone} className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50">{loading ? '...' : 'Найти'}</button>
              </div>
              {loading ? <Spinner /> : (
                <div className="space-y-3">
                  {hockeyBookings.map(b => (
                    <div key={b.id} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${b.status === 'confirmed' ? 'border-l-green-500' : b.status === 'pending' ? 'border-l-yellow-500' : b.status === 'cancellation_requested' ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold">{b.name}</p>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-gray-600 text-sm">📅 {b.slotIds}</p>
                      {b.comment && <p className="text-gray-500 text-sm">💬 {b.comment}</p>}
                      {(b.status === 'confirmed' || b.status === 'pending') && (
                        <button onClick={() => setCancelModal({ open: true, booking: b })} className="mt-2 text-red-500 text-sm flex items-center gap-1"><XCircle size={16} /> Отменить</button>
                      )}
                    </div>
                  ))}
                  {hockeyBookings.length === 0 && <div className="bg-white p-8 rounded-2xl text-center text-gray-500">Введите телефон</div>}
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen bg-gray-50 pb-32">
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-lg mx-auto p-4 flex justify-between items-center">
              <button onClick={() => setView('select')} className="text-gray-600"><ArrowLeft size={20} /></button>
              <img src={BRAND_LOGO} alt="" className="w-8 h-8" />
              <button onClick={() => setShowMyBookings(true)} className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-2 rounded-full"><History size={16} /> Записи</button>
            </div>
          </div>
          <div className="max-w-lg mx-auto p-4">
            {loading ? <Spinner /> : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold">Выберите дату</h1>
                  <p className="text-gray-500 text-sm">Зелёные — есть места</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() - 1))} className="p-2"><ChevronLeft size={20} /></button>
                    <h3 className="font-bold">{monthNames[clientMonth.getMonth()]} {clientMonth.getFullYear()}</h3>
                    <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() + 1))} className="p-2"><ChevronRight size={20} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(d => <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(startingDayOfWeek)].map((_, i) => <div key={`e-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${clientMonth.getFullYear()}-${String(clientMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isAvailable = availableDates.includes(dateStr);
                      const isPast = dateStr < today;
                      const isSelected = clientSelectedDate === dateStr;
                      return (
                        <button key={day} onClick={() => !isPast && isAvailable && setClientSelectedDate(dateStr)} disabled={isPast || !isAvailable}
                          className={`aspect-square rounded-xl text-sm font-medium transition-all ${isSelected ? 'bg-black text-white scale-110' : isAvailable ? 'bg-green-100 text-green-700' : isPast ? 'text-gray-300' : 'text-gray-400'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {clientSelectedDate && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <h3 className="font-bold mb-3">{formatDate(clientSelectedDate)}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {getSlotsForDate(clientSelectedDate).map(slot => (
                        <button key={slot.id} onClick={() => setSelectedSlots(p => p.includes(slot.id) ? p.filter(id => id !== slot.id) : [...p, slot.id])}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${selectedSlots.includes(slot.id) ? 'bg-black text-white' : 'bg-gray-100'}`}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {availableDates.length === 0 && (
                  <div className="bg-white p-8 rounded-2xl text-center">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={32} />
                    <p className="text-gray-500">Нет слотов</p>
                    <button onClick={loadSlots} className="text-blue-500 mt-2">Обновить</button>
                  </div>
                )}
              </>
            )}
          </div>
          {selectedSlots.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
              <div className="max-w-lg mx-auto">
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Имя *" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="flex-1 p-3 border-2 rounded-xl text-sm outline-none" />
                  <input type="tel" placeholder="Телефон *" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className="flex-1 p-3 border-2 rounded-xl text-sm outline-none" />
                </div>
                <button onClick={submitBooking} disabled={loading || !clientForm.name || !clientForm.phone} className="w-full bg-black text-white p-4 rounded-xl font-bold disabled:opacity-50">
                  {loading ? '...' : `Записаться • ${selectedSlots.length}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ========== ADMIN VIEW ==========
  if (isAdminAuth && view === 'admin') {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const today = getTodayStr();
    const pendingSlots = hockeySlots.filter(s => s.status === 'pending');
    const confirmedSlots = hockeySlots.filter(s => s.status === 'booked');
    const availableSlots = hockeySlots.filter(s => s.status === 'available');
    const pendingCancellations = cancellations.filter(c => c.status === 'pending');

    const pendingBookings = {};
    pendingSlots.forEach(slot => {
      if (slot.bookingId) {
        if (!pendingBookings[slot.bookingId]) pendingBookings[slot.bookingId] = { slots: [], bookingId: slot.bookingId };
        pendingBookings[slot.bookingId].slots.push(slot);
      }
    });
    const getBookingDetails = (id) => allBookings.find(b => b.id === id) || {};

    // Filter bookings for history
    const filteredBookings = allBookings.filter(b => {
      if (historyFilter === 'all') return true;
      if (historyFilter === 'cancellation_requested') return b.status === 'cancellation_requested';
      return b.status === historyFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        
        {/* Admin Cancel Modal */}
        <Modal 
          isOpen={adminCancelModal.open} 
          onClose={() => { setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason(''); }}
          title="Отмена записи клиента"
        >
          <div className="mb-4">
            <p className="font-bold text-lg">{adminCancelModal.booking?.name}</p>
            <p className="text-gray-600">📞 {adminCancelModal.booking?.phone}</p>
            <p className="text-gray-500 text-sm mt-2">📅 {adminCancelModal.booking?.slotIds}</p>
          </div>
          <p className="text-gray-600 mb-4">
            Клиент получит уведомление об отмене. Укажите причину:
          </p>
          <textarea 
            placeholder="Причина отмены (необязательно)" 
            value={adminCancelReason} 
            onChange={e => setAdminCancelReason(e.target.value)} 
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none focus:border-red-300" 
            rows={3} 
          />
          <div className="flex gap-3">
            <button 
              onClick={() => { setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason(''); }} 
              className="flex-1 p-3 border-2 rounded-xl hover:bg-gray-50"
            >
              Назад
            </button>
            <button 
              onClick={adminCancelBooking} 
              disabled={loading} 
              className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50 hover:bg-red-600"
            >
              {loading ? '...' : '🚫 Отменить запись'}
            </button>
          </div>
        </Modal>
        
        <div className="min-h-screen bg-gray-50 pb-8">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={BRAND_LOGO} alt="" className="w-10 h-10" />
                <span className="font-bold">Панель тренера</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { loadSlots(); loadAllBookings(); loadCancellations(); }} disabled={loading} className="p-2 bg-gray-100 rounded-xl disabled:opacity-50">🔄</button>
                <button onClick={() => { setIsAdminAuth(false); setView('select'); }} className="px-4 py-2 bg-black text-white rounded-xl text-sm">Выход</button>
              </div>
            </div>
            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => setAdminTab('main')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'main' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Calendar size={16} /> Главная
                </button>
                <button 
                  onClick={() => setAdminTab('history')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'history' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Users size={16} /> Все записи ({allBookings.length})
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-4">
            
            {/* ========== MAIN TAB ========== */}
            {adminTab === 'main' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm"><div className="text-2xl font-bold">{availableSlots.length}</div><div className="text-xs text-gray-500">Свободных</div></div>
                  <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200"><div className="text-2xl font-bold text-yellow-600">{Object.keys(pendingBookings).length}</div><div className="text-xs text-yellow-600">Заявок</div></div>
                  <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200"><div className="text-2xl font-bold text-green-600">{confirmedSlots.length}</div><div className="text-xs text-green-600">Подтверждено</div></div>
                  <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200"><div className="text-2xl font-bold text-orange-600">{pendingCancellations.length}</div><div className="text-xs text-orange-600">Отмен</div></div>
                </div>

                {/* Cancellations - IMPROVED with full booking info */}
                {pendingCancellations.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 mb-6">
                    <h2 className="font-bold text-orange-700 mb-4 flex items-center gap-2"><AlertCircle size={20} /> Запросы на отмену</h2>
                    {pendingCancellations.map(c => {
                      const booking = allBookings.find(x => x.id === c.bookingId);
                      const slots = parseSlotIds(booking?.slotIds);
                      return (
                        <div key={c.id} className="bg-white p-4 rounded-xl mb-2">
                          <div className="flex justify-between flex-wrap gap-3">
                            <div>
                              <p className="font-bold text-lg">{booking?.name || 'Клиент не найден'}</p>
                              <p className="text-sm text-gray-600">📞 {booking?.phone || c.phone}</p>
                              {booking?.telegram && <p className="text-sm text-gray-600">✈️ @{booking.telegram}</p>}
                              <p className="text-sm text-gray-500 mt-1">
                                📅 {slots.map(s => `${s.date} ${s.time}`).join(', ')}
                              </p>
                              {c.reason && <p className="text-sm text-orange-600 mt-1">💬 Причина: {c.reason}</p>}
                            </div>
                            <div className="flex gap-2 items-start">
                              {booking?.phone && <a href={`tel:${booking.phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={20} /></a>}
                              <button onClick={() => approveCancellation(c.id)} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm disabled:opacity-50">✅ Одобрить</button>
                              <button onClick={() => rejectCancellation(c.id)} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">❌ Отклонить</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pending Bookings */}
                {Object.keys(pendingBookings).length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6">
                    <h2 className="font-bold text-yellow-700 mb-4">⏳ Новые заявки</h2>
                    {Object.entries(pendingBookings).map(([id, booking]) => {
                      const d = getBookingDetails(id);
                      return (
                        <div key={id} className="bg-white p-4 rounded-xl mb-2">
                          <div className="flex justify-between flex-wrap gap-3">
                            <div>
                              <p className="font-bold">{d.name || '—'}</p>
                              <p className="text-sm text-gray-600">📞 {d.phone}</p>
                              {d.telegram && <p className="text-sm text-gray-600">✈️ @{d.telegram}</p>}
                              <p className="text-sm text-gray-500">🕐 {booking.slots.map(s => `${s.date} ${s.time}`).join(', ')}</p>
                            </div>
                            <div className="flex gap-2">
                              {d.phone && <a href={`tel:${d.phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={20} /></a>}
                              <button onClick={() => confirmBooking(id)} disabled={loading} className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm disabled:opacity-50">✅</button>
                              <button onClick={() => rejectBooking(id)} disabled={loading} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">❌</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Slots */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={20} /> Добавить слоты</h2>
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2"><ChevronLeft size={20} /></button>
                    <h3 className="font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2"><ChevronRight size={20} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(d => <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {[...Array(startingDayOfWeek)].map((_, i) => <div key={`e-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isPast = dateStr < today;
                      const isSelected = selectedDates.includes(dateStr);
                      const hasSlots = hockeySlots.some(s => s.date === dateStr);
                      return (
                        <button key={day} onClick={() => !isPast && setSelectedDates(p => p.includes(dateStr) ? p.filter(d => d !== dateStr) : [...p, dateStr])} disabled={isPast}
                          className={`aspect-square rounded-lg text-sm ${isSelected ? 'bg-black text-white' : hasSlots ? 'bg-green-100 text-green-700' : isPast ? 'text-gray-300' : 'hover:bg-gray-100'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {Object.entries(timeTemplates).map(([k, t]) => (
                      <button key={k} onClick={() => setSelectedTemplate(k)} className={`flex-1 p-2 rounded-lg text-xs ${selectedTemplate === k ? 'bg-black text-white' : 'bg-gray-100'}`}>{t.name}</button>
                    ))}
                  </div>
                  {selectedDates.length > 0 && <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm">📅 {selectedDates.length} дат • 🕐 {selectedDates.length * timeTemplates[selectedTemplate].times.length} слотов</div>}
                  <button onClick={addSlotsFromCalendar} disabled={selectedDates.length === 0 || loading} className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50">{loading ? '...' : 'Добавить'}</button>
                </div>

                {/* Delete Slots */}
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">📅 Слоты ({availableSlots.length})</h2>
                    {showDeleteMode ? (
                      <div className="flex gap-2">
                        <button onClick={deleteSelectedSlots} disabled={slotsToDelete.length === 0 || loading} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">🗑 ({slotsToDelete.length})</button>
                        <button onClick={() => { setShowDeleteMode(false); setSlotsToDelete([]); }} className="px-3 py-1 bg-gray-200 rounded-lg text-sm">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteMode(true)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm">🗑</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableSlots.length === 0 ? <p className="text-gray-500 text-center py-4">Нет слотов</p> : (
                      availableSlots.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(s => (
                        <div key={s.id} onClick={() => showDeleteMode && setSlotsToDelete(p => p.includes(s.id) ? p.filter(id => id !== s.id) : [...p, s.id])}
                          className={`p-3 rounded-xl flex justify-between items-center cursor-pointer ${slotsToDelete.includes(s.id) ? 'bg-red-100 border border-red-300' : 'bg-gray-50'}`}>
                          <span className="font-medium">{s.date} {s.time}</span>
                          {showDeleteMode && <span className={slotsToDelete.includes(s.id) ? 'text-red-600' : 'text-gray-400'}>{slotsToDelete.includes(s.id) ? '✓' : '○'}</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ========== HISTORY TAB ========== */}
            {adminTab === 'history' && (
              <>
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><List size={20} /> Фильтр по статусу</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'Все', count: allBookings.length },
                      { key: 'pending', label: '⏳ Ожидают', count: allBookings.filter(b => b.status === 'pending').length },
                      { key: 'confirmed', label: '✅ Подтверждённые', count: allBookings.filter(b => b.status === 'confirmed').length },
                      { key: 'cancellation_requested', label: '⚠️ Запрос отмены', count: allBookings.filter(b => b.status === 'cancellation_requested').length },
                      { key: 'cancelled', label: '🚫 Отменённые', count: allBookings.filter(b => b.status === 'cancelled').length },
                      { key: 'rejected', label: '❌ Отклонённые', count: allBookings.filter(b => b.status === 'rejected').length },
                    ].map(f => (
                      <button 
                        key={f.key} 
                        onClick={() => setHistoryFilter(f.key)}
                        className={`px-3 py-2 rounded-xl text-sm transition-all ${historyFilter === f.key ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-3">
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                      Нет записей с таким статусом
                    </div>
                  ) : (
                    filteredBookings.map(booking => {
                      const slots = parseSlotIds(booking.slotIds);
                      return (
                        <div key={booking.id} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${
                          booking.status === 'confirmed' ? 'border-l-green-500' :
                          booking.status === 'pending' ? 'border-l-yellow-500' :
                          booking.status === 'cancellation_requested' ? 'border-l-orange-500' :
                          booking.status === 'cancelled' ? 'border-l-gray-400' :
                          booking.status === 'rejected' ? 'border-l-red-500' :
                          'border-l-gray-300'
                        }`}>
                          <div className="flex justify-between items-start flex-wrap gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-lg">{booking.name}</p>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-gray-600 text-sm">📞 {booking.phone}</p>
                              {booking.telegram && <p className="text-gray-600 text-sm">✈️ @{booking.telegram}</p>}
                              <p className="text-gray-500 text-sm mt-1">
                                📅 {slots.map(s => `${s.date} ${s.time}`).join(', ')}
                              </p>
                              {booking.comment && <p className="text-gray-500 text-sm">💬 {booking.comment}</p>}
                              <p className="text-gray-400 text-xs mt-2">Создано: {formatDateTime(booking.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              {booking.phone && <a href={`tel:${booking.phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={18} /></a>}
                              {booking.telegram && <a href={`https://t.me/${booking.telegram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg text-sm">✈️</a>}
                              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                <button 
                                  onClick={() => setAdminCancelModal({ open: true, booking })}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                >
                                  🚫 Отменить
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </>
    );
  }

  return null;
};

export default BookingSystem;
