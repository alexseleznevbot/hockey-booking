import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, ChevronLeft, ChevronRight, Phone, ArrowLeft, X, History, AlertCircle, List, Users, Send } from 'lucide-react';

// API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbwb34vD0z2GXTY-iQ5b0m_wFcypUz218d-DJH0Z0vefGiir29u7ccl6xLFrIZkpAc8INw/exec';
const ADMIN_SECRET = 'ShsHockey_2026_!Seleznev';

// Hockey puck logo
const BRAND_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='45' ry='25' fill='%23111'/%3E%3Cellipse cx='50' cy='45' rx='45' ry='25' fill='%23333'/%3E%3Cellipse cx='50' cy='45' rx='35' ry='18' fill='none' stroke='%23555' stroke-width='2'/%3E%3C/svg%3E";

const TRAINER_TELEGRAM = "seleznev_88";

// Telegram Mini App Detection & Data
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
const isTelegramWebApp = !!tg;

// Get Telegram user data
const getTelegramUser = () => {
  if (!tg || !tg.initDataUnsafe?.user) return null;
  const user = tg.initDataUnsafe.user;
  return {
    chatId: user.id?.toString() || '',
    username: user.username || '',
    firstName: user.first_name || '',
    lastName: user.last_name || ''
  };
};

// Initialize Telegram WebApp
if (isTelegramWebApp) {
  tg.ready();
  tg.expand();
  // Set theme
  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

const telegramUser = getTelegramUser();

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

// Toast Component
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

// Modal Component
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

// Spinner Component
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
  
  // Saved user data from database (for returning users)
  const [savedUserData, setSavedUserData] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  
  // Client form - will be updated after loading saved data
  const [clientForm, setClientForm] = useState({ 
    name: telegramUser ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim() : '', 
    phone: '+7', 
    telegram: telegramUser?.username || '', 
    comment: '' 
  });
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
  const [adminTab, setAdminTab] = useState('main');
  const [historyFilter, setHistoryFilter] = useState('all');
  
  // Admin cancel modal
  const [adminCancelModal, setAdminCancelModal] = useState({ open: false, booking: null });
  const [adminCancelReason, setAdminCancelReason] = useState('');

  // Admin delete modal
  const [adminDeleteModal, setAdminDeleteModal] = useState({ open: false, bookingId: null });

  // Single slot add
  const [singleSlotDate, setSingleSlotDate] = useState('');
  const [singleSlotTime, setSingleSlotTime] = useState('');
  const [singleSlotIsHockey, setSingleSlotIsHockey] = useState(false);

  // Weekend visibility control - persist in localStorage
  const [weekendManualOverride, setWeekendManualOverride] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weekendManualOverride');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    }
    return null; // null = auto, true = open, false = closed
  });

  // Save weekendManualOverride to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (weekendManualOverride === null) {
        localStorage.removeItem('weekendManualOverride');
      } else {
        localStorage.setItem('weekendManualOverride', String(weekendManualOverride));
      }
    }
  }, [weekendManualOverride]);

  // Check if weekends should be open (auto: Friday 17:00+, or manual override)
  const areWeekendsOpen = () => {
    // Manual override takes priority
    if (weekendManualOverride !== null) {
      return weekendManualOverride;
    }
    // Auto logic: open on Friday after 17:00 and all weekend
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const hour = now.getHours();
    
    // Open on: Friday after 17:00, Saturday, Sunday
    if (day === 5 && hour >= 17) return true; // Friday 17:00+
    if (day === 6) return true; // Saturday
    if (day === 0) return true; // Sunday
    return false;
  };

  // Check if date is weekend
  const isWeekend = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Check if weekend date is available for booking
  const isWeekendAvailable = (dateStr) => {
    if (!isWeekend(dateStr)) return true; // Not weekend - always available
    return areWeekendsOpen();
  };

  // Weekly schedule template (0 = Monday, 6 = Sunday)
  const weeklySchedule = {
    0: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'], // Понедельник (10)
    1: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'], // Вторник (10)
    2: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15'],         // Среда (9) - без 20:30
    3: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'], // Четверг (10)
    4: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'], // Пятница (10)
    5: ['09:00','10:15','11:30','12:45','14:00','15:15','16:30','17:45','19:00','20:15'], // Суббота (10)
    6: ['09:00','10:15','11:30','12:45','14:00','15:15','16:30','17:45','19:00','20:15']  // Воскресенье (10)
  };

  // Hockey hours - special slots (dayOfWeek-time)
  // dayOfWeek: 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс
  const hockeyHours = {
    '0-14:00': true,  // Понедельник 14:00
    '1-15:15': true,  // Вторник 15:15
    '2-14:00': true,  // Среда 14:00
    '3-15:15': true,  // Четверг 15:15
    '4-14:00': true   // Пятница 14:00
  };

  // Check if slot is hockey hour (from schedule or manually marked)
  const isHockeyHour = (dateStr, time, slot = null) => {
    // Check if slot is manually marked as hockey
    if (slot && slot.isHockey) return true;
    
    // Check standard hockey hours schedule
    const date = new Date(dateStr + 'T00:00:00');
    const jsDay = date.getDay(); // JS: 0=Вс, 1=Пн, 2=Вт...
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Наш формат: 0=Пн, 1=Вт, 2=Ср...
    return hockeyHours[dayIndex + '-' + time] || false;
  };

  // Old templates (kept for manual use)
  const timeTemplates = {
    full: { name: 'Весь день', times: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'] },
    morning: { name: 'Утро', times: ['09:00','10:15','11:30','12:45'] },
    afternoon: { name: 'День', times: ['14:00','15:15','16:45','18:00'] },
    evening: { name: 'Вечер', times: ['19:15','20:30'] }
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

  const loadBookingsByChatId = async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    const result = await api.get('getBookingsByChatId', { chatId });
    setHockeyBookings(result.ok ? result.bookings || [] : []);
    setLoading(false);
  };

  // Load saved user data from database if Telegram user
  const loadUserData = async () => {
    if (!telegramUser?.chatId) {
      setUserDataLoaded(true);
      return;
    }
    
    try {
      const result = await api.get('getUserData', { chatId: telegramUser.chatId });
      if (result.ok && result.user) {
        setSavedUserData(result.user);
        // Update form with saved data - prefer fullName over firstName
        const savedName = result.user.fullName || 
          `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() ||
          `${telegramUser.firstName || ''} ${telegramUser.lastName || ''}`.trim();
        
        setClientForm(prev => ({
          ...prev,
          name: savedName || prev.name,
          phone: result.user.phone || prev.phone,
          telegram: result.user.username || prev.telegram
        }));
        // Also set phone for "My Bookings" section
        if (result.user.phone) {
          setMyBookingsPhone(result.user.phone);
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
    setUserDataLoaded(true);
  };

  useEffect(() => { 
    loadSlots();
    loadUserData();
  }, []);

  // Auto-load bookings when "My Bookings" is opened for Telegram users
  useEffect(() => {
    if (showMyBookings && isTelegramWebApp && telegramUser?.chatId) {
      loadBookingsByChatId(telegramUser.chatId);
    }
  }, [showMyBookings]);

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

  // Add single slot
  const addSingleSlot = async () => {
    if (!singleSlotDate) {
      return showToast('Выберите дату', 'error');
    }
    if (!singleSlotTime) {
      return showToast('Выберите время', 'error');
    }
    
    setLoading(true);
    const slotId = `${singleSlotDate}-${singleSlotTime}-${Date.now()}`;
    
    const result = await api.post('adminAddSlots', { 
      adminSecret: ADMIN_SECRET, 
      slots: [{ date: singleSlotDate, time: singleSlotTime, id: slotId, isHockey: singleSlotIsHockey }],
      notifySingleSlot: true
    });
    
    if (result.ok) {
      if (result.added === 0) {
        showToast('Слот уже существует на это время', 'error');
      } else {
        const notifyMsg = result.notified > 0 ? ` • Уведомлено: ${result.notified}` : '';
        const hockeyMsg = singleSlotIsHockey ? ' 🏒' : '';
        showToast(`Слот добавлен${hockeyMsg}${notifyMsg}`, 'success');
        setSingleSlotDate('');
        setSingleSlotTime('');
        setSingleSlotIsHockey(false);
      }
      await loadSlots();
    } else {
      showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    }
    setLoading(false);
  };

  // Add full week with standard schedule
  const addWeekSlots = async () => {
    // Find next Monday (or today if it's Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days until next Monday
    let daysUntilMonday;
    if (dayOfWeek === 1) {
      daysUntilMonday = 0; // Today is Monday
    } else if (dayOfWeek === 0) {
      daysUntilMonday = 1; // Today is Sunday, Monday is tomorrow
    } else {
      daysUntilMonday = 8 - dayOfWeek; // Next Monday
    }
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);
    
    const slotsToAdd = [];
    
    // Add slots for 7 days (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayIndex = i; // 0 = Monday, 6 = Sunday
      const times = weeklySchedule[dayIndex] || [];
      
      times.forEach(time => {
        slotsToAdd.push({ date: dateStr, time, id: `${dateStr}-${time}-${Date.now()}-${Math.random().toString(16).slice(2,6)}` });
      });
    }
    
    if (slotsToAdd.length === 0) {
      return showToast('Нет слотов для добавления', 'error');
    }
    
    setLoading(true);
    // notifyUsers: true - send notification to all clients about new week
    const result = await api.post('adminAddSlots', { adminSecret: ADMIN_SECRET, slots: slotsToAdd, notifyUsers: true });
    if (result.ok) {
      const mondayStr = `${startDate.getDate()}.${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const sundayDate = new Date(startDate);
      sundayDate.setDate(startDate.getDate() + 6);
      const sundayStr = `${sundayDate.getDate()}.${String(sundayDate.getMonth() + 1).padStart(2, '0')}`;
      const notifyMsg = result.notified > 0 ? ` • Уведомлено: ${result.notified}` : '';
      showToast(`Добавлено ${result.added} слотов (${mondayStr} - ${sundayStr})${notifyMsg}`, 'success');
      await loadSlots();
    } else {
      showToast('Ошибка: ' + result.error, 'error');
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
    
    // Include chatId if from Telegram Mini App
    const bookingData = {
      slotIds: selectedSlots,
      ...clientForm
    };
    
    if (telegramUser?.chatId) {
      bookingData.chatId = telegramUser.chatId;
    }
    
    const result = await api.post('createBooking', bookingData);
    
    if (result.ok) {
      setBookingSuccess(true);
      setSelectedSlots([]);
      setClientForm({ 
        name: telegramUser ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim() : '', 
        phone: '', 
        telegram: telegramUser?.username || '', 
        comment: '' 
      });
      await loadSlots();
      
      // Haptic feedback in Telegram
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } else {
      showToast('Ошибка: ' + result.error, 'error');
    }
    setLoading(false);
  };

  const requestCancellation = async () => {
    if (!cancelModal.booking) return;
    setLoading(true);
    
    // Get phone from saved data or input
    const phone = isTelegramWebApp && savedUserData?.phone 
      ? savedUserData.phone 
      : myBookingsPhone;
    
    const result = await api.post('requestCancellation', {
      bookingId: cancelModal.booking.id,
      phone: phone,
      reason: cancelReason
    });
    if (result.ok) {
      showToast('Запрос на отмену отправлен', 'success');
      setCancelModal({ open: false, booking: null });
      setCancelReason('');
      // Reload bookings
      if (isTelegramWebApp && telegramUser?.chatId) {
        await loadBookingsByChatId(telegramUser.chatId);
      } else {
        await loadBookingsByPhone(myBookingsPhone);
      }
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
    if (result.ok) { 
      showToast('Отклонено', 'success'); 
      // Small delay to ensure database is updated
      await new Promise(r => setTimeout(r, 300));
      await loadSlots(); 
      await loadAllBookings(); 
    }
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
      showToast('Запись отменена', 'success'); 
      setAdminCancelModal({ open: false, booking: null });
      setAdminCancelReason('');
      await loadSlots(); 
      await loadAllBookings(); 
    } else {
      showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    }
    setLoading(false);
  };

  const adminDeleteBooking = async () => {
    if (!adminDeleteModal.bookingId) return;
    setLoading(true);
    const result = await api.post('adminDeleteBooking', { 
      adminSecret: ADMIN_SECRET, 
      bookingId: adminDeleteModal.bookingId
    });
    if (result.ok) { 
      showToast('Запись удалена', 'success'); 
      setAdminDeleteModal({ open: false, bookingId: null });
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
      cancellation_requested: 'bg-orange-100 text-orange-700',
      deleted_by_admin: 'bg-gray-200 text-gray-500'
    };
    const labels = { 
      pending: '⏳ Ожидает', 
      confirmed: '✅ Подтверждено', 
      rejected: '❌ Отклонено', 
      cancelled: '🚫 Отменено',
      cancelled_by_admin: '🚫 Отменено тренером',
      cancellation_requested: '⚠️ Запрос отмены',
      deleted_by_admin: '🗑️ Архив'
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
              <img src={BRAND_LOGO} alt="Логотип" className="w-24 h-24 mx-auto mb-4" />
              <h1 className="text-3xl font-black">ХОККЕЙНЫЕ ТРЕНИРОВКИ</h1>
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
              
              {isTelegramWebApp && telegramUser?.chatId && (
                <div className="bg-blue-50 p-4 rounded-xl mb-4 text-left">
                  <p className="text-blue-700 text-sm">✅ Уведомления будут приходить в этот чат</p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-xl mb-4 text-left">
                <p className="text-xs text-gray-400 mb-1">📍 Место</p>
                <p className="font-semibold">Каток «Галактика»</p>
                <p className="text-gray-500 text-sm">г. Мытищи</p>
              </div>
              
              <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white p-4 rounded-xl mb-3">
                <Send size={18} /> Связаться с тренером
              </a>
              
              <button onClick={() => { setBookingSuccess(false); loadSlots(); }} className="w-full bg-black text-white p-4 rounded-xl">
                Записаться ещё
              </button>
              
              <button onClick={() => setBookingSuccess(false)} className="w-full text-gray-500 mt-3 p-2">Закрыть</button>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center"><History className="text-white" size={24} /></div>
                  <div><h2 className="text-xl font-bold">Мои записи</h2><p className="text-gray-500 text-sm">История</p></div>
                </div>
                <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">
                  <Send size={16} /> Тренер
                </a>
              </div>
              
              {/* Show phone input only for non-Telegram users */}
              {!isTelegramWebApp && (
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <input type="tel" placeholder="Ваш телефон" value={myBookingsPhone} onChange={e => setMyBookingsPhone(e.target.value)} className="w-full p-3 border-2 rounded-xl mb-3 outline-none" />
                  <button onClick={() => loadBookingsByPhone(myBookingsPhone)} disabled={loading || !myBookingsPhone} className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50">{loading ? '...' : 'Найти'}</button>
                </div>
              )}
              
              {/* Show user info for Telegram users */}
              {isTelegramWebApp && telegramUser && (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-4">
                  <p className="text-green-700 font-medium">👤 {telegramUser.firstName} {telegramUser.lastName}</p>
                  {telegramUser.username && <p className="text-green-600 text-sm">@{telegramUser.username}</p>}
                </div>
              )}
              
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
                        <button onClick={() => setCancelModal({ open: true, booking: b })} className="mt-2 text-red-500 text-sm flex items-center gap-1"><XCircle size={16} /> Запросить отмену</button>
                      )}
                    </div>
                  ))}
                  {hockeyBookings.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                      {isTelegramWebApp ? 'У вас пока нет записей' : 'Введите телефон'}
                    </div>
                  )}
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
        <div className="min-h-screen bg-gray-50 pb-44">
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-lg mx-auto p-4 flex justify-between items-center">
              <button onClick={() => setView('select')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
              <div className="flex items-center gap-2">
                <img src={BRAND_LOGO} alt="" className="w-8 h-8" />
                <span className="font-bold text-sm">Хоккейные тренировки</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-full" title="Написать тренеру">
                  <Send size={18} />
                </a>
                <button onClick={() => setShowMyBookings(true)} className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-all">
                  <History size={16} />
                  <span>Мои записи</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-w-lg mx-auto p-4">
            {/* Telegram user greeting */}
            {isTelegramWebApp && telegramUser && (
              <div className="bg-blue-50 p-3 rounded-xl mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {telegramUser.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium">{telegramUser.firstName} {telegramUser.lastName}</p>
                  {telegramUser.username && <p className="text-blue-600 text-sm">@{telegramUser.username}</p>}
                </div>
              </div>
            )}
            
            {loading ? <Spinner /> : (
              <>
                <div className="text-center mb-4">
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
                      const isWeekendDay = isWeekend(dateStr);
                      const isWeekendLocked = isWeekendDay && !areWeekendsOpen();
                      
                      const handleDayClick = () => {
                        if (isPast) return;
                        if (isWeekendLocked) {
                          showToast('📅 Запись на выходные откроется в пятницу в 17:00', 'info');
                          return;
                        }
                        if (isAvailable) {
                          setClientSelectedDate(dateStr);
                        }
                      };
                      
                      return (
                        <button 
                          key={day} 
                          onClick={handleDayClick} 
                          disabled={isPast || (!isAvailable && !isWeekendLocked)}
                          className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-black text-white scale-110' 
                              : isWeekendLocked && isAvailable
                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                : isAvailable 
                                  ? 'bg-green-100 text-green-700' 
                                  : isPast 
                                    ? 'text-gray-300' 
                                    : 'text-gray-400'
                          }`}
                        >
                          <div>{day}</div>
                          {isWeekendLocked && isAvailable && <div className="text-xs">🔒</div>}
                        </button>
                      );
                    })}
                  </div>
                  {/* Weekend notice */}
                  {!areWeekendsOpen() && availableDates.some(d => isWeekend(d)) && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <p className="text-yellow-700 text-sm">📅 Запись на Сб и Вс откроется в пятницу в 17:00</p>
                    </div>
                  )}
                </div>
                {clientSelectedDate && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <h3 className="font-bold mb-3">{formatDate(clientSelectedDate)}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {getSlotsForDate(clientSelectedDate).map(slot => {
                        const isHockey = isHockeyHour(clientSelectedDate, slot.time, slot);
                        const isSelected = selectedSlots.includes(slot.id);
                        return (
                          <button 
                            key={slot.id} 
                            onClick={() => setSelectedSlots(p => p.includes(slot.id) ? p.filter(id => id !== slot.id) : [...p, slot.id])}
                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                              isSelected 
                                ? 'bg-black text-white' 
                                : isHockey 
                                  ? 'bg-blue-100 border-2 border-blue-300' 
                                  : 'bg-gray-100'
                            }`}
                          >
                            <div>{slot.time}</div>
                            {isHockey && <div className={`text-xs mt-1 ${isSelected ? 'text-blue-200' : 'text-blue-600'}`}>🏒 Хоккейный час</div>}
                          </button>
                        );
                      })}
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
          
          {/* Bottom booking form */}
          {selectedSlots.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
              <div className="max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Имя Фамилия *" 
                    value={clientForm.name} 
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })} 
                    className={`p-3 border-2 rounded-xl text-sm outline-none focus:border-black ${savedUserData?.firstName ? 'bg-gray-50' : ''}`}
                    readOnly={isTelegramWebApp && !!savedUserData?.firstName}
                  />
                  <input 
                    type="tel" 
                    placeholder="+7XXXXXXXXXX" 
                    value={clientForm.phone} 
                    onChange={e => {
                      let val = e.target.value;
                      // Ensure +7 prefix stays
                      if (!val.startsWith('+7')) {
                        val = '+7' + val.replace(/^\+?7?/, '');
                      }
                      // Remove non-digit characters except +
                      val = '+7' + val.slice(2).replace(/\D/g, '');
                      // Limit to +7 + 10 digits
                      if (val.length > 12) val = val.slice(0, 12);
                      setClientForm({ ...clientForm, phone: val });
                    }}
                    className={`p-3 border-2 rounded-xl text-sm outline-none focus:border-black ${savedUserData?.phone ? 'bg-gray-50' : ''}`}
                    readOnly={isTelegramWebApp && !!savedUserData?.phone}
                  />
                </div>
                {isTelegramWebApp && savedUserData?.phone && (
                  <p className="text-green-600 text-xs mb-2 ml-1">✓ Ваши данные сохранены</p>
                )}
                <div className="mb-3">
                  <input 
                    type="text" 
                    placeholder="Telegram (для уведомлений)" 
                    value={clientForm.telegram} 
                    onChange={e => setClientForm({ ...clientForm, telegram: e.target.value })} 
                    className={`w-full p-3 border-2 rounded-xl text-sm outline-none focus:border-black ${isTelegramWebApp && telegramUser?.username ? 'bg-gray-50' : ''}`}
                    readOnly={isTelegramWebApp && !!telegramUser?.username}
                  />
                  {isTelegramWebApp && telegramUser?.chatId && (
                    <p className="text-green-600 text-xs mt-1 ml-1">✓ Уведомления включены</p>
                  )}
                </div>
                <button onClick={submitBooking} disabled={loading || !clientForm.name || !clientForm.phone} className="w-full bg-black text-white p-4 rounded-xl font-bold disabled:opacity-50">
                  {loading ? '...' : `Записаться • ${selectedSlots.length} ${selectedSlots.length === 1 ? 'слот' : 'слота'}`}
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
          <p className="text-gray-600 mb-4">Клиент получит уведомление об отмене.</p>
          <textarea 
            placeholder="Причина отмены (необязательно)" 
            value={adminCancelReason} 
            onChange={e => setAdminCancelReason(e.target.value)} 
            className="w-full p-3 border-2 rounded-xl mb-4 outline-none focus:border-red-300" 
            rows={3} 
          />
          <div className="flex gap-3">
            <button onClick={() => { setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason(''); }} className="flex-1 p-3 border-2 rounded-xl">Назад</button>
            <button onClick={adminCancelBooking} disabled={loading} className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50">{loading ? '...' : '🚫 Отменить'}</button>
          </div>
        </Modal>

        {/* Admin Delete Modal */}
        <Modal 
          isOpen={adminDeleteModal.open} 
          onClose={() => setAdminDeleteModal({ open: false, bookingId: null })}
          title="Удаление записи"
        >
          <p className="text-gray-600 mb-4">Удалить эту запись из истории? Это действие нельзя отменить.</p>
          <div className="flex gap-3">
            <button onClick={() => setAdminDeleteModal({ open: false, bookingId: null })} className="flex-1 p-3 border-2 rounded-xl">Отмена</button>
            <button onClick={adminDeleteBooking} disabled={loading} className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50">{loading ? '...' : '🗑️ Удалить'}</button>
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
                <button onClick={() => setAdminTab('main')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'main' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                  <Calendar size={16} /> Главная
                </button>
                <button onClick={() => setAdminTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'history' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                  <Users size={16} /> Записи ({allBookings.length})
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
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm"><div className="text-2xl font-bold">{availableSlots.length}</div><div className="text-xs text-gray-500">Свободно</div></div>
                  <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200"><div className="text-2xl font-bold text-yellow-600">{Object.keys(pendingBookings).length}</div><div className="text-xs text-yellow-600">Заявок</div></div>
                  <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200"><div className="text-2xl font-bold text-green-600">{confirmedSlots.length}</div><div className="text-xs text-green-600">Подтв.</div></div>
                  <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200"><div className="text-2xl font-bold text-orange-600">{pendingCancellations.length}</div><div className="text-xs text-orange-600">Отмен</div></div>
                </div>

                {/* Weekend Control Panel */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border-2 border-gray-200">
                  <h2 className="font-bold mb-3 flex items-center gap-2">⚙️ Управление выходными (Сб, Вс)</h2>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm">
                        Статус: {areWeekendsOpen() 
                          ? <span className="text-green-600 font-bold">✅ Открыты для записи</span> 
                          : <span className="text-yellow-600 font-bold">🔒 Закрыты</span>
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {weekendManualOverride === null 
                          ? '⏰ Авто-режим: откроются в Пт 17:00' 
                          : weekendManualOverride 
                            ? '👆 Открыты вручную' 
                            : '👆 Закрыты вручную'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {areWeekendsOpen() ? (
                        <button 
                          onClick={() => setWeekendManualOverride(false)} 
                          className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-medium"
                        >
                          🔒 Скрыть выходные
                        </button>
                      ) : (
                        <button 
                          onClick={() => setWeekendManualOverride(true)} 
                          className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
                        >
                          🔓 Открыть сейчас
                        </button>
                      )}
                      {weekendManualOverride !== null && (
                        <button 
                          onClick={() => setWeekendManualOverride(null)} 
                          className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-medium"
                        >
                          ↩️ Авто
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cancellations */}
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
                              <p className="font-bold text-lg">{booking?.name || 'Неизвестно'}</p>
                              <p className="text-sm text-gray-600">📞 {booking?.phone || c.phone}</p>
                              {booking?.telegram && <p className="text-sm text-gray-600">✈️ @{booking.telegram}</p>}
                              <p className="text-sm text-gray-500 mt-1">📅 {slots.map(s => `${s.date} ${s.time}`).join(', ')}</p>
                              {c.reason && <p className="text-sm text-orange-600 mt-1">💬 {c.reason}</p>}
                            </div>
                            <div className="flex gap-2 items-start">
                              <button onClick={() => approveCancellation(c.id)} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm disabled:opacity-50">✅</button>
                              <button onClick={() => rejectCancellation(c.id)} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">❌</button>
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
                      const d = allBookings.find(b => b.id === id) || {};
                      const phone = d.phone || booking.phone || '';
                      const name = d.name || booking.name || '—';
                      const telegram = d.telegram || booking.telegram || '';
                      return (
                        <div key={id} className="bg-white p-4 rounded-xl mb-2">
                          <div className="flex justify-between flex-wrap gap-3">
                            <div>
                              <p className="font-bold">{name}</p>
                              <p className="text-sm text-gray-600">📞 {phone || 'Нет телефона'}</p>
                              {telegram && <p className="text-sm text-gray-600">✈️ @{telegram}</p>}
                              <p className="text-sm text-gray-500">🕐 {booking.slots.map(s => `${s.date} ${s.time}`).join(', ')}</p>
                            </div>
                            <div className="flex gap-2 items-start">
                              {phone && <a href={`tel:${phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Phone size={20} /></a>}
                              {telegram && <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Send size={20} /></a>}
                              <button onClick={() => confirmBooking(id)} disabled={loading} className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm disabled:opacity-50">✅</button>
                              <button onClick={() => rejectBooking(id)} disabled={loading} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">❌</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Slots Calendar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={20} /> Добавить слоты</h2>
                  
                  {/* Add Single Slot */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-sm font-medium mb-3">➕ Добавить один слот</p>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="date" 
                        value={singleSlotDate} 
                        onChange={e => setSingleSlotDate(e.target.value)}
                        min={today}
                        className="flex-1 p-2 border-2 rounded-lg text-sm"
                        placeholder="Дата"
                      />
                      <input 
                        type="time" 
                        value={singleSlotTime} 
                        onChange={e => setSingleSlotTime(e.target.value)}
                        step="60"
                        className="flex-1 p-2 border-2 rounded-lg text-sm"
                        placeholder="Время"
                      />
                    </div>
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={singleSlotIsHockey}
                        onChange={e => setSingleSlotIsHockey(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">🏒 Хоккейный час</span>
                    </label>
                    {singleSlotDate && singleSlotTime && (
                      <p className="text-xs text-gray-500 mb-2">📅 {singleSlotDate} в {singleSlotTime}</p>
                    )}
                    <button 
                      onClick={addSingleSlot} 
                      disabled={!singleSlotDate || !singleSlotTime || loading}
                      className="w-full bg-blue-500 text-white p-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? '⏳ Добавление...' : !singleSlotDate ? '📅 Выберите дату' : !singleSlotTime ? '🕐 Выберите время' : '✅ Добавить слот'}
                    </button>
                  </div>
                  
                  {/* Quick Add Week Button */}
                  <button 
                    onClick={addWeekSlots} 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl font-bold mb-4 disabled:opacity-50 hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    {loading ? '...' : '📅 Добавить неделю (стандартное расписание)'}
                  </button>
                  
                  <div className="text-center text-gray-400 text-sm mb-4">— или выберите дни вручную —</div>
                  
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
                  <button onClick={addSlotsFromCalendar} disabled={selectedDates.length === 0 || loading} className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50">{loading ? '...' : 'Добавить выбранные'}</button>
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
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><List size={20} /> Фильтр</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'Все', count: allBookings.length },
                      { key: 'pending', label: '⏳ Ожидают', count: allBookings.filter(b => b.status === 'pending').length },
                      { key: 'confirmed', label: '✅ Подтв.', count: allBookings.filter(b => b.status === 'confirmed').length },
                      { key: 'cancellation_requested', label: '⚠️ Запрос', count: allBookings.filter(b => b.status === 'cancellation_requested').length },
                      { key: 'cancelled', label: '🚫 Отмена', count: allBookings.filter(b => b.status === 'cancelled' || b.status === 'cancelled_by_admin').length },
                      { key: 'rejected', label: '❌ Откл.', count: allBookings.filter(b => b.status === 'rejected').length },
                    ].map(f => (
                      <button key={f.key} onClick={() => setHistoryFilter(f.key)} className={`px-3 py-2 rounded-xl text-sm ${historyFilter === f.key ? 'bg-black text-white' : 'bg-gray-100'}`}>
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center text-gray-500">Нет записей</div>
                  ) : (
                    filteredBookings.map(booking => {
                      const slots = parseSlotIds(booking.slotIds);
                      return (
                        <div key={booking.id} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${
                          booking.status === 'confirmed' ? 'border-l-green-500' :
                          booking.status === 'pending' ? 'border-l-yellow-500' :
                          booking.status === 'cancellation_requested' ? 'border-l-orange-500' :
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
                              <p className="text-gray-500 text-sm mt-1">📅 {slots.map(s => `${s.date} ${s.time}`).join(', ')}</p>
                              {booking.comment && <p className="text-gray-500 text-sm">💬 {booking.comment}</p>}
                              <p className="text-gray-400 text-xs mt-2">Создано: {formatDateTime(booking.createdAt)}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {booking.phone && <a href={`tel:${booking.phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={18} /></a>}
                              {booking.telegram && <a href={`https://t.me/${booking.telegram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg text-sm">✈️</a>}
                              {/* Buttons for cancellation request */}
                              {booking.status === 'cancellation_requested' && (
                                <>
                                  <button 
                                    onClick={async () => {
                                      const c = cancellations.find(x => x.bookingId === booking.id && x.status === 'pending');
                                      if (c) await approveCancellation(c.id);
                                      else showToast('Запрос не найден', 'error');
                                    }} 
                                    disabled={loading}
                                    className="px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm disabled:opacity-50"
                                    title="Подтвердить отмену"
                                  >
                                    ✅
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const c = cancellations.find(x => x.bookingId === booking.id && x.status === 'pending');
                                      if (c) await rejectCancellation(c.id);
                                      else showToast('Запрос не найден', 'error');
                                    }} 
                                    disabled={loading}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm disabled:opacity-50"
                                    title="Отклонить отмену"
                                  >
                                    ❌
                                  </button>
                                </>
                              )}
                              {/* Button for admin cancel */}
                              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                <button onClick={() => setAdminCancelModal({ open: true, booking })} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm">🚫</button>
                              )}
                              <button 
                                onClick={() => setAdminDeleteModal({ open: true, bookingId: booking.id })} 
                                disabled={loading}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                                title="Удалить из истории"
                              >
                                <Trash2 size={16} />
                              </button>
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
