import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, ChevronLeft, ChevronRight, Phone, ArrowLeft, X, History, AlertCircle, List, Users, Send } from 'lucide-react';

// API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbwU4zvZ_AxMSC6mXQB0KDz5DysHU68MXVOUL5kyejtWnta3fRT6hJZFXY575fX_g1wRgg/exec';
const ADMIN_SECRET = 'ShsHockey_2026_!Seleznev';

// Hockey puck logo
const BRAND_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='45' ry='25' fill='%23111'/%3E%3Cellipse cx='50' cy='45' rx='45' ry='25' fill='%23333'/%3E%3Cellipse cx='50' cy='45' rx='35' ry='18' fill='none' stroke='%23555' stroke-width='2'/%3E%3C/svg%3E";

const TRAINER_TELEGRAM = "seleznev_88";

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
const isTelegramWebApp = !!tg;

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

if (isTelegramWebApp) {
  tg.ready();
  tg.expand();
  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

const telegramUser = getTelegramUser();

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

// ── Toast ──────────────────────────────────────────────
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

// ── Modal ──────────────────────────────────────────────
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

// ── Spinner ────────────────────────────────────────────
const Spinner = () => (
  <div className="flex justify-center py-8">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>
);

// ── Initials Avatar ────────────────────────────────────
const Avatar = ({ name, size = 40 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#111827', '#1e3a5f', '#14532d', '#7c2d12', '#4c1d95'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800,
      fontSize: size * 0.38,
      flexShrink: 0, letterSpacing: '-0.5px'
    }}>
      {initials}
    </div>
  );
};

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#fff1f0', border: '1px solid #fca5a5', borderRadius: 16, padding: 24, margin: 12 }}>
          <p style={{ fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>⚠️ Ошибка в этом разделе</p>
          <p style={{ fontSize: 12, color: '#7f1d1d', fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(this.state.error)}</p>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Попробовать снова</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Clients Tab Component ────────────────────────────────────────────────────
const ClientsTab = ({ allBookings, hockeySlots, clientSearch, setClientSearch, clientSort, setClientSort, showToast, PRICE_PER_SESSION }) => {
  // Guard: wait for data
  const bookings = Array.isArray(allBookings) ? allBookings : [];
  const slots = Array.isArray(hockeySlots) ? hockeySlots : [];

  // Build slotMap: id → slot (for date lookup)
  const slotMap = {};
  slots.forEach(s => { if (s && s.id) slotMap[String(s.id)] = s; });

  // Build unique clients map keyed by phone digits (or telegram or name)
  const clientMap = {};
  bookings.forEach(b => {
    try {
      if (!b || b.status === 'deleted_by_admin') return;
      const key = (String(b.phone || '').replace(/\D/g, '')) || String(b.telegram || '') || String(b.name || '');
      if (!key) return;

      if (!clientMap[key]) {
        clientMap[key] = { name: b.name || '—', phone: b.phone || '', telegram: b.telegram || '', chatId: b.chatId || '', confirmedSessions: 0, lastDate: '', types: {}, ratings: [], streak: 0 };
      }
      const c = clientMap[key];
      if (String(b.name || '').length > c.name.length) c.name = b.name;
      if (b.chatId && !c.chatId) c.chatId = b.chatId;
      if (b.telegram && !c.telegram) c.telegram = b.telegram;

      if (b.status === 'confirmed') {
        const slotIds = String(b.slotIds || '').split(',').map(x => x.trim()).filter(Boolean);
        c.confirmedSessions += slotIds.length || 1;
        const t = b.trainingType || 'Не указан';
        c.types[t] = (c.types[t] || 0) + 1;
        if (b.rating) { const r = parseInt(b.rating, 10); if (r >= 1 && r <= 5) c.ratings.push(r); }
        slotIds.forEach(sid => {
          const slot = slotMap[sid];
          if (slot && slot.date && String(slot.date) > c.lastDate) c.lastDate = String(slot.date);
        });
      }
    } catch(e) { /* skip bad booking */ }
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const isActive = (c) => { try { return c.lastDate && new Date(c.lastDate + 'T00:00:00') >= thirtyDaysAgo; } catch(e) { return false; } };

  let clients = Object.values(clientMap);
  const q = (clientSearch || '').toLowerCase().trim();
  if (q) clients = clients.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    (c.telegram || '').toLowerCase().includes(q)
  );

  clients.sort((a, b) => {
    try {
      if (clientSort === 'sessions') return b.confirmedSessions - a.confirmedSessions;
      if (clientSort === 'lastDate') return String(b.lastDate).localeCompare(String(a.lastDate));
      if (clientSort === 'name') return String(a.name).localeCompare(String(b.name), 'ru');
    } catch(e) {}
    return 0;
  });

  const activeCount = clients.filter(isActive).length;
  const totalSessions = clients.reduce((s, c) => s + (c.confirmedSessions || 0), 0);

  const formatLastDate = (dateStr) => {
    try {
      if (!dateStr) return '—';
      const months = ['','янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
      const p = String(dateStr).split('-');
      if (p.length < 3) return '—';
      return `${parseInt(p[2])} ${months[parseInt(p[1])]} ${p[0]}`;
    } catch(e) { return '—'; }
  };

  const getFavoriteType = (types) => {
    try {
      const entries = Object.entries(types || {});
      if (!entries.length) return null;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    } catch(e) { return null; }
  };

  return (
    <>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 16, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{clients.length}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Клиентов</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 16, textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a' }}>{activeCount}</div>
          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>Активных</div>
        </div>
        <div style={{ background: '#111', padding: 16, borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{totalSessions}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Тренировок</div>
        </div>
      </div>

      {/* Search + sort */}
      <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Имя, телефон или @telegram"
          value={clientSearch || ''} onChange={e => setClientSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ key: 'sessions', label: '🏆 По тренировкам' }, { key: 'lastDate', label: '📅 По дате' }, { key: 'name', label: '🔤 По имени' }].map(s => (
            <button key={s.key} onClick={() => setClientSort(s.key)}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: clientSort === s.key ? '#111' : '#f3f4f6', color: clientSort === s.key ? '#fff' : '#6b7280' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {clients.length === 0 ? (
        <div style={{ background: '#fff', padding: '40px 24px', borderRadius: 16, textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>👥</p>
          <p style={{ fontWeight: 600, color: '#6b7280' }}>{q ? 'Никого не найдено' : 'Клиентов пока нет'}</p>
          {!q && <p style={{ fontSize: 13, marginTop: 6 }}>Клиенты появятся после первых подтверждённых записей</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((c, idx) => {
            const active = isActive(c);
            const favType = getFavoriteType(c.types);
            const earned = (c.confirmedSessions || 0) * (PRICE_PER_SESSION || 2000);
            const avgRating = c.ratings && c.ratings.length > 0
              ? (c.ratings.reduce((s, r) => s + r, 0) / c.ratings.length)
              : 0;
            return (
              <div key={idx} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', borderLeft: `3px solid ${active ? '#22c55e' : '#e5e7eb'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <Avatar name={c.name} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>{c.name}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: active ? '#f0fdf4' : '#f9fafb', color: active ? '#16a34a' : '#9ca3af', border: `1px solid ${active ? '#bbf7d0' : '#f0f0f0'}` }}>
                          {active ? '● Активный' : '○ Неактивный'}
                        </span>
                      </div>
                      {c.phone ? (
                        <button onClick={() => { try { navigator.clipboard.writeText(c.phone).then(() => showToast && showToast(`📞 ${c.phone} скопирован`, 'success')); } catch(e){} }}
                          style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 3, display: 'block' }}>
                          📞 {c.phone}
                        </button>
                      ) : null}
                      {c.telegram ? (
                        <a href={`https://t.me/${c.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', display: 'block', marginTop: 2 }}>
                          ✈️ @{c.telegram.replace('@','')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1 }}>{c.confirmedSessions}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>тренировок</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {favType && <span style={{ fontSize: 11, color: '#6b7280', background: '#f9fafb', border: '1px solid #f0f0f0', padding: '3px 8px', borderRadius: 8 }}>{favType}</span>}
                    {c.streak > 0 && <span style={{ fontSize: 11, background: '#fff7ed', border: '1px solid #fed7aa', padding: '3px 8px', borderRadius: 8, color: '#ea580c', fontWeight: 700 }}>🔥 {c.streak}</span>}
                    {avgRating > 0 && <span style={{ fontSize: 11, background: '#fefce8', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: 8, color: '#a16207' }}>⭐ {avgRating.toFixed(1)}</span>}
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>📅 {formatLastDate(c.lastDate)}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{earned.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const BookingSystem = () => {
  // Онбординг: показываем один раз при первом визите
  const isFirstVisit = (() => {
    try { return !localStorage.getItem('shs_onboarded'); } catch(e) { return false; }
  })();
  const [view, setView] = useState(isFirstVisit ? 'onboarding' : 'select');
  const [onboardStep, setOnboardStep] = useState(0);
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

  const [savedUserData, setSavedUserData] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const [clientForm, setClientForm] = useState({
    name: telegramUser ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim() : '',
    phone: '+7',
    telegram: telegramUser?.username || '',
    comment: '',
    birthDate: ''
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [trainingType, setTrainingType] = useState('');
  const [clientSelectedDate, setClientSelectedDate] = useState(null);
  const [clientMonth, setClientMonth] = useState(new Date());
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myBookingsPhone, setMyBookingsPhone] = useState('');

  const [slotsToDelete, setSlotsToDelete] = useState([]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');

  const [adminTab, setAdminTab] = useState('main');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [financeFilter, setFinanceFilter] = useState('month');
  const [clientSearch, setClientSearch] = useState('');
  const [clientSort, setClientSort] = useState('sessions'); // 'sessions' | 'lastDate' | 'name'

  // Цена за одну тренировку (меняется здесь)
  const PRICE_PER_SESSION = 2000;
  const BOOKING_CUTOFF_HOURS = 1.5; // Запись закрывается за 1:30 до занятия

  // Returns true if slot is still open for booking (more than CUTOFF hours away)
  const isSlotBookable = (dateStr, timeStr) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const slotDate = new Date(dateStr + 'T00:00:00');
      slotDate.setHours(h, m, 0, 0);
      const cutoff = new Date(slotDate.getTime() - BOOKING_CUTOFF_HOURS * 60 * 60 * 1000);
      return new Date() < cutoff;
    } catch (e) { return true; }
  };

  const [adminCancelModal, setAdminCancelModal] = useState({ open: false, booking: null });
  const [adminCancelReason, setAdminCancelReason] = useState('');
  const [adminDeleteModal, setAdminDeleteModal] = useState({ open: false, bookingId: null });

  const [singleSlotDate, setSingleSlotDate] = useState('');
  const [singleSlotTime, setSingleSlotTime] = useState('');
  const [singleSlotIsHockey, setSingleSlotIsHockey] = useState(false);
  const [slotCart, setSlotCart] = useState([]); // корзина слотов перед отправкой
  const [notifyOnAdd, setNotifyOnAdd] = useState(true); // уведомлять клиентов при добавлении
  // Реферал
  const [refCode, setRefCode] = useState(''); // код реферера из URL
  const [myRefCode, setMyRefCode] = useState(''); // мой реф.код
  const [myRefCount, setMyRefCount] = useState(0);
  const [myRefDiscount, setMyRefDiscount] = useState(0);
  // Streak
  const [myStreak, setMyStreak] = useState(0);
  const [myMaxStreak, setMyMaxStreak] = useState(0);

  // Bookings filter tabs for "My bookings"
  const [myBookingsFilter, setMyBookingsFilter] = useState('upcoming');

  // Состояние выходных — читается с сервера ('true' | 'false' | 'auto')
  // null = ещё не загружено
  const [weekendsOpenStatus, setWeekendsOpenStatus] = useState(null);

  // Вычисляет, открыты ли выходные.
  // weekendsOpenStatus: 'true' | 'false' | 'auto' | null(загрузка)
  const areWeekendsOpen = () => {
    if (weekendsOpenStatus === 'true') return true;
    if (weekendsOpenStatus === 'false') return false;
    // 'auto' или null — авторежим по времени клиента
    const now = new Date();
    const day = now.getDay(), hour = now.getHours();
    if (day === 5 && hour >= 17) return true;
    if (day === 6) return true;
    if (day === 0) return true;
    return false;
  };

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return day === 0 || day === 6;
  };

  const weeklySchedule = {
    0: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'],
    1: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'],
    2: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15'],
    3: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'],
    4: ['09:00','10:15','11:30','12:45','14:00','15:15','16:45','18:00','19:15','20:30'],
    5: ['09:00','10:15','11:30','12:45','14:00','15:15','16:30','17:45','19:00','20:15'],
    6: ['09:00','10:15','11:30','12:45','14:00','15:15','16:30','17:45','19:00','20:15']
  };

  const hockeyHours = {
    '0-14:00': true, '1-15:15': true, '2-14:00': true, '3-15:15': true, '4-14:00': true
  };

  const isHockeyHour = (dateStr, time, slot = null) => {
    if (slot && slot.isHockey) return true;
    const date = new Date(dateStr + 'T00:00:00');
    const jsDay = date.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    return hockeyHours[dayIndex + '-' + time] || false;
  };

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

  // Read ref code from URL (?ref=CODE or Telegram ?startapp=ref_CODE)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('startapp') || '';
      if (ref && ref.indexOf('ref_') === 0) setRefCode(ref.replace('ref_', ''));
      else if (ref) setRefCode(ref);
    } catch(e) {}
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    const result = await api.get('getSlots');
    if (result.ok) {
      setHockeySlots(result.slots || []);
      // Читаем статус выходных из ответа сервера
      if (result.weekendsOpen !== undefined) {
        setWeekendsOpenStatus(String(result.weekendsOpen));
      }
    }
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

  const loadMyRefData = async () => {
    if (!telegramUser?.chatId) {
      showToast('Откройте приложение через Telegram', 'error');
      return;
    }
    try {
      const r = await api.post('getMyRefCode', { chatId: telegramUser.chatId });
      if (r.ok && r.refCode) {
        setMyRefCode(r.refCode);
        setMyRefCount(r.refCount || 0);
        setMyRefDiscount(r.refDiscount || 0);
      } else {
        showToast('Не удалось получить ссылку', 'error');
      }
    } catch(e) {
      showToast('Ошибка сети', 'error');
    }
  };

  const loadMyStreakData = async () => {
    if (!telegramUser?.chatId) return;
    try {
      const r = await api.get('getUserData', { chatId: telegramUser.chatId });
      if (r.ok && r.user) {
        setMyStreak(parseInt(r.user.streakCount || '0', 10));
        setMyMaxStreak(parseInt(r.user.maxStreak || '0', 10));
      }
    } catch(e) {}
  };

  const loadBookingsByChatId = async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    const result = await api.get('getBookingsByChatId', { chatId });
    setHockeyBookings(result.ok ? result.bookings || [] : []);
    setLoading(false);
  };

  const loadUserData = async () => {
    if (!telegramUser?.chatId) { setUserDataLoaded(true); return; }
    try {
      const result = await api.get('getUserData', { chatId: telegramUser.chatId });
      if (result.ok && result.user) {
        setSavedUserData(result.user);
        const savedName = result.user.fullName ||
          `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() ||
          `${telegramUser.firstName || ''} ${telegramUser.lastName || ''}`.trim();
        setClientForm(prev => ({
          ...prev,
          name: savedName || prev.name,
          phone: result.user.phone || prev.phone,
          telegram: result.user.username || prev.telegram
        }));
        if (result.user.phone) setMyBookingsPhone(result.user.phone);
      }
    } catch (e) { console.error('Error loading user data:', e); }
    setUserDataLoaded(true);
  };

  useEffect(() => { loadSlots(); loadUserData(); }, []);

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
      await loadSlots(); setSelectedDates([]);
    }
    setLoading(false);
  };

  // Добавить в корзину (без отправки на сервер)
  const addToSlotCart = () => {
    if (!singleSlotDate) return showToast('Выберите дату', 'error');
    if (!singleSlotTime) return showToast('Выберите время', 'error');
    const key = singleSlotDate + '|' + singleSlotTime;
    if (slotCart.some(s => s.date === singleSlotDate && s.time === singleSlotTime))
      return showToast('Этот слот уже в корзине', 'error');
    setSlotCart(prev => [...prev, { date: singleSlotDate, time: singleSlotTime, isHockey: singleSlotIsHockey, key }]);
    setSingleSlotDate(''); setSingleSlotTime(''); setSingleSlotIsHockey(false);
    showToast('Слот добавлен в корзину', 'info');
  };

  // Отправить все слоты из корзины разом
  const addSingleSlot = async () => {
    const cart = slotCart.length > 0 ? slotCart : (
      singleSlotDate && singleSlotTime
        ? [{ date: singleSlotDate, time: singleSlotTime, isHockey: singleSlotIsHockey }]
        : null
    );
    if (!cart || cart.length === 0) return showToast('Корзина пуста — добавьте слоты', 'error');
    setLoading(true);
    const slots = cart.map(s => ({
      date: s.date, time: s.time, isHockey: s.isHockey,
      id: `${s.date}-${s.time}-${Date.now()}-${Math.random().toString(16).slice(2,6)}`
    }));
    const result = await api.post('adminAddSlots', {
      adminSecret: ADMIN_SECRET,
      slots,
      notifySingleSlot: notifyOnAdd && cart.length === 1,
      notifyUsers: notifyOnAdd && cart.length > 1
    });
    if (result.ok) {
      if (result.added === 0) showToast('Все эти слоты уже существуют', 'error');
      else {
        const notifyMsg = result.notified > 0 ? ` • Уведомлено: ${result.notified}` : (notifyOnAdd ? '' : ' • без уведомлений');
        showToast(`Добавлено ${result.added} слот(ов)${notifyMsg}`, 'success');
        setSlotCart([]); setSingleSlotDate(''); setSingleSlotTime(''); setSingleSlotIsHockey(false);
      }
      await loadSlots();
    } else showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    setLoading(false);
  };

  const addWeekSlots = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysUntilMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilMonday);
    startDate.setHours(0, 0, 0, 0);
    const slotsToAdd = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      (weeklySchedule[i] || []).forEach(time => {
        slotsToAdd.push({ date: dateStr, time, id: `${dateStr}-${time}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` });
      });
    }
    if (slotsToAdd.length === 0) return showToast('Нет слотов для добавления', 'error');
    setLoading(true);
    const result = await api.post('adminAddSlots', { adminSecret: ADMIN_SECRET, slots: slotsToAdd, notifyUsers: true });
    if (result.ok) {
      const mondayStr = `${startDate.getDate()}.${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const sundayDate = new Date(startDate); sundayDate.setDate(startDate.getDate() + 6);
      const sundayStr = `${sundayDate.getDate()}.${String(sundayDate.getMonth() + 1).padStart(2, '0')}`;
      showToast(`Добавлено ${result.added} слотов (${mondayStr} - ${sundayStr})${result.notified > 0 ? ` • ${result.notified}` : ''}`, 'success');
      await loadSlots();
    } else showToast('Ошибка: ' + result.error, 'error');
    setLoading(false);
  };

  const deleteSelectedSlots = async () => {
    if (slotsToDelete.length === 0) return;
    setLoading(true);
    const result = await api.post('adminDeleteSlots', { adminSecret: ADMIN_SECRET, slotIds: slotsToDelete });
    if (result.ok) {
      showToast(`Удалено ${result.deleted} слотов`, 'success');
      await loadSlots(); setSlotsToDelete([]); setShowDeleteMode(false);
    }
    setLoading(false);
  };

  const submitBooking = async () => {
    if (!clientForm.name || !clientForm.phone || selectedSlots.length === 0)
      return showToast('Заполните имя и телефон', 'error');
    // Дополнительная проверка — не пропустить запись на заблокированный выходной
    const hasLockedWeekend = selectedSlots.some(sid => {
      const slot = hockeySlots.find(s => s.id === sid);
      return slot && isWeekend(slot.date) && !areWeekendsOpen();
    });
    if (hasLockedWeekend) return showToast('📅 Запись на выходные ещё не открыта', 'error');
    const selectedSlotObjects = selectedSlots.map(sid => hockeySlots.find(s => s.id === sid)).filter(Boolean);
    const allHockey = selectedSlotObjects.length > 0 && selectedSlotObjects.every(s => isHockeyHour(s.date, s.time, s));
    if (!allHockey && !trainingType) return showToast('Выберите тип тренировки', 'error');
    setLoading(true);
    let trainingTypeLabel = '';
    if (allHockey) trainingTypeLabel = '🏒 Хоккейный час';
    else if (trainingType === 'skating') trainingTypeLabel = '⛸️ Катание';
    else if (trainingType === 'ofp') trainingTypeLabel = '🏋️ ОФП';
    else if (trainingType === 'shooting') trainingTypeLabel = '🎯 Бросковая зона';
    const bookingData = { slotIds: selectedSlots, ...clientForm, trainingType: trainingTypeLabel };
    if (refCode) bookingData.refCode = refCode;
    if (telegramUser?.chatId) bookingData.chatId = telegramUser.chatId;
    const result = await api.post('createBooking', bookingData);
    if (result.ok) {
      setBookingSuccess(true); setSelectedSlots([]); setTrainingType('');
      setClientForm({ name: telegramUser ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim() : '', phone: '', telegram: telegramUser?.username || '', comment: '', birthDate: '' });
      if (refCode) setRefCode(''); // сбрасываем реф.код после использования
      if (result.refDiscount > 0) showToast(`🎁 Скидка ${result.refDiscount}% применена!`, 'success');
      await loadSlots();
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else showToast('Ошибка: ' + result.error, 'error');
    setLoading(false);
  };

  const requestCancellation = async () => {
    if (!cancelModal.booking) return;
    setLoading(true);
    const phone = isTelegramWebApp && savedUserData?.phone ? savedUserData.phone : myBookingsPhone;
    const result = await api.post('requestCancellation', { bookingId: cancelModal.booking.id, phone, reason: cancelReason });
    if (result.ok) {
      showToast('Запрос на отмену отправлен', 'success');
      setCancelModal({ open: false, booking: null }); setCancelReason('');
      if (isTelegramWebApp && telegramUser?.chatId) await loadBookingsByChatId(telegramUser.chatId);
      else await loadBookingsByPhone(myBookingsPhone);
    } else showToast('Ошибка: ' + result.error, 'error');
    setLoading(false);
  };

  const confirmBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminConfirmBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) { showToast('Подтверждено', 'success'); await loadSlots(); await loadAllBookings(); await loadCancellations(); }
    else showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    setLoading(false);
  };

  const rejectBooking = async (bookingId) => {
    setLoading(true);
    const result = await api.post('adminRejectBooking', { adminSecret: ADMIN_SECRET, bookingId });
    if (result.ok) {
      showToast('Отклонено', 'success');
      await new Promise(r => setTimeout(r, 300));
      await loadSlots(); await loadAllBookings(); await loadCancellations();
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
    if (!bookingId) { showToast('Ошибка: ID записи не найден', 'error'); return; }
    setLoading(true);
    const result = await api.post('adminCancelBooking', { adminSecret: ADMIN_SECRET, bookingId, reason: adminCancelReason });
    if (result.ok) {
      showToast('Запись отменена', 'success');
      setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason('');
      await loadSlots(); await loadAllBookings();
    } else showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    setLoading(false);
  };

  const adminDeleteBooking = async () => {
    if (!adminDeleteModal.bookingId) return;
    setLoading(true);
    const result = await api.post('adminDeleteBooking', { adminSecret: ADMIN_SECRET, bookingId: adminDeleteModal.bookingId });
    if (result.ok) {
      showToast('Запись удалена', 'success');
      setAdminDeleteModal({ open: false, bookingId: null }); await loadAllBookings();
    } else showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
    setLoading(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth: new Date(year, month + 1, 0).getDate(), startingDayOfWeek: firstDay === 0 ? 6 : firstDay - 1 };
  };

  // Все даты у которых есть доступные слоты (включая заблокированные выходные — они нужны для замка в календаре)
  const getAvailableDates = () => [...new Set(
    hockeySlots.filter(s => s.status === 'available' && isSlotBookable(s.date, s.time)).map(s => s.date)
  )];
  // Только разблокированные даты (для полосы недели — там замок не показывается)
  const getBookableDates = () => [...new Set(
    hockeySlots.filter(s => {
      if (s.status !== 'available') return false;
      if (!isSlotBookable(s.date, s.time)) return false;
      if (isWeekend(s.date) && !areWeekendsOpen()) return false;
      return true;
    }).map(s => s.date)
  )];
  const getSlotsForDate = (dateStr) => {
    if (isWeekend(dateStr) && !areWeekendsOpen()) return []; // слоты не показываем для заблокированных выходных
    return hockeySlots
      .filter(s => s.date === dateStr && s.status === 'available' && isSlotBookable(s.date, s.time))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const parseSlotIds = (slotIds) => {
    if (!slotIds) return [];
    return String(slotIds).split(',').map(id => {
      const parts = id.trim().split('-');
      if (parts.length >= 4) return { date: `${parts[0]}-${parts[1]}-${parts[2]}`, time: parts[3] };
      return { date: '', time: '' };
    });
  };

  // Format slot IDs into readable string
  const formatSlotIdsReadable = (slotIds) => {
    const months = ['','янв.','февр.','марта','апр.','мая','июня','июля','авг.','сент.','окт.','нояб.','дек.'];
    return String(slotIds || '').split(',').map(id => {
      const p = id.trim().split('-');
      if (p.length >= 4) return `${parseInt(p[2], 10)} ${months[parseInt(p[1], 10)]}, ${p[3]}`;
      return id;
    }).join(' • ');
  };

  // Check if booking is upcoming
  const isUpcoming = (booking) => {
    const slots = parseSlotIds(booking.slotIds);
    if (!slots.length || !slots[0].date) return false;
    const today = getTodayStr();
    return slots.some(s => s.date >= today) && ['confirmed', 'pending', 'cancellation_requested'].includes(booking.status);
  };

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const getTodayStr = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-600',
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
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const styles = `
    @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp 0.35s ease both}
    .fade-up-1{animation-delay:0.05s}
    .fade-up-2{animation-delay:0.1s}
    .fade-up-3{animation-delay:0.15s}
    .fade-up-4{animation-delay:0.2s}
    .fade-up-5{animation-delay:0.25s}
    .sport-divider{height:2px;background:linear-gradient(90deg,#111 0%,#e5e7eb 100%);border-radius:2px;margin-bottom:24px;}
    .booking-card-upcoming{border-left:3px solid #22c55e;}
    .booking-card-past{border-left:3px solid #e5e7eb;opacity:0.72;}
    .booking-card-cancel{border-left:3px solid #f97316;}
  `;

  // ═══════════════════════════════════════════════════════
  //  SELECT VIEW  (Variant B — Clean Sport)
  // ═══════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════
  //  ONBOARDING VIEW  — показывается один раз при первом визите
  // ═══════════════════════════════════════════════════════
  if (view === 'onboarding') {
    const finishOnboarding = () => {
      try { localStorage.setItem('shs_onboarded', '1'); } catch(e) {}
      setView('select');
    };

    const steps = [
      {
        emoji: '👋',
        title: 'Привет!',
        subtitle: 'Я Александр Селезнев — хоккейный тренер с 15-летним опытом.',
        body: 'Тренирую взрослых и детей на катке «Галактика» в Мытищах. Персональный подход к каждому — независимо от уровня.',
        cta: 'Далее',
        accent: '#111',
      },
      {
        emoji: '🏒',
        title: 'Что мы тренируем',
        subtitle: 'Четыре направления под любой уровень и цель.',
        body: null,
        cards: [
          { icon: '⛸️', label: 'Катание', desc: 'Техника, баланс, уверенность на льду' },
          { icon: '🏋️', label: 'ОФП', desc: 'Сила, выносливость, скорость' },
          { icon: '🎯', label: 'Бросковая', desc: 'Точность и мощь броска' },
          { icon: '🏒', label: 'Хоккейный час', desc: 'Игровая практика в малой группе' },
        ],
        cta: 'Далее',
        accent: '#111',
      },
      {
        emoji: '📅',
        title: 'Как записаться',
        subtitle: 'Всё просто — занимает меньше минуты.',
        body: null,
        steps2: [
          { n: '1', text: 'Выберите дату — зелёные дни уже доступны' },
          { n: '2', text: 'Выберите время и тип тренировки' },
          { n: '3', text: 'Введите имя и телефон — нажмите «Записаться»' },
          { n: '4', text: 'Тренер подтвердит — придёт уведомление' },
        ],
        cta: 'Начать',
        accent: '#16a34a',
      },
    ];

    const step = steps[onboardStep];
    const isLast = onboardStep === steps.length - 1;

    return (
      <>
        <style>{styles}</style>
        <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ height: 4, background: '#111' }} />

          {/* Skip */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 0' }}>
            <button onClick={finishOnboarding} style={{ background: 'none', border: 'none', fontSize: 13, color: '#9ca3af', cursor: 'pointer', padding: '4px 8px' }}>
              Пропустить
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px' }}>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  width: i === onboardStep ? 24 : 8, height: 8,
                  borderRadius: 4, background: i === onboardStep ? '#111' : '#e5e7eb',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>

            {/* Emoji */}
            <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 20, lineHeight: 1 }}>
              {step.emoji}
            </div>

            {/* Title + subtitle */}
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', textAlign: 'center', margin: '0 0 8px', color: '#111' }}>
              {step.title}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
              {step.subtitle}
            </p>

            {/* Body text */}
            {step.body && (
              <div style={{ background: '#f9fafb', borderRadius: 14, padding: '16px 18px', marginBottom: 16, border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
              </div>
            )}

            {/* Training type cards */}
            {step.cards && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {step.cards.map((c, i) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                    <p style={{ fontWeight: 800, fontSize: 13, color: '#111', margin: '0 0 3px' }}>{c.label}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* How-to steps */}
            {step.steps2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {step.steps2.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f9fafb', borderRadius: 12, padding: '11px 14px', border: '1px solid #f0f0f0' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#111', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.n}
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.4, paddingTop: 2 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* CTA button */}
            <button
              onClick={() => {
                if (isLast) { finishOnboarding(); loadSlots(); }
                else setOnboardStep(s => s + 1);
              }}
              style={{
                width: '100%', background: step.accent, color: '#fff',
                border: 'none', borderRadius: 16, padding: '18px',
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                marginTop: 24,
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isLast ? '🏒 Записаться на тренировку' : step.cta + ' →'}
            </button>

            {/* Back */}
            {onboardStep > 0 && (
              <button onClick={() => setOnboardStep(s => s - 1)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#9ca3af', cursor: 'pointer', margin: '12px auto 0', display: 'block' }}>
                ← Назад
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  if (view === 'select') {
    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen bg-white flex flex-col">

          {/* Top stripe */}
          <div style={{ height: 4, background: '#111' }} />

          {/* Header */}
          <div className="px-6 pt-10 pb-6">
            <div className="flex items-center gap-3 mb-8 fade-up">
              <img src={BRAND_LOGO} alt="Логотип" className="w-10 h-10" />
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Seleznyov</p>
                <p className="text-sm font-black tracking-wide leading-tight">Hockey School</p>
              </div>
            </div>

            {/* Hero */}
            <div className="mb-8 fade-up fade-up-1">
              <div className="sport-divider" />
              <h1 className="text-4xl font-black leading-none mb-2" style={{ letterSpacing: '-0.5px' }}>
                ХОККЕЙНЫЕ<br />ТРЕНИРОВКИ
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-wide">Персональные тренировки • Каток Галактика</p>
            </div>

            {/* CTA button */}
            <button
              onClick={() => { loadSlots(); setView('client'); }}
              className="w-full mb-3 fade-up fade-up-2"
              style={{
                background: '#111', color: '#fff',
                borderRadius: 16, padding: '18px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                border: 'none', cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>🏒</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>Записаться</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>Выберите удобное время</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 20, opacity: 0.5 }}>›</div>
            </button>

            {/* Abonements button */}
            <button
              onClick={() => setView('abonements')}
              className="w-full mb-3 fade-up fade-up-3"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#fff', borderRadius: 16, padding: '16px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,215,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>🎁</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Абонементы</div>
                <div style={{ fontSize: 12, color: 'rgba(255,215,0,0.75)', marginTop: 1 }}>5 занятий + 1 в подарок</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 20, opacity: 0.4 }}>›</div>
            </button>

            {/* Location card */}
            <div className="fade-up fade-up-4" style={{
              background: '#f9fafb', borderRadius: 14,
              padding: '14px 16px', display: 'flex', alignItems: 'center',
              gap: 12, border: '1px solid #f0f0f0'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#fff', border: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0
              }}>📍</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 1 }}>Каток «Галактика»</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>г. Мытищи, ТЦ Июнь</p>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div className="px-6 pb-8 fade-up fade-up-4">
            <button
              onClick={() => setView('admin-login')}
              style={{
                width: '100%', fontSize: 13, cursor: 'pointer', padding: '10px 0',
                background: 'none', border: '1px solid #e5e7eb', borderRadius: 12,
                color: '#6b7280', fontWeight: 600, letterSpacing: '0.2px'
              }}
            >
              Вход для тренера
            </button>
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  ADMIN LOGIN  (unchanged visually, kept clean)
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  //  CLIENT VIEW  (Variant B — Clean Sport)
  // ═══════════════════════════════════════════════════════
  if (view === 'client') {
    const availableDates = getAvailableDates();
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(clientMonth);
    const today = getTodayStr();

    // ── Booking success screen ──────────────────────────
    if (bookingSuccess) {
      const firstName = clientForm.name ? clientForm.name.trim().split(' ')[0] : (telegramUser?.firstName || '');
      // Собираем детали последней записи для карточки
      const lastSlot = hockeySlots.find(s => s.id === selectedSlots[0]) ||
        (hockeyBookings[0] ? hockeySlots.find(s => String(hockeyBookings[0].slotIds || '').split(',')[0].trim() === s.id) : null);
      const lastDate = lastSlot ? new Date(lastSlot.date + 'T00:00:00') : null;
      const dayNamesRu = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
      const monthNamesRu2 = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
      return (
        <>
          <style>{styles}</style>
          <style>{`
            @keyframes bounceIn {
              0%{transform:scale(0.5);opacity:0}
              60%{transform:scale(1.2)}
              80%{transform:scale(0.95)}
              100%{transform:scale(1);opacity:1}
            }
          `}</style>
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div style={{ height: 4, background: '#111', position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div className="w-full max-w-sm fade-up">

              {/* Emoji + заголовок */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 52, marginBottom: 12, animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>🎉</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>
                  {firstName ? `Готово, ${firstName}!` : 'Заявка отправлена!'}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Тренер подтвердит запись в течение часа</p>
              </div>

              {/* Тёмная карточка-билет */}
              <div style={{
                background: 'linear-gradient(135deg, #111 0%, #374151 100%)',
                borderRadius: 18, padding: '18px 20px', marginBottom: 12
              }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 10 }}>ВАША ЗАПИСЬ</div>
                {lastDate ? (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                      {dayNamesRu[lastDate.getDay()]}, {lastDate.getDate()} {monthNamesRu2[lastDate.getMonth()]}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                      {lastSlot?.time}{trainingType === 'skating' ? ' · ⛸️ Катание' : trainingType === 'ofp' ? ' · 🏋️ ОФП' : trainingType === 'shooting' ? ' · 🎯 Бросковая' : isHockeyHour(lastSlot?.date, lastSlot?.time, lastSlot) ? ' · 🏒 Хоккейный час' : ''} · Галактика
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>Каток «Галактика», г. Мытищи</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Тренер</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Александр Селезнев</span>
                </div>
              </div>

              {/* Streak если есть */}
              {myStreak >= 2 && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>🔥</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#9a3412' }}>Серия {myStreak} занятий!</div>
                    <div style={{ fontSize: 11, color: '#c2410c' }}>Так держать, не останавливайся</div>
                  </div>
                </div>
              )}

              {/* Уведомления Telegram */}
              {isTelegramWebApp && telegramUser?.chatId && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ color: '#1d4ed8', fontSize: 12 }}>✅ Уведомление придёт в этот чат когда тренер подтвердит</p>
                </div>
              )}

              {/* Кнопки */}
              <button
                onClick={() => {
                  const text = `Тренируюсь у Александра Селезнева 🏒${lastDate ? `
${dayNamesRu[lastDate.getDay()]}, ${lastDate.getDate()} ${monthNamesRu2[lastDate.getMonth()]}` : ''}
hockey-booking.vercel.app`;
                  if (navigator.share) navigator.share({ title: 'Хоккейные тренировки', text });
                  else navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!', 'success'));
                }}
                style={{ width: '100%', background: '#111', color: '#fff', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 8 }}>
                📸 Поделиться
              </button>
              <button onClick={() => { setBookingSuccess(false); loadSlots(); }}
                style={{ width: '100%', background: '#f3f4f6', color: '#374151', padding: '12px', borderRadius: 14, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', marginBottom: 8 }}>
                Записаться ещё
              </button>
              <button onClick={() => setBookingSuccess(false)} style={{ color: '#9ca3af', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto' }}>Закрыть</button>
            </div>
          </div>
        </>
      );
    }

    // ── My Bookings screen (Variant D) ──────────────────
    if (showMyBookings) {
      const upcomingBookings = hockeyBookings.filter(b => isUpcoming(b));
      const pastBookings = hockeyBookings.filter(b => !isUpcoming(b));
      const displayedBookings = myBookingsFilter === 'upcoming' ? upcomingBookings : pastBookings;

      return (
        <>
          <style>{styles}</style>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
          <div className="min-h-screen bg-white">
            <div style={{ height: 4, background: '#111' }} />

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '16px 20px 0', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setShowMyBookings(false)} style={{ background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={18} color="#111" />
                  </button>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.4px', color: '#111' }}>Мои записи</h2>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>История тренировок</p>
                  </div>
                </div>
                <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  <Send size={13} /> Тренер
                </a>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 6, paddingBottom: 12 }}>
                {[
                  { key: 'upcoming', label: 'Предстоящие', count: upcomingBookings.length },
                  { key: 'past', label: 'История', count: pastBookings.length }
                ].map(f => (
                  <button key={f.key} onClick={() => setMyBookingsFilter(f.key)} style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: myBookingsFilter === f.key ? '#111' : '#f3f4f6',
                    color: myBookingsFilter === f.key ? '#fff' : '#6b7280',
                    transition: 'all 0.15s'
                  }}>
                    {f.label} {f.count > 0 && <span style={{ opacity: 0.6, fontWeight: 500 }}>({f.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 20px 32px' }}>
              {/* Telegram user card with streak */}
              {isTelegramWebApp && telegramUser && (
                <div className="fade-up" style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #f9fafb)',
                  border: '1px solid #dcfce7', borderRadius: 14,
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10
                }}>
                  <Avatar name={`${telegramUser.firstName} ${telegramUser.lastName}`} size={36} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{telegramUser.firstName} {telegramUser.lastName}</p>
                    {telegramUser.username && <p style={{ fontSize: 11, color: '#16a34a' }}>@{telegramUser.username}</p>}
                  </div>
                  {myStreak > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, lineHeight: 1 }}>🔥</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c' }}>{myStreak}</p>
                      <p style={{ fontSize: 9, color: '#9ca3af' }}>серия</p>
                    </div>
                  )}
                </div>
              )}

              {/* Streak card */}
              {myStreak >= 2 && (
                <div className="fade-up" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>🔥 Серия: {myStreak} занятий подряд</p>
                      <p style={{ fontSize: 11, color: '#c2410c' }}>Рекорд: {myMaxStreak} · продолжай тренироваться!</p>
                    </div>
                    <div style={{ fontSize: 28 }}>
                      {myStreak >= 10 ? '🏆' : myStreak >= 5 ? '🥇' : '🔥'}
                    </div>
                  </div>
                </div>
              )}

              {/* Referral block */}
              {isTelegramWebApp && telegramUser?.chatId && (
                <div className="fade-up" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', marginBottom: 4 }}>👥 Пригласи друга — получи скидку 20%</p>
                  {myRefCode ? (
                    <>
                      <p style={{ fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>
                        Ты пригласил: <b>{myRefCount}</b> чел. · Скидка: <b>{myRefDiscount}%</b>
                      </p>
                      <button
                        onClick={() => {
                          const link = `https://t.me/SHSHockeyBot?start=ref_${myRefCode}`;
                          if (navigator.share) {
                            navigator.share({ title: 'Хоккейные тренировки', text: 'Записывайся на тренировки по моей ссылке!', url: link });
                          } else {
                            navigator.clipboard.writeText(link).then(() => showToast('Ссылка скопирована!', 'success'));
                          }
                        }}
                        style={{ width: '100%', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        📤 Поделиться ссылкой
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={loadMyRefData}
                      style={{ fontSize: 13, color: '#fff', background: '#7c3aed', border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontWeight: 700, width: '100%', marginTop: 4 }}
                    >
                      🔗 Получить мою ссылку
                    </button>
                  )}
                </div>
              )}

              {/* Phone input for non-Telegram */}
              {!isTelegramWebApp && (
                <div style={{ background: '#f9fafb', borderRadius: 14, padding: 16, marginBottom: 16, border: '1px solid #f0f0f0' }}>
                  <input type="tel" placeholder="Ваш телефон" value={myBookingsPhone} onChange={e => setMyBookingsPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                  <button onClick={() => loadBookingsByPhone(myBookingsPhone)} disabled={loading || !myBookingsPhone}
                    style={{ width: '100%', background: '#111', color: '#fff', padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: (!myBookingsPhone || loading) ? 0.5 : 1 }}>
                    {loading ? '...' : 'Найти'}
                  </button>
                </div>
              )}

              {loading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {displayedBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🏒</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                        {myBookingsFilter === 'upcoming' ? 'Нет предстоящих записей' : 'История пуста'}
                      </p>
                      <p style={{ fontSize: 13 }}>
                        {myBookingsFilter === 'upcoming' ? 'Запишитесь на тренировку!' : 'Тренировки появятся здесь'}
                      </p>
                    </div>
                  ) : displayedBookings.map((b, idx) => {
                    const upcoming = isUpcoming(b);
                    const cardClass = upcoming ? 'booking-card-upcoming' :
                      b.status === 'cancellation_requested' ? 'booking-card-cancel' : 'booking-card-past';

                    return (
                      <div key={b.id} className={`fade-up ${cardClass}`} style={{
                        background: '#fff', borderRadius: 14,
                        padding: '14px 16px',
                        border: '1px solid #f3f4f6',
                        boxShadow: upcoming ? '0 2px 12px rgba(0,0,0,0.05)' : 'none',
                        animationDelay: `${idx * 0.04}s`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={b.name} size={32} />
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 800, color: '#111', letterSpacing: '-0.2px' }}>{b.name}</p>
                              {b.trainingType && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{b.trainingType}</p>}
                            </div>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>

                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                          📅 {formatSlotIdsReadable(b.slotIds)}
                        </p>
                        {b.comment && <p style={{ fontSize: 12, color: '#9ca3af' }}>💬 {b.comment}</p>}

                        {(b.status === 'confirmed' || b.status === 'pending') && (
                          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Для отмены свяжитесь с тренером:</p>
                            <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                              <Send size={13} /> Написать тренеру
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    // ── Main booking flow ───────────────────────────────
    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen bg-white pb-44">

          {/* Top stripe */}
          <div style={{ height: 4, background: '#111' }} />

          {/* Header */}
          <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="max-w-lg mx-auto" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setView('select')} style={{ background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <ArrowLeft size={18} color="#111" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={BRAND_LOGO} alt="" style={{ width: 28, height: 28 }} />
                <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.2px' }}>Хоккейные тренировки</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <a href={`https://t.me/${TRAINER_TELEGRAM}`} target="_blank" rel="noopener noreferrer"
                  style={{ padding: 8, color: '#2563eb', borderRadius: 10, background: '#eff6ff', display: 'flex' }}>
                  <Send size={16} />
                </a>
                <button onClick={() => { setShowMyBookings(true); loadMyRefData(); loadMyStreakData(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, background: '#f3f4f6', padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>
                  <History size={14} /> Мои записи
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto" style={{ padding: '16px 16px 0' }}>

            {/* Telegram user greeting */}
            {isTelegramWebApp && telegramUser && (
              <div className="fade-up" style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 12, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14
              }}>
                <Avatar name={`${telegramUser.firstName} ${telegramUser.lastName}`} size={34} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>{telegramUser.firstName} {telegramUser.lastName}</p>
                  {telegramUser.username && <p style={{ fontSize: 11, color: '#3b82f6' }}>@{telegramUser.username}</p>}
                </div>
              </div>
            )}

            {loading ? <Spinner /> : (
              <>
                {/* Section title */}
                <div className="fade-up fade-up-1" style={{ marginBottom: 14 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.4px', color: '#111' }}>Выберите дату</h1>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginRight: 5, verticalAlign: 'middle' }}></span>
                    Зелёные — есть свободные места
                  </p>
                </div>

                {/* Calendar */}
                <div className="fade-up fade-up-2" style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '16px', marginBottom: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

                  {/* Week strip — ближайшие 5 дней */}
                  {(() => {
                    const strip = [];
                    const todayDate = new Date();
                    const dayLabels = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
                    for (let i = 0; i < 5; i++) {
                      const d = new Date(todayDate);
                      d.setDate(todayDate.getDate() + i);
                      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                      strip.push({ ds, day: d.getDate(), label: dayLabels[d.getDay()], avail: getBookableDates().includes(ds), isToday: i === 0 });
                    }
                    const hasAny = strip.some(s => s.avail);
                    if (!hasAny) return null;
                    return (
                      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 8, marginBottom: 14, display: 'flex', gap: 4 }}>
                        {strip.map(s => (
                          <button key={s.ds} onClick={() => s.avail && setClientSelectedDate(s.ds)}
                            disabled={!s.avail}
                            style={{
                              flex: 1, borderRadius: 9, padding: '6px 2px', textAlign: 'center',
                              border: 'none', cursor: s.avail ? 'pointer' : 'default',
                              background: clientSelectedDate === s.ds ? '#111' : s.isToday && s.avail ? '#f0fdf4' : 'transparent',
                              transition: 'all 0.15s'
                            }}>
                            <div style={{ fontSize: 9, color: clientSelectedDate === s.ds ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: clientSelectedDate === s.ds ? '#fff' : s.avail ? '#111' : '#d1d5db' }}>{s.day}</div>
                            {s.avail && <div style={{ width: 4, height: 4, borderRadius: '50%', background: clientSelectedDate === s.ds ? '#4ade80' : '#22c55e', margin: '3px auto 0' }} />}
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() - 1))}
                      style={{ background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex' }}>
                      <ChevronLeft size={18} />
                    </button>
                    <h3 style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.2px' }}>
                      {monthNames[clientMonth.getMonth()]} {clientMonth.getFullYear()}
                    </h3>
                    <button onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() + 1))}
                      style={{ background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex' }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
                    {dayNames.map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#d1d5db', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', paddingBottom: 4 }}>{d}</div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
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
                        if (isWeekendLocked) { showToast('📅 Запись на выходные откроется в пятницу в 17:00', 'info'); return; }
                        if (isAvailable) setClientSelectedDate(dateStr);
                      };

                      let bg = 'transparent', color = '#d1d5db', border = 'none', fontWeight = 500;
                      if (isSelected) { bg = '#111'; color = '#fff'; fontWeight = 800; }
                      else if (isAvailable && !isWeekendLocked) { bg = '#f0fdf4'; color = '#15803d'; border = '1px solid #bbf7d0'; fontWeight = 700; }
                      else if (isWeekendLocked && isAvailable) { bg = '#fefce8'; color = '#a16207'; border = '1px solid #fde68a'; }
                      else if (!isPast && !isAvailable) { color = '#d1d5db'; }

                      return (
                        <button key={day} onClick={handleDayClick}
                          disabled={isPast || isWeekendLocked || !isAvailable}
                          style={{
                            aspectRatio: '1', borderRadius: 10, fontSize: 13,
                            background: bg, color, border, fontWeight,
                            cursor: (isPast || isWeekendLocked || !isAvailable) ? 'default' : 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.1s',
                            transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                          }}>
                          <div>{day}</div>
                          {isWeekendLocked && isAvailable && <div style={{ fontSize: 8 }}>🔒</div>}
                        </button>
                      );
                    })}
                  </div>

                  {!areWeekendsOpen() && availableDates.some(d => isWeekend(d)) && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, textAlign: 'center' }}>
                      <p style={{ color: '#a16207', fontSize: 12 }}>📅 Запись на Сб и Вс откроется в пятницу в 17:00</p>
                    </div>
                  )}
                </div>

                {/* Time slots — vertical cards */}
                {clientSelectedDate && (
                  <div className="fade-up" style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, letterSpacing: '-0.2px' }}>{formatDate(clientSelectedDate)}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {getSlotsForDate(clientSelectedDate).map(slot => {
                        const isHockey = isHockeyHour(clientSelectedDate, slot.time, slot);
                        const isSelected = selectedSlots.includes(slot.id);
                        const typeLabel = isHockey ? '🏒 Хоккейный час' : '⛸️ Катание / ОФП / Бросковая';
                        return (
                          <button key={slot.id}
                            onClick={() => setSelectedSlots(p => p.includes(slot.id) ? p.filter(id => id !== slot.id) : [...p, slot.id])}
                            style={{
                              width: '100%', padding: '12px 16px', borderRadius: 14,
                              background: isSelected ? '#111' : isHockey ? '#f0f9ff' : '#f9fafb',
                              border: isSelected ? 'none' : isHockey ? '1.5px solid #bae6fd' : '1px solid #f0f0f0',
                              cursor: 'pointer', textAlign: 'left',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.15s',
                              transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                            }}>
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 900, color: isSelected ? '#fff' : isHockey ? '#0369a1' : '#111', letterSpacing: '-0.3px' }}>
                                {slot.time}
                              </div>
                              <div style={{ fontSize: 11, marginTop: 3, color: isSelected ? 'rgba(255,255,255,0.6)' : isHockey ? '#0284c7' : '#9ca3af' }}>
                                {typeLabel}
                              </div>
                            </div>
                            <div>
                              {isSelected ? (
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                                  Выбрано ✓
                                </div>
                              ) : isHockey ? (
                                <div style={{ background: '#0ea5e9', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                                  Спец.
                                </div>
                              ) : (
                                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e5e7eb' }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableDates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                    <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Нет доступных слотов</p>
                    <button onClick={loadSlots} style={{ color: '#2563eb', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>Обновить</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Bottom booking form ─────────────────────── */}
          {selectedSlots.length > 0 && (
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#fff', borderTop: '1px solid #f3f4f6',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.08)', padding: '16px',
              animation: 'slideDown 0.25s ease'
            }}>
              <div className="max-w-lg mx-auto">
                {/* ── Сводка выбранного слота ── */}
                {(() => {
                  const firstSlot = hockeySlots.find(s => s.id === selectedSlots[0]);
                  const isHk = firstSlot && isHockeyHour(firstSlot.date, firstSlot.time, firstSlot);
                  const slotLabel = firstSlot
                    ? `${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][new Date(firstSlot.date+'T00:00:00').getDay()]} ${firstSlot.date.slice(8).replace(/^0/,'')} ${['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][new Date(firstSlot.date+'T00:00:00').getMonth()]} · ${firstSlot.time}`
                    : '';
                  const typeHint = isHk ? '🏒 Хоккейный час' : trainingType === 'skating' ? '⛸️ Катание' : trainingType === 'ofp' ? '🏋️ ОФП' : trainingType === 'shooting' ? '🎯 Бросковая' : '⛸️ Катание / ОФП / Бросковая';
                  return (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', letterSpacing: 0.5, marginBottom: 3 }}>ВЫБРАНО</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{slotLabel}{selectedSlots.length > 1 ? ` + ещё ${selectedSlots.length - 1}` : ''}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{typeHint}</div>
                      </div>
                      <button onClick={() => setSelectedSlots([])}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, lineHeight: 1, padding: '2px 4px', marginLeft: 8 }}>
                        ×
                      </button>
                    </div>
                  );
                })()}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input type="text" placeholder="Имя Фамилия *" value={clientForm.name}
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                    readOnly={isTelegramWebApp && !!savedUserData?.firstName}
                    style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', background: (isTelegramWebApp && savedUserData?.firstName) ? '#f9fafb' : '#fff' }} />
                  <input type="tel" placeholder="+7XXXXXXXXXX" value={clientForm.phone}
                    onChange={e => {
                      let val = e.target.value;
                      if (!val.startsWith('+7')) val = '+7' + val.replace(/^\+?7?/, '');
                      val = '+7' + val.slice(2).replace(/\D/g, '');
                      if (val.length > 12) val = val.slice(0, 12);
                      setClientForm({ ...clientForm, phone: val });
                    }}
                    readOnly={isTelegramWebApp && !!savedUserData?.phone}
                    style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', background: (isTelegramWebApp && savedUserData?.phone) ? '#f9fafb' : '#fff' }} />
                </div>

                {isTelegramWebApp && savedUserData?.phone && (
                  <p style={{ fontSize: 11, color: '#16a34a', marginBottom: 6, marginLeft: 2 }}>✓ Данные сохранены</p>
                )}

                <input type="text" placeholder="Telegram (для уведомлений)" value={clientForm.telegram}
                  onChange={e => setClientForm({ ...clientForm, telegram: e.target.value })}
                  readOnly={isTelegramWebApp && !!telegramUser?.username}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box', background: (isTelegramWebApp && telegramUser?.username) ? '#f9fafb' : '#fff' }} />

                {isTelegramWebApp && telegramUser?.chatId && (
                  <p style={{ fontSize: 11, color: '#16a34a', marginBottom: 6, marginLeft: 2 }}>✓ Уведомления включены</p>
                )}

                <textarea placeholder="Комментарий (необязательно)" value={clientForm.comment}
                  onChange={e => setClientForm({ ...clientForm, comment: e.target.value })}
                  rows={2} maxLength={200}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />

                {/* Birthday field */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 4, marginLeft: 2 }}>
                    🎂 Дата рождения (для поздравления)
                  </label>
                  <input
                    type="date"
                    value={clientForm.birthDate}
                    onChange={e => setClientForm({ ...clientForm, birthDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: clientForm.birthDate ? '#111' : '#9ca3af' }}
                  />
                </div>

                {/* Training type */}
                {(() => {
                  const objs = selectedSlots.map(sid => hockeySlots.find(s => s.id === sid)).filter(Boolean);
                  const allHockey = objs.length > 0 && objs.every(s => isHockeyHour(s.date, s.time, s));
                  if (allHockey) return null;
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>Тип тренировки *</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {[
                          { key: 'skating', label: '⛸️ Катание' },
                          { key: 'ofp', label: '🏋️ ОФП' },
                          { key: 'shooting', label: '🎯 Бросковая' }
                        ].map(t => (
                          <button key={t.key} onClick={() => setTrainingType(t.key)}
                            style={{
                              padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                              background: trainingType === t.key ? '#111' : '#f3f4f6',
                              color: trainingType === t.key ? '#fff' : '#374151',
                              transition: 'all 0.12s'
                            }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Abonement banner */}
                <div
                  onClick={() => setView('abonements')}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    borderRadius: 14, padding: '12px 14px', marginBottom: 10,
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
                  }}>
                  <div style={{ fontSize: 24 }}>🎁</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Купи 5 — получи 6-е в подарок</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,215,0,0.75)' }}>Узнать про абонементы →</p>
                  </div>
                </div>

                {/* Price row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 2px', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Стоимость занятия</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>{(PRICE_PER_SESSION * selectedSlots.length).toLocaleString('ru-RU')} ₽</span>
                </div>

                <button onClick={submitBooking} disabled={loading || !clientForm.name || !clientForm.phone || (() => {
                  const objs = selectedSlots.map(sid => hockeySlots.find(s => s.id === sid)).filter(Boolean);
                  const allHockey = objs.length > 0 && objs.every(s => isHockeyHour(s.date, s.time, s));
                  return !allHockey && !trainingType;
                })()}
                  style={{
                    width: '100%', background: '#111', color: '#fff',
                    padding: '15px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                    border: 'none', cursor: 'pointer',
                    opacity: (loading || !clientForm.name || !clientForm.phone) ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                    letterSpacing: '-0.2px'
                  }}>
                  {loading ? '...' : 'Отправить заявку →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  ABONEMENTS VIEW
  // ═══════════════════════════════════════════════════════
  if (view === 'abonements') {
    const packages = [
      {
        id: 'single',
        emoji: '🏒',
        title: 'Разовое занятие',
        sessions: 1,
        gift: 0,
        price: 2000,
        pricePerSession: 2000,
        accent: '#f3f4f6',
        textColor: '#111',
        badge: null,
      },
      {
        id: 'pack5',
        emoji: '⭐',
        title: 'Абонемент 5+1',
        sessions: 5,
        gift: 1,
        price: 10000,
        pricePerSession: 1667,
        accent: '#111',
        textColor: '#fff',
        badge: '🔥 Хит',
        badgeColor: '#fbbf24',
      },
      {
        id: 'pack10',
        emoji: '🏆',
        title: 'Абонемент 10+2',
        sessions: 10,
        gift: 2,
        price: 20000,
        pricePerSession: 1667,
        accent: '#0f172a',
        textColor: '#fff',
        badge: '💎 Максимум',
        badgeColor: '#818cf8',
      },
    ];

    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="min-h-screen flex flex-col" style={{ background: '#f9fafb' }}>

          {/* Top stripe */}
          <div style={{ height: 4, background: '#111' }} />

          {/* Header */}
          <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
            <button onClick={() => setView('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#111', fontSize: 20, lineHeight: 1 }}>←</button>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>Абонементы</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Тренируйся выгоднее</p>
            </div>
          </div>

          <div style={{ padding: '20px 16px', flex: 1 }}>

            {/* Hero banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 20, padding: '24px 20px', marginBottom: 20, textAlign: 'center'
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Купи 5 — получи 6-е бесплатно</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Оплати абонемент тренеру напрямую и экономь на каждой тренировке</p>
            </div>

            {/* Package cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{
                  background: pkg.accent, borderRadius: 18, padding: '18px 20px',
                  boxShadow: pkg.id !== 'single' ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
                  border: pkg.id === 'single' ? '1px solid #e5e7eb' : 'none',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {pkg.badge && (
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      background: pkg.badgeColor, color: '#111',
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20
                    }}>{pkg.badge}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: pkg.id === 'single' ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                    }}>{pkg.emoji}</div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 900, color: pkg.textColor }}>{pkg.title}</p>
                      <p style={{ fontSize: 12, color: pkg.id === 'single' ? '#9ca3af' : 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                        {pkg.sessions} занятий{pkg.gift > 0 ? ` + ${pkg.gift} в подарок` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 28, fontWeight: 900, color: pkg.textColor, lineHeight: 1 }}>
                        {pkg.price.toLocaleString('ru-RU')} ₽
                      </p>
                      {pkg.gift > 0 && (
                        <p style={{ fontSize: 11, marginTop: 4, color: pkg.id !== 'single' ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
                          {pkg.pricePerSession.toLocaleString('ru-RU')} ₽ / занятие
                        </p>
                      )}
                    </div>
                    {pkg.gift > 0 && (
                      <div style={{
                        background: pkg.id !== 'single' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                        borderRadius: 10, padding: '6px 12px', textAlign: 'center'
                      }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: pkg.id !== 'single' ? '#fbbf24' : '#111' }}>
                          -{Math.round((1 - pkg.pricePerSession / 2000) * 100)}%
                        </p>
                        <p style={{ fontSize: 10, color: pkg.id !== 'single' ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>экономия</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 14 }}>Как это работает</p>
              {[
                { icon: '💬', text: 'Напишите тренеру и выберите абонемент' },
                { icon: '💳', text: 'Оплатите удобным способом' },
                { icon: '📅', text: 'Записывайтесь на занятия как обычно' },
                { icon: '🎁', text: 'Бонусное занятие — в любое удобное время' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
                  <p style={{ fontSize: 13, color: '#374151' }}>{step.text}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://t.me/seleznev_88"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#111', color: '#fff', borderRadius: 16, padding: '16px',
                fontWeight: 800, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              }}>
              ✈️ Написать тренеру в Telegram
            </a>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
              @seleznev_88 • отвечает в течение дня
            </p>
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  ADMIN VIEW  (unchanged — keep as is)
  // ═══════════════════════════════════════════════════════
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

    const filteredBookings = allBookings.filter(b => {
      if (historyFilter === 'all') return true;
      if (historyFilter === 'cancellation_requested') return b.status === 'cancellation_requested';
      return b.status === historyFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
      <>
        <style>{styles}</style>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        <Modal isOpen={adminCancelModal.open} onClose={() => { setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason(''); }} title="Отмена записи клиента">
          <div className="mb-4">
            <p className="font-bold text-lg">{adminCancelModal.booking?.name}</p>
            <p className="text-gray-600">📞 {adminCancelModal.booking?.phone}</p>
            <p className="text-gray-500 text-sm mt-2">📅 {adminCancelModal.booking?.slotIds}</p>
          </div>
          <p className="text-gray-600 mb-4">Клиент получит уведомление об отмене.</p>
          <textarea placeholder="Причина отмены (необязательно)" value={adminCancelReason} onChange={e => setAdminCancelReason(e.target.value)} className="w-full p-3 border-2 rounded-xl mb-4 outline-none focus:border-red-300" rows={3} />
          <div className="flex gap-3">
            <button onClick={() => { setAdminCancelModal({ open: false, booking: null }); setAdminCancelReason(''); }} className="flex-1 p-3 border-2 rounded-xl">Назад</button>
            <button onClick={adminCancelBooking} disabled={loading} className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50">{loading ? '...' : '🚫 Отменить'}</button>
          </div>
        </Modal>

        <Modal isOpen={adminDeleteModal.open} onClose={() => setAdminDeleteModal({ open: false, bookingId: null })} title="Удаление записи">
          <p className="text-gray-600 mb-4">Удалить эту запись из истории? Это действие нельзя отменить.</p>
          <div className="flex gap-3">
            <button onClick={() => setAdminDeleteModal({ open: false, bookingId: null })} className="flex-1 p-3 border-2 rounded-xl">Отмена</button>
            <button onClick={adminDeleteBooking} disabled={loading} className="flex-1 p-3 bg-red-500 text-white rounded-xl disabled:opacity-50">{loading ? '...' : '🗑️ Удалить'}</button>
          </div>
        </Modal>

        <div className="min-h-screen bg-gray-50 pb-8">
          <div style={{ height: 4, background: '#111' }} />
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
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <div className="flex gap-2">
                <button onClick={() => setAdminTab('main')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'main' ? 'bg-black text-white' : 'bg-gray-100'}`}><Calendar size={16} /> Главная</button>
                <button onClick={() => setAdminTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'history' ? 'bg-black text-white' : 'bg-gray-100'}`}><Users size={16} /> Записи ({allBookings.length})</button>
                <button onClick={() => setAdminTab('clients')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'clients' ? 'bg-black text-white' : 'bg-gray-100'}`}>👥 Клиенты</button>
                <button onClick={() => setAdminTab('finance')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${adminTab === 'finance' ? 'bg-black text-white' : 'bg-gray-100'}`}>💰 Финансы</button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-4">
            {adminTab === 'main' && (
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm"><div className="text-2xl font-bold">{availableSlots.length}</div><div className="text-xs text-gray-500">Свободно</div></div>
                  <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-200"><div className="text-2xl font-bold text-yellow-600">{Object.keys(pendingBookings).length}</div><div className="text-xs text-yellow-600">Заявок</div></div>
                  <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-200"><div className="text-2xl font-bold text-green-600">{confirmedSlots.length}</div><div className="text-xs text-green-600">Подтв.</div></div>
                  <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200"><div className="text-2xl font-bold text-orange-600">{pendingCancellations.length}</div><div className="text-xs text-orange-600">Отмен</div></div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border-2 border-gray-200">
                  <h2 className="font-bold mb-3 flex items-center gap-2">⚙️ Управление выходными (Сб, Вс)</h2>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm">
                        Статус: {areWeekendsOpen()
                          ? <span className="text-green-600 font-bold">✅ Открыты</span>
                          : <span className="text-yellow-600 font-bold">🔒 Закрыты</span>
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {weekendsOpenStatus === 'true' ? '👆 Открыты вручную (для всех клиентов)'
                          : weekendsOpenStatus === 'false' ? '👆 Закрыты вручную (для всех клиентов)'
                          : '⏰ Авто: открываются в Пт 17:00'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {areWeekendsOpen() ? (
                        <button onClick={async () => {
                          setLoading(true);
                          const result = await api.post('adminSetWeekendClosed', { adminSecret: ADMIN_SECRET });
                          if (result.ok) {
                            setWeekendsOpenStatus('false');
                            showToast('🔒 Выходные закрыты для всех клиентов', 'success');
                          } else showToast('Ошибка: ' + result.error, 'error');
                          setLoading(false);
                        }} disabled={loading} className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                          {loading ? '...' : '🔒 Закрыть выходные'}
                        </button>
                      ) : (
                        <button onClick={async () => {
                          setLoading(true);
                          const result = await api.post('adminSetWeekendOpen', { adminSecret: ADMIN_SECRET });
                          if (result.ok) {
                            setWeekendsOpenStatus('true');
                            showToast(`✅ Выходные открыты! Уведомлено: ${result.sent || 0}`, 'success');
                          } else showToast('Ошибка: ' + result.error, 'error');
                          setLoading(false);
                        }} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                          {loading ? '...' : '🔓 Открыть сейчас'}
                        </button>
                      )}
                      {weekendsOpenStatus !== 'auto' && weekendsOpenStatus !== null && (
                        <button onClick={async () => {
                          setLoading(true);
                          const result = await api.post('adminResetWeekendAuto', { adminSecret: ADMIN_SECRET });
                          if (result.ok) {
                            setWeekendsOpenStatus('auto');
                            showToast('↩️ Авторежим включён', 'success');
                          }
                          setLoading(false);
                        }} disabled={loading} className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-medium disabled:opacity-50">
                          ↩️ Авто
                        </button>
                      )}
                    </div>
                  </div>
                </div>

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
                              {phone && <button onClick={() => navigator.clipboard.writeText(phone).then(() => showToast(`📞 ${phone} скопирован`, 'success')).catch(() => showToast(`📞 ${phone}`, 'info'))} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Phone size={20} /></button>}
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

                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={20} /> Добавить слоты</h2>
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-sm font-medium mb-3">➕ Добавить слоты</p>
                    <div className="flex gap-2 mb-2">
                      <input type="date" value={singleSlotDate} onChange={e => setSingleSlotDate(e.target.value)} min={today} className="flex-1 p-2 border-2 rounded-lg text-sm" />
                      <input type="time" value={singleSlotTime} onChange={e => setSingleSlotTime(e.target.value)} step="60" className="flex-1 p-2 border-2 rounded-lg text-sm" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={singleSlotIsHockey} onChange={e => setSingleSlotIsHockey(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="text-sm">🏒 Хоккейный час</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={notifyOnAdd} onChange={e => setNotifyOnAdd(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="text-sm text-gray-600">🔔 Уведомить клиентов</span>
                      </label>
                    </div>

                    {/* Slot cart */}
                    {slotCart.length > 0 && (
                      <div className="bg-white border border-blue-200 rounded-xl p-3 mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-bold text-blue-700">🛒 Корзина ({slotCart.length})</p>
                          <button onClick={() => setSlotCart([])} className="text-xs text-red-400 hover:text-red-600">Очистить</button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {slotCart.map((s, i) => (
                            <div key={s.key} className="flex justify-between items-center text-xs bg-blue-50 rounded-lg px-2 py-1">
                              <span>📅 {s.date} ⏰ {s.time}{s.isHockey ? ' 🏒' : ''}</span>
                              <button onClick={() => setSlotCart(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 ml-2">✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={addToSlotCart} disabled={!singleSlotDate || !singleSlotTime || loading}
                        className="flex-1 bg-gray-200 text-gray-700 p-2 rounded-lg text-sm disabled:opacity-50 font-medium">
                        {!singleSlotDate || !singleSlotTime ? '+ В корзину' : `+ В корзину`}
                      </button>
                      <button onClick={addSingleSlot} disabled={loading || (slotCart.length === 0 && (!singleSlotDate || !singleSlotTime))}
                        className="flex-1 bg-blue-500 text-white p-2 rounded-lg text-sm disabled:opacity-50 font-medium">
                        {loading ? '⏳' : slotCart.length > 0
                          ? `✅ Добавить ${slotCart.length} слот(ов)`
                          : singleSlotDate && singleSlotTime ? '✅ Добавить' : '✅ Добавить'
                        }
                      </button>
                    </div>
                    {!notifyOnAdd && <p className="text-xs text-gray-400 mt-2 text-center">🔕 Клиенты не получат уведомления</p>}
                    {notifyOnAdd && slotCart.length > 1 && <p className="text-xs text-green-600 mt-2 text-center">✅ Придёт 1 уведомление на все {slotCart.length} слота</p>}
                  </div>
                  <button onClick={addWeekSlots} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl font-bold mb-4 disabled:opacity-50">
                    {loading ? '...' : '📅 Добавить неделю (стандартное расписание)'}
                  </button>
                  <div className="text-center text-gray-400 text-sm mb-4">— или выберите дни вручную —</div>
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2"><ChevronLeft size={20} /></button>
                    <h3 className="font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2"><ChevronRight size={20} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map(d => <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>)}</div>
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

            {adminTab === 'history' && (() => {
              const today = getTodayStr();

              // Get first slot date for a booking
              const getFirstSlotDate = (booking) => {
                const slots = parseSlotIds(booking.slotIds);
                return slots.length > 0 && slots[0].date ? slots[0].date : '';
              };

              // Filter by status
              const statusFiltered = allBookings.filter(b => {
                if (historyFilter === 'all') return true;
                if (historyFilter === 'cancellation_requested') return b.status === 'cancellation_requested';
                if (historyFilter === 'cancelled') return b.status === 'cancelled' || b.status === 'cancelled_by_admin';
                return b.status === historyFilter;
              });

              // Split upcoming vs past based on first slot date
              const upcomingBookings = statusFiltered
                .filter(b => getFirstSlotDate(b) >= today)
                .sort((a, b) => getFirstSlotDate(a).localeCompare(getFirstSlotDate(b)));

              const pastBookings = statusFiltered
                .filter(b => getFirstSlotDate(b) < today && getFirstSlotDate(b) !== '')
                .sort((a, b) => getFirstSlotDate(b).localeCompare(getFirstSlotDate(a)));

              // Group by date
              const groupByDate = (bookings) => {
                const groups = {};
                bookings.forEach(b => {
                  const d = getFirstSlotDate(b) || 'unknown';
                  if (!groups[d]) groups[d] = [];
                  groups[d].push(b);
                });
                return groups;
              };

              const upcomingGroups = groupByDate(upcomingBookings);
              const pastGroups = groupByDate(pastBookings);

              const formatGroupDate = (dateStr) => {
                if (!dateStr || dateStr === 'unknown') return 'Дата не указана';
                const d = new Date(dateStr + 'T00:00:00');
                const isToday = dateStr === today;
                const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                const isTomorrow = dateStr === `${tmrw.getFullYear()}-${String(tmrw.getMonth()+1).padStart(2,'0')}-${String(tmrw.getDate()).padStart(2,'0')}`;
                const base = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
                if (isToday) return `📅 Сегодня — ${base}`;
                if (isTomorrow) return `📅 Завтра — ${base}`;
                return base;
              };

              const BookingCard = ({ booking }) => {
                const slots = parseSlotIds(booking.slotIds);
                return (
                  <div className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${
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
                        <p className="text-gray-500 text-sm mt-1">🕐 {slots.map(s => s.time).join(', ')}</p>
                        {booking.trainingType && <p className="text-gray-500 text-sm">{booking.trainingType}</p>}
                        {booking.comment && <p className="text-gray-500 text-sm">💬 {booking.comment}</p>}
                        <p className="text-gray-400 text-xs mt-2">Создано: {formatDateTime(booking.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {booking.phone && <button onClick={() => navigator.clipboard.writeText(booking.phone).then(() => showToast(`📞 ${booking.phone} скопирован`, 'success')).catch(() => showToast(`📞 ${booking.phone}`, 'info'))} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={18} /></button>}
                        {booking.telegram && <a href={`https://t.me/${booking.telegram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg text-sm">✈️</a>}
                        {booking.status === 'cancellation_requested' && (
                          <button onClick={async () => {
                            setLoading(true);
                            const result = await api.post('adminApproveCancellationByBookingId', { adminSecret: ADMIN_SECRET, bookingId: booking.id });
                            if (result.ok) { showToast('Отмена подтверждена', 'success'); await loadAllBookings(); await loadCancellations(); }
                            else showToast('Ошибка: ' + (result.error || 'Неизвестная ошибка'), 'error');
                            setLoading(false);
                          }} disabled={loading} className="px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm disabled:opacity-50" title="Подтвердить отмену">✅</button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <button onClick={() => setAdminCancelModal({ open: true, booking })} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm">🚫</button>
                        )}
                        <button onClick={() => setAdminDeleteModal({ open: true, bookingId: booking.id })} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-red-100 hover:text-red-600 transition-all" title="Удалить из истории">🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* Filter */}
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

                  {/* Upcoming — grouped by day */}
                  {Object.keys(upcomingGroups).length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{ height: 2, flex: 1, background: '#111', borderRadius: 2 }} />
                        <span className="text-xs font-black tracking-widest text-gray-800 uppercase">Предстоящие</span>
                        <div style={{ height: 2, flex: 1, background: '#e5e7eb', borderRadius: 2 }} />
                      </div>
                      {Object.entries(upcomingGroups).map(([date, bookings]) => (
                        <div key={date} className="mb-4">
                          <div style={{
                            background: '#111', color: '#fff',
                            borderRadius: 12, padding: '8px 14px',
                            fontSize: 13, fontWeight: 800,
                            marginBottom: 8, display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <span>{formatGroupDate(date)}</span>
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{bookings.length}</span>
                          </div>
                          <div className="space-y-2">
                            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Past — grouped by day, collapsed */}
                  {Object.keys(pastGroups).length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{ height: 2, flex: 1, background: '#e5e7eb', borderRadius: 2 }} />
                        <span className="text-xs font-black tracking-widest text-gray-400 uppercase">Прошедшие</span>
                        <div style={{ height: 2, flex: 1, background: '#e5e7eb', borderRadius: 2 }} />
                      </div>
                      {Object.entries(pastGroups).map(([date, bookings]) => (
                        <div key={date} className="mb-4">
                          <div style={{
                            background: '#f3f4f6', color: '#6b7280',
                            borderRadius: 12, padding: '8px 14px',
                            fontSize: 13, fontWeight: 700,
                            marginBottom: 8, display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <span>{formatGroupDate(date)}</span>
                            <span style={{ background: 'rgba(0,0,0,0.07)', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{bookings.length}</span>
                          </div>
                          <div className="space-y-2">
                            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {statusFiltered.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl text-center text-gray-500">Нет записей</div>
                  )}
                </>
              );
            })()}

            {/* ========== FINANCE TAB ========== */}
            {/* ========== CLIENTS TAB ========== */}
            {adminTab === 'clients' && <ErrorBoundary><ClientsTab
              allBookings={allBookings}
              hockeySlots={hockeySlots}
              clientSearch={clientSearch}
              setClientSearch={setClientSearch}
              clientSort={clientSort}
              setClientSort={setClientSort}
              showToast={showToast}
              PRICE_PER_SESSION={PRICE_PER_SESSION}
            /></ErrorBoundary>}

            {adminTab === 'finance' && (() => {
              const now = new Date();

              // Фильтрация по периоду
              const filterBookings = (bookings) => {
                return bookings.filter(b => {
                  if (b.status !== 'confirmed') return false;
                  const created = new Date(b.createdAt);
                  if (financeFilter === 'week') {
                    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                    return created >= weekAgo;
                  }
                  if (financeFilter === 'month') {
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }
                  if (financeFilter === 'prevmonth') {
                    const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return created.getMonth() === pm.getMonth() && created.getFullYear() === pm.getFullYear();
                  }
                  return true; // 'all'
                });
              };

              const filtered = filterBookings(allBookings);

              // Считаем слоты (одна запись может иметь несколько слотов)
              const countSessions = (bookings) =>
                bookings.reduce((sum, b) => {
                  const slots = String(b.slotIds || '').split(',').filter(Boolean);
                  return sum + (slots.length || 1);
                }, 0);

              const totalSessions = countSessions(filtered);
              const totalEarned = totalSessions * PRICE_PER_SESSION;

              // Разбивка по типам тренировок
              const byType = {};
              filtered.forEach(b => {
                const type = b.trainingType || 'Не указан';
                const slots = String(b.slotIds || '').split(',').filter(Boolean).length || 1;
                if (!byType[type]) byType[type] = { count: 0, sessions: 0 };
                byType[type].count += 1;
                byType[type].sessions += slots;
              });

              // По неделям внутри периода (для "всё время" и "месяц")
              const weeklyData = {};
              filtered.forEach(b => {
                const d = new Date(b.createdAt);
                // Начало недели (пн)
                const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
                const weekStart = new Date(d); weekStart.setDate(d.getDate() - day); weekStart.setHours(0,0,0,0);
                const key = weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                const slots = String(b.slotIds || '').split(',').filter(Boolean).length || 1;
                if (!weeklyData[key]) weeklyData[key] = { sessions: 0, earned: 0 };
                weeklyData[key].sessions += slots;
                weeklyData[key].earned += slots * PRICE_PER_SESSION;
              });

              const periodLabels = {
                week: 'За последние 7 дней',
                month: `${['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'][now.getMonth()]} ${now.getFullYear()}`,
                prevmonth: (() => { const pm = new Date(now.getFullYear(), now.getMonth()-1,1); return `${['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'][pm.getMonth()]} ${pm.getFullYear()}`; })(),
                all: 'За всё время'
              };

              return (
                <>
                  {/* Period filter */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <h2 className="font-bold mb-3 flex items-center gap-2">💰 Финансовая статистика</h2>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'week', label: '7 дней' },
                        { key: 'month', label: 'Этот месяц' },
                        { key: 'prevmonth', label: 'Прошлый месяц' },
                        { key: 'all', label: 'Всё время' },
                      ].map(f => (
                        <button key={f.key} onClick={() => setFinanceFilter(f.key)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${financeFilter === f.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">📅 {periodLabels[financeFilter]}</p>
                  </div>

                  {/* Main totals */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black text-white p-5 rounded-2xl shadow-lg">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Заработано</p>
                      <p className="text-3xl font-black tracking-tight">{totalEarned.toLocaleString('ru-RU')} ₽</p>
                      <p className="text-gray-400 text-xs mt-2">{PRICE_PER_SESSION.toLocaleString('ru-RU')} ₽ / занятие</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-5 rounded-2xl">
                      <p className="text-xs text-green-600 uppercase tracking-widest mb-1">Тренировок</p>
                      <p className="text-3xl font-black text-green-700">{totalSessions}</p>
                      <p className="text-green-500 text-xs mt-2">{filtered.length} {filtered.length === 1 ? 'запись' : filtered.length < 5 ? 'записи' : 'записей'}</p>
                    </div>
                  </div>

                  {/* Breakdown by type */}
                  {Object.keys(byType).length > 0 && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                      <h3 className="font-bold mb-3 text-sm text-gray-600 uppercase tracking-wide">По типам тренировок</h3>
                      <div className="space-y-3">
                        {Object.entries(byType).sort((a,b) => b[1].sessions - a[1].sessions).map(([type, data]) => {
                          const pct = totalSessions > 0 ? Math.round(data.sessions / totalSessions * 100) : 0;
                          const earned = data.sessions * PRICE_PER_SESSION;
                          return (
                            <div key={type}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{type}</span>
                                <div className="text-right">
                                  <span className="text-sm font-bold">{earned.toLocaleString('ru-RU')} ₽</span>
                                  <span className="text-xs text-gray-400 ml-2">{data.sessions} зан.</span>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{pct}%</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly breakdown */}
                  {Object.keys(weeklyData).length > 1 && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                      <h3 className="font-bold mb-3 text-sm text-gray-600 uppercase tracking-wide">По неделям</h3>
                      <div className="space-y-2">
                        {Object.entries(weeklyData).map(([week, data]) => (
                          <div key={week} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">Неделя с {week}</p>
                              <p className="text-xs text-gray-400">{data.sessions} {data.sessions === 1 ? 'занятие' : data.sessions < 5 ? 'занятия' : 'занятий'}</p>
                            </div>
                            <p className="font-bold text-sm">{data.earned.toLocaleString('ru-RU')} ₽</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {filtered.length === 0 && (
                    <div className="bg-white p-10 rounded-2xl text-center text-gray-400">
                      <p className="text-4xl mb-3">💸</p>
                      <p className="font-medium text-gray-500">Нет подтверждённых записей</p>
                      <p className="text-sm mt-1">за выбранный период</p>
                    </div>
                  )}

                  {/* Note */}
                  <p className="text-xs text-gray-400 text-center mt-2">Учитываются только подтверждённые записи</p>
                </>
              );
            })()}

          </div>
        </div>
      </>
    );
  }

  return null;
};

export default BookingSystem;
