import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Bell, Plus, Trash2, Download, Search, Copy, TrendingUp, BarChart3, ChevronLeft, ChevronRight, User, Phone, MessageSquare, ArrowLeft } from 'lucide-react';

// Brand Logo as base64
const BRAND_LOGO = "data:image/webp;base64,UklGRvgXAABXRUJQVlA4WAoAAAAgAAAA/wMAdAIASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggChYAAFDlAJ0BKgAEdQI+USiURqOioiEg8yhYcAoJaW7ynx4n0JMQ1+5y2z/Kn9m8CX6B/Zv7n/df1e9w+sF4Xc76Ij8Z+8H8n+z+jH/A8Bfxn9X/63989gL8M/jP9K/NH+4fuv7hP8R3NWbf5P/Of272CPVP53/l/7j+TvziTLP5DUB/2/pp3zJev/s/x3o2/Nf8Z/4f8L8Cv8g/rv/G/w3a4/dH2kf10//4N7F2258T7oJjELjfU1ATGIXG+pqAmMQuN9TT/ItnmUewrAExiFx4ANADZmtWiHHVbtuMlnFSNZzOZzOZzOPDlbrZG5TfJqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCXtaly431NQEva1NQEY305vPC8va1NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmKzFW2tzJ1skBMYgB0BMYhcbmTozoAL5NQExiFxvqagJjELjfU08uLAQV9jHaK+PpAPO7H6HWuo6CLbgi6N9TUBMYhcb6moCYxC431NQExh/UBBP/7JES4dXG9e+cD0Av/I54w1oqZqGrFmlQYR4ccMPMV1HYnFKclGCQ9kKHRZSDp8EdsoM1ZnS5n7BV/IvQ9N0zupqAmMQuN9TUBMYRLT0j6mnkh5nrQ6f/4z2zLuO3lIL/8sdmWypXmftuPG3hloIaLD9FMLSRMIy7/nXxQpwb4eyXLjBpisxWAJjELjfU1ATGIXF7ADf3sd8L/+UQwgR92gmbol2z2liGSKPI/aKwi09s8ABMYhcb6moCYxC431NQExiFxuPrQdyL8jzOR3XnNgKn4iiaMD28lEXBAmhRooHgfEPKlstQi6Wbv3ALS/3qiP7SWeKusATGIXG+pqAmMQuN9TUBMYPPI3iJJueszC/6zWvNFdQa0RKpomKUXodoRKB8Lfonq1IPqLWkgCiM8tZMIfZMay0kzPX3C7dcTKXWx57Kim9BAiSH2as5fR9Se3crSqqT7Kh//rSqZvQs4ySzxV1gCYxC431NQExiFxvqagJjB+ZGiy+1p/VK+tD1Ys/mGLEkhIbuLgWnOdY1ATdJTn1F32XW+2zMC7JA/+zV8TJUsY4s5R7/3VWt/zrZ2YHkTEvELjfU1ATGIXG+pqAmMQuN9OBtE9Je3VUnEpqXmspHonKPENi4O4Eo8JgB8kXTSOKYCIcSGjSbFEX2E4X+NUFSioQXHWAJjELjfU1ATGIXG+pqAmKlFfL7i26fWkxhBM8fJlcm701ATGIXG+pqAmMQuN9TUBMYhTnkf31bhBcdW3p5i3aKhBcdYAmMQuN9TUBMYhUkBGN8bEPC8GN/69SRWBjEaZfz96aMpAXzupaNV0IiE832qSOsATGIAdATGIXG+pqAmMQuN9NpnfTTEteRAiQsE2Oq20YL/jZRYHgBBI5/+AG2//fhI99/7MDc9LGjnOIAcrfU1ATGIXG+pqAmMQuN9TUBMVaM1ezySW09Bv/wU1HjZqvGHwgYuhKpiAYuiQ5wwTvKcRLqNgPMI2J9BETVZ4zhU9dSuNtEYt+D6WfYf+5ql/7QYlxvqagJjELjfU1ATGIXG+Ni6N9OaOVlKV/wMzewp1Ai+hpcwPRLkWqR9aIoUrnnaXr5c2bVDepYyjLkR8JDESVqnTg1rLxADoCYwiWoCYxC431NQExiFxvqagOSa1NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvjYueF4xvqagAvk1ATGIVJARjfGxc8LzGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFSQEY31NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NG1vqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TUBMYhcb6moCYxC431NQExiFxvqagJjELjfU1ATGIXG+pqAmMQuN9TRtb6moAMQQSkazmczmczmczmczmczmczmczmczmczmczmV0NNHb6moCLuS1FPzEfCIpOW554YI7y7KBgiOFCI0VGrxk1RQgNFQ//Pi8ZNwUAA/v/PIKiq90AdFPuNYlI8ZoaIoal6NVPBAAAFkzAAAAAAAAAAAAAAAAAAAAAAFFfQLEe2tppYxY74CxghNNc6rfRIZ5P6btEf3FapVAMN0NtzqB/B8HPcFk+rxZe5xDedl11z23rZf29e/+w8mVcyv90r8HEIRCzhW5KHWPe1Gvc/DX1P0R/5xaeIfbJYOKT6qRhQRKWWRzLxCCLpZ6ZBmqIAP19byFZ/fIQzw7Zr32QVnV8a0pUrx4J2TNG0V/AVvWfNUdk05UR8HfvsxjhEaszb7toPapUiFIwxSzOWKpqYsz2hpUe8IdFHm4EB7HD6mVB8rjRUDM28g2Dacm/hsDuZ4Fl+xH1ucazqWaUJlTHLcspl0r9TIT44T/vs3FeXX0p3tFkBuRA93AeMBMM2ygIDCs9bWJmUKVmdou44jSQNTOk9ksPe8OmE2i/3y5LwULNuEDnSDtBPMhVghUYmSEUxYbV2WxfkasInn3BxaPG0qg+J5/Zo4WnSUtWh6yNqWw/O+4DbeK0FortV5yK0k4TsGUTfeadJrNHCJpOwE1qlOoqbCZcbkOKjhWEwK+NCPNtwYR0LudoFXwCDFL4sz4cmVi+8UqtEOcynp65BxwGS7eFnTkZErlYBj46/xGrEID76B40oVeVNrC7lI+Zm3v1eHpF7cGsxOWC1gG35cgRT4piZTriPm39FOiDRN9ko/6MoaUBiRCt14PpAqjqulJikYEVDXBc0dVKmLjWE+mWcp4GZOoig5N/1cfmK7mgphYiSpLT33iW5Qi++czciSyTucaxQ9UH2CapyQ2D1iSQhgMuAuyuYgrcnXNCmRgSzbBLmJMem9Du4cctjs3vXtnyj7iqZcuGSREOvVsKmID+cNBweLZBqC6s9uwb5o4/wWTpoganYOD2cc+alNUXdU1F7pt3Z1RaOrEoRxbgop0h9/AWfXSCpdXx/zxkyTeEZNIucE3YKh9hxqCJVwN28AsHTIiCp9h5EvdTQ6qtdlv4vboXPRr8LmzR4aGcboY0kFs53fhy05zw6WoAAQeChxcKba55QZIGiev+v3XZrE8SSgVUDaqV2QuRlzQAJ+3c05QH0nAsBkLpPt7pt9p4ExFomWZDVORgmdTFfeLHZvff72UHVAJIDx6guPM/+mG8YG/rculFjx9GX+52xTSBEDEi8akv7NIDUCkM5kgsKZsu+VZp71+IgTUBNxezvnAg7q98By/x/+bJLhMYkTslvkxkO6Vk2vtWXbvno/r2KY38BONeYC8gRuAfjCFc1D29CntHfF/CJ9tJVn2Vy2EQORFw5+TVZ2F3vOy1gJpTpPb9fP4w8rSpp4vtMLW0wwc8gacmaDSO9AFMwGGZia9pxBN34nfPni5M/a7iNKbc+YheeyKs1ArHyGm+tWyx19MNa4WP1FlqGpmLVruZ5j6fHAPyY4mjgqz9MLwMgU+d8EVBIcaQMS47+t372cXdNlpnzr5fwX4BI4/zSsNX3IlbAsgdx4kwbVbJCca0bNPU5YxP2WI7Bm3xBVZ1nJpNaDmXikgm+opVgoK7e+QPB5TbT3KOtopuMB8+apM2QR47f7dVMe8O0N2xVHhnYalyYaRRkbrCACfOlvMjRrK0eS8aT7u0RkxPsskuwmNqS2feEUHpJUAckCv6qIwsa2d3ykJF3pNYS1NTzxCRD79h7fT+uQ28yJ4kYTXUtgLunTkKpOkBAPD9360DsS/I42joQQCtNmladZ7EO4gXS3ApQciXYU+O+ITy+xntqILUgiUBnjqUXvOYfmlk87Htd/rPPD33NVbYd7SpO8HfzJJ40QSkt2EQAiNx8oFtNZfwQMyDPtzeLdyH+epogyHbQqYnebA4fBkcehXMYeOujI4BadSYft3YmwXd8tChiJ/W5gx8fpIeC4jgg5GptU2C0qxVSFTd+wDYFaRo0TQFy0BMxGZYPrAzTidbKRUnG08eKC186gKhbYmRtEcm0pgKaBXPCoJuM2hzdLkFOz+EEXPMS59ZqoxEdInRoJDa/0qeTyHT+0vpKboQJ2qlT0gtGd8fPbAr5x71ekrPqvDrqG7b/3H7UaPVu08uNJl5uwa2ZtxDRRGJDl0wJx/DbEmN2xtm1MeRmS5Y53cTpzvK80ROp+aq96aqR7vhuSnEmGH/PCwuM7HmwNNb1NW1JfH7DP5Z4Iw0LBrmP9IXulwFi3zHzam9lWTvIXigURFb3Nlo0jFzthUyntPQxla2y1N0sYq3pN2bFrCD2KnnFuzc5QVfYfj6FystogRnZZZBKIx/UVzgqkO8MyZnGX3EGZgPx1eW3k7BKdsa2p2WEgupJgCIho1QlRQVa6KDaB3YSskioOLQQF+k7rK+W5s5o7Tq+FhxpRK1GJwnfCCilewQEs8C0CFaAXNR2kStAP8fp3eXU5N4XZbLDW37RQ0MjUwM82TA/TgzQdatVniV59nO0a8nuShXj8q8xFAxdhWgj7bXeGbmkzqzcShXaKdxYo8Ro2zHiqdpxDn61KE+SiNX3iIdbsKAYO4u1UwZasX5C3LavpwPAgIOrOwkah4TABbyJWP6BkldI6c2DIZ7zoB6O8urIk1UktH97OXhDhhY+ZMbQba5c0e3vPYhzDsdZmLih/7YZ9ZKXIY0taF0g4uHReq1eMbhWSjnYnpIQjezez+0ItDtABLaqwH3lSFT0/3g49nRvvYomoiCId8CX/egrWLUddaHPSCWxqPm+17dEA0btIINHqlp/dMqhSvZ8pYksecyUUNDyZTPSTaABET+li5NIRIknBmamspRSxdsKz6Nm50iUPG5aRrWy9Prhi67FN8SkZi9BrLF0cFB6gbrbSY6zievnAhD2RYkMxW6doL5RnvoMAaqWAx4ESjXKrKkcQuNfDf8CQL+wlGRgNWkGOL+SmWcYUl7ecZS1FxftfqesV2ZNPDXFy4jSS0WXaTifNWjU0m4Jpu9TBrdGq1eavwEJjuz/47qBNhAlbG+ZvEe1NhJwZMTb6LeYcpLRkrOAM44EOifYYeP5rIJQjWavmCF7V/753P9ngl/LlTd09XRRUp/cOSepYu5MgcFFEE+6DUkvzQ0DlMESRboZvo6b381gK35zOj7ul8UKOClEcdb8E7NNb9qPIpfye7lt3a3PBg66HFhvoIUGtG8h7Yf0oGBtoTqNBVGIJEeWQJ+tkr7ErONananBZb6g+q2QnzcBazU6+8ffSvSOpDCFobGEmDWkcD1kiTTSQcy8/mrVguz/iCL4vA+5hz1BLK23PYBFSZoTdDYPH2z7w+GblLw7P3rGsGAQD8N7AJE81beOqMo0IH9BZHi+GTrQ/5qKUxeHjzKp05atMzmoNk908uP1Rtg0ojWdW3BejAdTpbTQw21I3Oemo9uLUsk6UJQ0fMekZAyeC2br0sKrGA2O0EUxxKRULVDgJrHo93irZKJQT8cxyaUTW1WsupQIOVVeCKeFX0ccLbwspIQ5chLlOREc3QApw+bDNxkx9a5+LzfVFcv21/CLGFiBCX7ERQEaIeV1XcTqwZc9qgChagSqmmW3BAkUL10gTwg9qvQCt2crVizoeBN/gfP+4YX5Z59bY2JnG9C5n3bK7k8Wn8E1BgznU7jyV/qjEarbgTE9twFOVx32/5ECvF1TIuin71fmM7zbAxAlSucZ2xJNOCeDRQyGbH/8E3BozFxwAL9JiEdsCqGWKXhBqXadP9oN170qBNcfiIBPM8kqWk3E1srTh3pKp4K9kicmhbEnMVixxPRTeIUDbFSKdnfWb+a7Y0KJ5HcWmHBmGvudarpbdfwEV2mbvqMLnNUT2L761WPn9ZyD/KPmv8jV7ULkc+BSyNbTL61U7a02h4D0i2EgduvovOuOtzBJttNOtSuf380DUo0Re0SEnfuYYhWk3NPjeDLfDOCNGNgasGC8paT1T+/iuKa5bh9Wikp4KBXR6oSS7vC44MbWJOVXj7tyzHLvSUJKCRyjieJNwNntWJscr+2ZK9xl14MmfPNcUwhvh5Tvor4cR8OKPQMwqEVmdNC1m4gIhuBmbTWnF2L1yf68VYNGQ+BbXk2hWoKsrjJg99u78NOMUTO93XQv3gNYlR5Mp+vUQbAgC8TjJ+GE37pd/J+k8IaUPrrm0bebWsOoI41Nc/PvdiDzchJaW1xWzJ7uiIXKf6sjuQnRJhuNnF3i8fsdgMJhYbHw1/h7D+eoku4FMmk3A0WwFmP32WJI3WXVlDUPD4BSyDrIXOFe4ZUY0bP6y1hOLOQS5id9iS2LGL5i95pvBO1/Z4HnoyndrIgjAu8ACZTX83781/N3vovJnyEx5NChrZrIKst2bmAoQnhQrSpidY2b8xgR+4wU94I1PPWCcnEXUDdvAMjfQdHDRk/PUnfiD4VZwM1tbvKddPx85U0DY8G8DB84pOs3JaLFPNosSnSGux0BcoKg6pk4vJS5aE3X/EoTxwd7owkuNMDP/UNgzv0AmYlDtvI1drhWAWy6pB8eg1Vjji8NQsnlJBqTvdxK9spg94R2A7t4fvKuogTsfdBw6y6muHbXoYlIrEz9izmZ8J9iyRPBf72Co6QmiUk7aWQFWAS4u5MggvMhiQsXUoDd5WIHAgAgDf16coG+LJyMueVcE/wRbp7PaTEpvByiPExYsWmv3rnC5zMgC/NsaQ89Dx7b5KkyU56A6JbUfrd6JBjwb8gd1V0+SA/owzyqFdAANWJPOPhKCVPnxGY7LcClQEXqs3aVSM2JgTxj+aluyUxL6NXxOj4YaJi9fyQOQ9keSTs2EMXmu3qamqKfF2ZmYocGGr3pQ+G3PivrBIV45utRrc6I3gA2m0kdiHj3cGT9NiS+xQyQcFVsQ1IOu9bmTW9uPD7p7Mpwxl1iAQ39+DdI6iC1X5F6w11P8VCxhyHA2eyUr3MnnlAFV76fbpqgieLqTopvLQJE24DE3LccxF56zcztY6ESuP9EJNotzWuHjXbkNsrqjAjyKqQvhFQemD+uneYF1Ko6sQOEYokpyMoHQiuHUF5UQO8Vbzb72Al4EAc90ZyBAAAAAAAAAAAAAAAAAAAAAAAAAAOEngHxwD6fMwI6YEAAAAAA";

// Telegram тренера для связи
const TRAINER_TELEGRAM = "seleznev_88";

const BookingSystem = () => {
  const [view, setView] = useState('select');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [storedPassword, setStoredPassword] = useState(null);
  
  const STORAGE_KEYS = {
    hockeySlots: 'hockey-training-slots',
    hockeyBookings: 'hockey-bookings',
    hockeyCancellations: 'hockey-cancellations',
    adminPass: 'admin-password',
    clientPhone: 'client-phone'
  };

  const [hockeySlots, setHockeySlots] = useState([]);
  const [hockeyBookings, setHockeyBookings] = useState([]);
  const [hockeyCancellations, setHockeyCancellations] = useState([]);

  const [cancelForm, setCancelForm] = useState({ phone: '', reason: '' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', duration: 60 });
  
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myBookingsPhone, setMyBookingsPhone] = useState('');
  const [foundBookings, setFoundBookings] = useState([]);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('full');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState(null);

  // Client booking state
  const [clientSelectedDate, setClientSelectedDate] = useState(null);
  const [clientMonth, setClientMonth] = useState(new Date());

  const timeTemplates = {
    full: {
      name: 'Полный день (9:00 - 21:30)',
      times: ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30']
    },
    morning: {
      name: 'Утро (9:00 - 12:45)',
      times: ['09:00', '10:15', '11:30', '12:45']
    },
    afternoon: {
      name: 'День (14:00 - 17:45)',
      times: ['14:00', '15:15', '16:30', '17:45']
    },
    evening: {
      name: 'Вечер (19:00 - 21:30)',
      times: ['19:00', '20:15', '21:30']
    }
  };

  const [clientForm, setClientForm] = useState({ name: '', phone: '', telegram: '', comment: '' });
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    loadData();
    checkStoredPassword();
  }, []);

  const checkStoredPassword = () => {
    try {
      const result = localStorage.getItem(STORAGE_KEYS.adminPass);
      if (result) {
        setStoredPassword(result);
      }
    } catch (error) {
      console.log('No stored password yet');
    }
  };

  const loadData = () => {
    try {
      const slotsData = localStorage.getItem(STORAGE_KEYS.hockeySlots);
      const bookingsData = localStorage.getItem(STORAGE_KEYS.hockeyBookings);
      const cancelData = localStorage.getItem(STORAGE_KEYS.hockeyCancellations);
      const phoneData = localStorage.getItem(STORAGE_KEYS.clientPhone);

      if (slotsData) setHockeySlots(JSON.parse(slotsData));
      if (bookingsData) setHockeyBookings(JSON.parse(bookingsData));
      if (cancelData) setHockeyCancellations(JSON.parse(cancelData));
      if (phoneData) setMyBookingsPhone(phoneData);
    } catch (error) {
      console.log('Initializing new storage');
    }
  };

  const saveData = (type, data) => {
    try {
      localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  };

  const handleAdminLogin = () => {
    if (!adminPassword.trim()) {
      alert('Введите пароль');
      return;
    }

    if (!storedPassword) {
      const success = localStorage.setItem(STORAGE_KEYS.adminPass, adminPassword);
      if (success) {
        setStoredPassword(adminPassword);
        setIsAdminAuth(true);
        setView('admin-hockey');
        alert('Пароль успешно установлен!');
      } else {
        alert('Ошибка сохранения пароля');
      }
    } else {
      if (storedPassword === adminPassword) {
        setIsAdminAuth(true);
        setView('admin-hockey');
      } else {
        alert('Неверный пароль!');
        setAdminPassword('');
      }
    }
  };

  const getNextWeekDates = () => {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7));
    
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(nextSunday);
      date.setDate(nextSunday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const copyLastWeekSchedule = () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    
    const lastWeekSlots = hockeySlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= lastWeekStart && slotDate < today;
    });

    if (lastWeekSlots.length === 0) {
      alert('Нет слотов за прошлую неделю для копирования');
      return;
    }

    const newSlots = [];
    lastWeekSlots.forEach(slot => {
      const oldDate = new Date(slot.date);
      const newDate = new Date(oldDate);
      newDate.setDate(oldDate.getDate() + 7);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      // Check if slot already exists for this date and time
      const exists = hockeySlots.some(s => s.date === newDateStr && s.time === slot.time);
      if (!exists) {
        newSlots.push({
          id: `${Date.now()}-${Math.random()}`,
          date: newDateStr,
          time: slot.time,
          duration: slot.duration,
          status: 'available'
        });
      }
    });

    if (newSlots.length === 0) {
      alert('⚠️ Все слоты уже существуют!');
      return;
    }

    const updated = [...hockeySlots, ...newSlots];
    setHockeySlots(updated);
    saveData('hockeySlots', updated);
    alert(`✅ Скопировано ${newSlots.length} слотов на следующую неделю!`);
  };

  const addNextWeekSchedule = () => {
    const nextWeekDates = getNextWeekDates();
    const newSlots = [];

    nextWeekDates.forEach(date => {
      timeTemplates[selectedTemplate].times.forEach(time => {
        // Check if slot already exists for this date and time
        const exists = hockeySlots.some(s => s.date === date && s.time === time);
        if (!exists) {
          newSlots.push({
            id: `${Date.now()}-${Math.random()}-${time}-${date}`,
            date: date,
            time: time,
            duration: 60,
            status: 'available'
          });
        }
      });
    });

    if (newSlots.length === 0) {
      alert('⚠️ Все слоты на следующую неделю уже существуют!');
      return;
    }

    const updated = [...hockeySlots, ...newSlots];
    setHockeySlots(updated);
    saveData('hockeySlots', updated);
    alert(`✅ Добавлено ${newSlots.length} слотов на следующую неделю!`);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 };
  };

  const toggleDateSelection = (dateStr) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const addSlotsFromCalendar = () => {
    if (selectedDates.length === 0) {
      alert('Выберите хотя бы один день');
      return;
    }

    const template = timeTemplates[selectedTemplate];
    const newSlots = [];

    selectedDates.forEach(dateStr => {
      template.times.forEach(time => {
        // Check if slot already exists for this date and time
        const exists = hockeySlots.some(s => s.date === dateStr && s.time === time);
        if (!exists) {
          newSlots.push({
            id: `${Date.now()}-${Math.random()}-${time}-${dateStr}`,
            date: dateStr,
            time: time,
            duration: 60,
            status: 'available'
          });
        }
      });
    });

    if (newSlots.length === 0) {
      alert('⚠️ Все слоты на выбранные дни уже существуют!');
      setSelectedDates([]);
      return;
    }

    const updated = [...hockeySlots, ...newSlots];
    setHockeySlots(updated);
    saveData('hockeySlots', updated);

    alert(`Добавлено ${newSlots.length} слотов на ${selectedDates.length} дней!`);
    setSelectedDates([]);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Заполните дату и время');
      return;
    }

    // Check if slot already exists for this date and time
    const exists = hockeySlots.some(s => s.date === newSlot.date && s.time === newSlot.time);
    if (exists) {
      alert('⚠️ Слот на это время уже существует!');
      return;
    }

    const slot = {
      id: `${Date.now()}-${Math.random()}`,
      date: newSlot.date,
      time: newSlot.time,
      duration: newSlot.duration,
      status: 'available'
    };

    const updated = [...hockeySlots, slot];
    setHockeySlots(updated);
    saveData('hockeySlots', updated);
    setNewSlot({ date: '', time: '', duration: 60 });
  };

  const removeDuplicateSlots = () => {
    const seen = new Set();
    const uniqueSlots = hockeySlots.filter(slot => {
      const key = `${slot.date}-${slot.time}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const removed = hockeySlots.length - uniqueSlots.length;
    if (removed === 0) {
      alert('Дубликатов не найдено!');
      return;
    }

    setHockeySlots(uniqueSlots);
    saveData('hockeySlots', uniqueSlots);
    alert(`✅ Удалено ${removed} дубликатов!`);
  };

  const deleteSlot = (slotId) => {
    const updated = hockeySlots.filter(s => s.id !== slotId);
    setHockeySlots(updated);
    saveData('hockeySlots', updated);
  };

  const toggleSlotSelection = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const submitBooking = () => {
    const phoneToUse = clientForm.phone || myBookingsPhone;
    
    if (!clientForm.name || !phoneToUse || selectedSlots.length === 0) {
      alert('Заполните имя, телефон и выберите хотя бы один слот');
      return;
    }

    const booking = {
      id: `${Date.now()}-${Math.random()}`,
      slotIds: selectedSlots,
      name: clientForm.name,
      phone: phoneToUse,
      telegram: clientForm.telegram ? clientForm.telegram.replace('@', '') : '',
      comment: clientForm.comment,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [...hockeyBookings, booking];
    setHockeyBookings(updated);
    saveData('hockeyBookings', updated);
    
    const updatedSlots = hockeySlots.map(slot => 
      selectedSlots.includes(slot.id) ? { ...slot, status: 'pending', bookingId: booking.id } : slot
    );
    setHockeySlots(updatedSlots);
    saveData('hockeySlots', updatedSlots);

    // Save client phone for future use
    setMyBookingsPhone(phoneToUse);
    localStorage.setItem(STORAGE_KEYS.clientPhone, phoneToUse);

    setClientForm({ name: '', phone: '', telegram: '', comment: '' });
    setSelectedSlots([]);
    setBookingSuccess(true);
  };

  const requestCancellation = () => {
    if (!cancelForm.phone) {
      alert('Введите номер телефона, который вы указали при записи');
      return;
    }

    const userBookings = hockeyBookings.filter(b => 
      b.phone === cancelForm.phone && b.status === 'confirmed'
    );

    if (userBookings.length === 0) {
      alert('Записи с этим номером телефона не найдены');
      return;
    }

    // Check if there's already a pending cancellation
    const existingCancellation = hockeyCancellations.find(
      c => c.bookingId === userBookings[0].id && c.status === 'pending'
    );

    if (existingCancellation) {
      alert('Запрос на отмену уже отправлен и ожидает рассмотрения');
      setShowCancelModal(false);
      return;
    }

    const cancellationRequest = {
      id: `${Date.now()}-${Math.random()}`,
      bookingId: userBookings[0].id,
      phone: cancelForm.phone,
      reason: cancelForm.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [...hockeyCancellations, cancellationRequest];
    setHockeyCancellations(updated);
    saveData('hockeyCancellations', updated);

    setCancelForm({ phone: '', reason: '' });
    setShowCancelModal(false);
    
    // Refresh found bookings to show updated status
    const refreshedBookings = hockeyBookings.filter(b => b.phone === myBookingsPhone);
    setFoundBookings(refreshedBookings);
  };

  const approveCancellation = async (cancellationId) => {
    const cancellation = hockeyCancellations.find(c => c.id === cancellationId);
    if (!cancellation) return;

    // Find the booking FIRST before any state updates
    const booking = hockeyBookings.find(b => b.id === cancellation.bookingId);
    
    if (!booking) {
      alert('Бронирование не найдено');
      return;
    }

    // Get slot IDs from booking
    const slotIdsToFree = booking.slotIds;

    // Update cancellation status
    const updatedCancellations = hockeyCancellations.map(c =>
      c.id === cancellationId ? { ...c, status: 'approved' } : c
    );

    // Update booking status
    const updatedBookings = hockeyBookings.map(b =>
      b.id === cancellation.bookingId ? { ...b, status: 'cancelled' } : b
    );

    // Free up the slots - set status to 'available' and remove bookingId
    const updatedSlots = hockeySlots.map(slot => {
      if (slotIdsToFree.includes(slot.id)) {
        return { ...slot, status: 'available', bookingId: null };
      }
      return slot;
    });

    // Update all states
    setHockeyCancellations(updatedCancellations);
    setHockeyBookings(updatedBookings);
    setHockeySlots(updatedSlots);

    // Save all to storage
    saveData('hockeyCancellations', updatedCancellations);
    saveData('hockeyBookings', updatedBookings);
    saveData('hockeySlots', updatedSlots);

    alert('✅ Отмена одобрена, слоты освобождены и доступны для записи');
  };

  const rejectCancellation = async (cancellationId) => {
    const updated = hockeyCancellations.map(c =>
      c.id === cancellationId ? { ...c, status: 'rejected' } : c
    );
    setHockeyCancellations(updated);
    saveData('hockeyCancellations', updated);
  };

  const approveBooking = async (bookingId) => {
    const updated = hockeyBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' } : b
    );
    setHockeyBookings(updated);
    saveData('hockeyBookings', updated);

    const updatedSlots = hockeySlots.map(slot => 
      slot.bookingId === bookingId ? { ...slot, status: 'booked' } : slot
    );
    setHockeySlots(updatedSlots);
    saveData('hockeySlots', updatedSlots);
  };

  const rejectBooking = async (bookingId) => {
    const updated = hockeyBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'rejected' } : b
    );
    setHockeyBookings(updated);
    saveData('hockeyBookings', updated);

    const updatedSlots = hockeySlots.map(slot => 
      slot.bookingId === bookingId ? { ...slot, status: 'available', bookingId: null } : slot
    );
    setHockeySlots(updatedSlots);
    saveData('hockeySlots', updatedSlots);
  };

  const cancelConfirmedBooking = async (bookingId) => {
    // Find the booking FIRST
    const booking = hockeyBookings.find(b => b.id === bookingId);
    
    if (!booking) {
      alert('Бронирование не найдено');
      return;
    }

    // Get slot IDs from booking
    const slotIdsToFree = booking.slotIds;

    // Update booking status
    const updatedBookings = hockeyBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled_by_admin' } : b
    );

    // Free up the slots
    const updatedSlots = hockeySlots.map(slot => {
      if (slotIdsToFree.includes(slot.id)) {
        return { ...slot, status: 'available', bookingId: null };
      }
      return slot;
    });

    // Update states
    setHockeyBookings(updatedBookings);
    setHockeySlots(updatedSlots);

    // Save to storage
    saveData('hockeyBookings', updatedBookings);
    saveData('hockeySlots', updatedSlots);

    // Close modal
    setConfirmCancelBookingId(null);
  };

  const exportToExcel = () => {
    const confirmedBookings = hockeyBookings.filter(b => b.status === 'confirmed');
    
    let csv = 'Имя,Телефон,Дата и время занятий,Комментарий,Статус\n';
    
    confirmedBookings.forEach(booking => {
      const slotInfo = booking.slotIds.map(slotId => {
        const slot = hockeySlots.find(s => s.id === slotId);
        return slot ? `${slot.date} ${slot.time}` : '';
      }).join('; ');
      
      csv += `"${booking.name}","${booking.phone}","${slotInfo}","${booking.comment || ''}","${booking.status}"\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Хоккей_клиенты_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const searchMyBookings = () => {
    if (!myBookingsPhone.trim()) {
      alert('Введите номер телефона');
      return;
    }

    // Save phone for future use
    localStorage.setItem(STORAGE_KEYS.clientPhone, myBookingsPhone);

    const userBookings = hockeyBookings.filter(b => 
      b.phone === myBookingsPhone
    );

    setFoundBookings(userBookings);
  };

  // Auto-load bookings when phone is available
  const loadMyBookings = () => {
    if (myBookingsPhone) {
      const userBookings = hockeyBookings.filter(b => b.phone === myBookingsPhone);
      setFoundBookings(userBookings);
    }
  };

  const getStatistics = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    const confirmedBookings = hockeyBookings.filter(b => b.status === 'confirmed');
    
    const weekBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= weekAgo).length;
    const monthBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= monthAgo).length;
    const totalBookings = confirmedBookings.length;
    const cancelledBookings = hockeyBookings.filter(b => b.status === 'cancelled' || b.status === 'cancelled_by_admin').length;

    const slotsByDay = {};
    hockeySlots.forEach(slot => {
      const day = new Date(slot.date).toLocaleDateString('ru-RU', { weekday: 'short' });
      slotsByDay[day] = (slotsByDay[day] || 0) + 1;
    });

    const bookingsByHour = {};
    confirmedBookings.forEach(booking => {
      booking.slotIds.forEach(slotId => {
        const slot = hockeySlots.find(s => s.id === slotId);
        if (slot) {
          const hour = slot.time.split(':')[0];
          bookingsByHour[hour] = (bookingsByHour[hour] || 0) + 1;
        }
      });
    });

    return {
      weekBookings,
      monthBookings,
      totalBookings,
      cancelledBookings,
      slotsByDay,
      bookingsByHour
    };
  };

  // Get available dates for client calendar
  const getAvailableDates = () => {
    const availableSlots = hockeySlots.filter(s => s.status === 'available');
    const dates = [...new Set(availableSlots.map(s => s.date))];
    return dates;
  };

  // Get slots for a specific date
  const getSlotsForDate = (dateStr) => {
    return hockeySlots.filter(s => s.date === dateStr && s.status === 'available')
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('ru-RU', options);
  };

  const renderSelectView = () => (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto pt-12">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <img 
            src={BRAND_LOGO} 
            alt="Hockey Puck" 
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-4xl font-bold text-black tracking-tight">
            HOCKEY TRAINING
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Система бронирования тренировок</p>
        </div>
        
        <div className="max-w-md mx-auto mb-8">
          <button
            onClick={() => setView('client-hockey')}
            className="w-full bg-black text-white p-8 rounded-2xl shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105 border-2 border-black"
          >
            <h2 className="text-2xl font-bold text-center mb-2">
              Записаться на тренировку
            </h2>
            <p className="text-gray-300 text-center">
              Катание на коньках • Техника • Индивидуальный подход
            </p>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setView('admin-login')}
            className="text-gray-500 hover:text-black underline text-lg transition-colors"
          >
            Вход для администратора
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border-2 border-black">
        <div className="text-center mb-6">
          <img 
            src={BRAND_LOGO} 
            alt="Hockey Puck" 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-black">Вход администратора</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 text-center">
          {storedPassword ? 'Введите пароль для входа' : 'Установите пароль администратора (запомните его!)'}
        </p>
        <input
          type="password"
          placeholder="Введите пароль"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-black focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
          autoFocus
        />
        <button
          onClick={handleAdminLogin}
          className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 text-lg font-semibold transition-colors"
        >
          {storedPassword ? 'Войти' : 'Установить пароль и войти'}
        </button>
        <button
          onClick={() => {
            setView('select');
            setAdminPassword('');
          }}
          className="w-full mt-4 text-gray-600 hover:text-black transition-colors"
        >
          Назад
        </button>
      </div>
    </div>
  );

  const renderClientBooking = () => {
    const availableDates = getAvailableDates();
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(clientMonth);
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date().toISOString().split('T')[0];

    // Success screen
    if (bookingSuccess) {
      return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-2 border-black">
            <img 
              src={BRAND_LOGO} 
              alt="Hockey Puck" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold mb-4 text-black">Заявка отправлена!</h2>
            <p className="text-gray-600 mb-4">
              Ваша заявка на тренировку отправлена. Ожидайте подтверждения от тренера.
            </p>
            <div className="bg-gray-100 p-4 rounded-xl mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">📍 Место проведения:</p>
              <p className="font-bold text-black">Каток «Галактика»</p>
              <p className="text-gray-700">г. Мытищи, ТЦ Июнь</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setShowMyBookings(true);
                }}
                className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Посмотреть мои записи
              </button>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setClientSelectedDate(null);
                }}
                className="w-full bg-white text-black p-3 rounded-lg hover:bg-gray-100 border-2 border-black transition-colors"
              >
                Записаться ещё
              </button>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setView('select');
                }}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    // My bookings modal
    if (showMyBookings) {
      // Auto-load bookings if phone is saved
      const currentBookings = myBookingsPhone 
        ? hockeyBookings.filter(b => b.phone === myBookingsPhone)
        : foundBookings;

      return (
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <button
              onClick={() => setShowMyBookings(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Назад к записи
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img src={BRAND_LOGO} alt="Logo" className="w-10 h-10 object-contain" />
                  <h2 className="text-2xl font-bold text-black">Мои записи</h2>
                </div>
                <a
                  href={`https://t.me/${TRAINER_TELEGRAM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
                >
                  ✈️ Написать тренеру
                </a>
              </div>
              
              {/* Phone input with clear button */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    placeholder="Введите номер телефона"
                    value={myBookingsPhone}
                    onChange={(e) => setMyBookingsPhone(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg pr-10 focus:border-black focus:outline-none"
                  />
                  {myBookingsPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setMyBookingsPhone('');
                        setFoundBookings([]);
                        localStorage.removeItem(STORAGE_KEYS.clientPhone);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={searchMyBookings}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Найти
                </button>
              </div>

              {/* Saved phone indicator */}
              {myBookingsPhone && currentBookings.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-lg mb-4 flex items-center gap-2 border border-gray-300">
                  <Phone size={16} className="text-black" />
                  <span className="text-sm text-gray-700">
                    Показаны записи для номера: <strong>{myBookingsPhone}</strong>
                  </span>
                </div>
              )}

              {currentBookings.length > 0 ? (
                <div className="space-y-4">
                  {currentBookings.map(booking => {
                    // Check if there's a pending cancellation request for this booking
                    const pendingCancellation = hockeyCancellations.find(
                      c => c.bookingId === booking.id && c.status === 'pending'
                    );
                    
                    // Determine status styling
                    let statusStyle = '';
                    let statusText = '';
                    let statusIcon = '';
                    
                    switch(booking.status) {
                      case 'confirmed':
                        if (pendingCancellation) {
                          statusStyle = 'bg-orange-50 border-orange-500';
                          statusText = 'Запрос на отмену отправлен';
                          statusIcon = '📤';
                        } else {
                          statusStyle = 'bg-green-50 border-green-500';
                          statusText = 'Подтверждено';
                          statusIcon = '✅';
                        }
                        break;
                      case 'pending':
                        statusStyle = 'bg-yellow-50 border-yellow-500';
                        statusText = 'Ожидает подтверждения';
                        statusIcon = '⏳';
                        break;
                      case 'rejected':
                        statusStyle = 'bg-red-50 border-red-500';
                        statusText = 'Отклонено администратором';
                        statusIcon = '❌';
                        break;
                      case 'cancelled':
                        statusStyle = 'bg-gray-100 border-gray-400';
                        statusText = 'Отменено по вашему запросу';
                        statusIcon = '🚫';
                        break;
                      case 'cancelled_by_admin':
                        statusStyle = 'bg-orange-50 border-orange-500';
                        statusText = 'Отменено администратором';
                        statusIcon = '⚠️';
                        break;
                      default:
                        statusStyle = 'bg-gray-50 border-gray-300';
                        statusText = 'Неизвестный статус';
                        statusIcon = '❓';
                    }
                    
                    return (
                      <div 
                        key={booking.id} 
                        className={`p-4 rounded-lg border-l-4 ${statusStyle}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{booking.name}</p>
                            <p className={`text-sm font-medium ${
                              booking.status === 'confirmed' && !pendingCancellation ? 'text-green-700' :
                              booking.status === 'confirmed' && pendingCancellation ? 'text-orange-700' :
                              booking.status === 'pending' ? 'text-yellow-700' :
                              booking.status === 'rejected' || booking.status === 'cancelled_by_admin' ? 'text-red-700' :
                              'text-gray-600'
                            }`}>
                              {statusIcon} {statusText}
                            </p>
                          </div>
                        </div>
                        
                        {/* Show pending cancellation notice */}
                        {pendingCancellation && booking.status === 'confirmed' && (
                          <div className="bg-orange-100 p-3 rounded-lg mb-3 text-sm">
                            <p className="text-orange-800 font-medium">⏳ Ваш запрос на отмену ожидает рассмотрения администратором</p>
                            {pendingCancellation.reason && (
                              <p className="text-orange-700 mt-1">Причина: {pendingCancellation.reason}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 space-y-1">
                          {booking.slotIds.map(slotId => {
                            const slot = hockeySlots.find(s => s.id === slotId);
                            if (!slot) return null;
                            return (
                              <div key={slotId} className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-indigo-600" />
                                <span>{formatDate(slot.date)}</span>
                                <Clock size={14} className="text-indigo-600" />
                                <span>{slot.time}</span>
                              </div>
                            );
                          })}
                        </div>
                        {booking.status === 'confirmed' && !pendingCancellation && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelForm({ phone: myBookingsPhone, reason: '' });
                              setShowCancelModal(true);
                            }}
                            className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Запросить отмену
                          </button>
                        )}
                        {(booking.status === 'rejected' || booking.status === 'cancelled' || booking.status === 'cancelled_by_admin') && (
                          <p className="mt-3 text-sm text-gray-500">
                            Слоты снова доступны для записи
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : myBookingsPhone ? (
                <p className="text-gray-500 text-center py-8">
                  Записи не найдены для номера {myBookingsPhone}
                </p>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Введите номер телефона, чтобы найти свои записи
                </p>
              )}
            </div>
          </div>

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-2xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Запрос на отмену</h3>
                <textarea
                  placeholder="Причина отмены (необязательно)"
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                  className="w-full p-3 border rounded-lg mb-4 h-24"
                />
                <div className="flex gap-3">
                  <button
                    onClick={requestCancellation}
                    className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
                  >
                    Отправить запрос
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto pt-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setView('select')}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              Назад
            </button>
            <button
              onClick={() => setShowMyBookings(true)}
              className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-md flex items-center gap-2 border border-gray-300 hover:border-black transition-colors"
            >
              <User size={18} />
              Мои записи
            </button>
          </div>

          {/* Title with logo */}
          <div className="text-center mb-8">
            <img src={BRAND_LOGO} alt="Logo" className="w-16 h-16 mx-auto mb-3 object-contain" />
            <h1 className="text-3xl font-bold text-black">Запись на тренировку</h1>
            <p className="text-gray-600 mt-1">Выберите удобные дату и время</p>
          </div>

          {availableDates.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center border-2 border-gray-200">
              <img src={BRAND_LOGO} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain opacity-50" />
              <h2 className="text-xl font-bold mb-2 text-black">Нет доступных слотов</h2>
              <p className="text-gray-600">
                К сожалению, сейчас нет свободных мест для записи. Пожалуйста, загляните позже.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="font-bold text-lg text-black">
                    {monthNames[clientMonth.getMonth()]} {clientMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={() => setClientMonth(new Date(clientMonth.getFullYear(), clientMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-3" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${clientMonth.getFullYear()}-${String(clientMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasSlots = availableDates.includes(dateStr);
                    const isSelected = clientSelectedDate === dateStr;
                    const isPast = dateStr < today;

                    return (
                      <button
                        key={day}
                        onClick={() => hasSlots && !isPast && setClientSelectedDate(dateStr)}
                        disabled={!hasSlots || isPast}
                        className={`p-3 rounded-lg text-center transition-all ${
                          isSelected
                            ? 'bg-black text-white font-bold'
                            : hasSlots && !isPast
                            ? 'bg-gray-100 hover:bg-gray-200 text-black font-medium border border-gray-300'
                            : isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
                    <span>Есть места</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded"></div>
                    <span>Выбрано</span>
                  </div>
                </div>
              </div>

              {/* Time slots and form */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
                {clientSelectedDate ? (
                  <>
                    <h3 className="font-bold text-lg mb-2 text-black">
                      {formatDate(clientSelectedDate)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">Выберите время (можно несколько)</p>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {getSlotsForDate(clientSelectedDate).map(slot => {
                        const isSelected = selectedSlots.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            onClick={() => toggleSlotSelection(slot.id)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              isSelected
                                ? 'bg-black text-white font-bold'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                            }`}
                          >
                            <Clock size={16} className="mx-auto mb-1" />
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlots.length > 0 && (
                      <div className="border-t border-gray-300 pt-4">
                        <h4 className="font-bold mb-3 text-black">Ваши данные</h4>
                        <div className="space-y-3">
                          <div className="relative">
                            <User size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Ваше имя"
                              value={clientForm.name}
                              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                              className="w-full pl-10 p-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                            />
                          </div>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="tel"
                              placeholder="Телефон"
                              value={clientForm.phone || myBookingsPhone}
                              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                              className="w-full pl-10 p-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                            />
                            {myBookingsPhone && !clientForm.phone && (
                              <span className="absolute right-3 top-3 text-xs text-gray-500">✓ сохранён</span>
                            )}
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400">@</span>
                            <input
                              type="text"
                              placeholder="Telegram (необязательно)"
                              value={clientForm.telegram}
                              onChange={(e) => setClientForm({ ...clientForm, telegram: e.target.value.replace('@', '') })}
                              className="w-full pl-10 p-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                            />
                          </div>
                          <div className="relative">
                            <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                              placeholder="Комментарий (необязательно)"
                              value={clientForm.comment}
                              onChange={(e) => setClientForm({ ...clientForm, comment: e.target.value })}
                              className="w-full pl-10 p-3 border-2 border-gray-300 rounded-lg h-20 focus:border-black focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={submitBooking}
                            className="w-full bg-black text-white p-4 rounded-lg hover:bg-gray-800 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <CheckCircle size={20} />
                            Записаться ({selectedSlots.length} {selectedSlots.length === 1 ? 'занятие' : 'занятия'})
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Выберите дату в календаре</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const pendingCount = hockeyBookings.filter(b => b.status === 'pending').length;
    const pendingCancellations = hockeyCancellations.filter(c => c.status === 'pending').length;
    const totalNotifications = pendingCount + pendingCancellations;
    const stats = getStatistics();

    const filteredBookings = hockeyBookings.filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(query) || b.phone.includes(query);
    });

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img src={BRAND_LOGO} alt="Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-3xl font-bold text-black">Админ панель</h1>
              </div>
              <div className="flex gap-3 flex-wrap relative">
                {totalNotifications > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                    >
                      <Bell size={20} />
                      {totalNotifications}
                    </button>
                    
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotifications(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border-2 border-black z-50 max-h-96 overflow-y-auto">
                          <div className="p-4 border-b border-gray-300 bg-gray-100 sticky top-0">
                            <h3 className="font-bold text-lg text-black">Уведомления ({totalNotifications})</h3>
                          </div>
                          
                          {pendingCount > 0 && (
                            <div className="p-3 border-b border-gray-200">
                              <p className="font-semibold text-black mb-2">Новые заявки ({pendingCount})</p>
                              {hockeyBookings.filter(b => b.status === 'pending').map(booking => (
                                <div key={booking.id} className="bg-gray-100 p-2 rounded mb-2 text-sm border border-gray-300">
                                  <p className="font-bold">{booking.name}</p>
                                  <p className="text-gray-600">{booking.phone}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {pendingCancellations > 0 && (
                            <div className="p-3">
                              <p className="font-semibold text-black mb-2">Запросы на отмену ({pendingCancellations})</p>
                              {hockeyCancellations.filter(c => c.status === 'pending').map(cancellation => {
                                const booking = hockeyBookings.find(b => b.id === cancellation.bookingId);
                                return (
                                  <div key={cancellation.id} className="bg-gray-100 p-2 rounded mb-2 text-sm border border-gray-300">
                                    <p className="font-bold">{booking?.name || 'Неизвестно'}</p>
                                    <p className="text-gray-600">{cancellation.phone}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="w-full p-3 text-center text-gray-600 hover:bg-gray-100 sticky bottom-0 bg-white border-t"
                          >
                            Закрыть
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2 border border-gray-400 transition-colors"
                >
                  <BarChart3 size={20} />
                  Статистика
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2 border border-gray-400 transition-colors"
                >
                  <Download size={20} />
                  Excel
                </button>
                <button
                  onClick={() => {
                    setIsAdminAuth(false);
                    setAdminPassword('');
                    setView('select');
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Выйти
                </button>
              </div>
            </div>

            {/* Today's Schedule */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayBookings = hockeyBookings
                .filter(b => b.status === 'confirmed' && b.slotIds.some(slotId => {
                  const slot = hockeySlots.find(s => s.id === slotId);
                  return slot && slot.date === today;
                }))
                .map(b => ({
                  ...b,
                  slots: b.slotIds
                    .map(id => hockeySlots.find(s => s.id === id))
                    .filter(s => s && s.date === today)
                    .sort((a, b) => a.time.localeCompare(b.time))
                }))
                .sort((a, b) => a.slots[0]?.time.localeCompare(b.slots[0]?.time));

              return (
                <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-300">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-green-800">
                    📅 Расписание на сегодня
                    <span className="text-sm font-normal text-green-600">
                      ({new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })})
                    </span>
                  </h3>
                  
                  {todayBookings.length === 0 ? (
                    <p className="text-green-700">На сегодня записей нет</p>
                  ) : (
                    <div className="space-y-3">
                      {todayBookings.map(booking => (
                        <div key={booking.id} className="bg-white p-4 rounded-lg border border-green-200 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg text-black">{booking.name}</p>
                            <p className="text-gray-600">{booking.phone}</p>
                            {booking.telegram && <p className="text-sm text-blue-600">@{booking.telegram}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                              <a href={`tel:${booking.phone}`} className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">📞</a>
                              {booking.telegram && (
                                <a href={`https://t.me/${booking.telegram}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm">✈️</a>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {booking.slots.map(slot => (
                                <span key={slot.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                                  🕐 {slot.time}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-green-700 mt-2">
                        Всего клиентов сегодня: {todayBookings.length}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Statistics Panel */}
            {showStats && (
              <div className="bg-gray-100 p-6 rounded-xl mb-6 border-2 border-gray-300">
                <h3 className="font-bold text-2xl mb-4 flex items-center gap-2 text-black">
                  <TrendingUp size={24} />
                  Статистика и аналитика
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">За неделю</p>
                    <p className="text-3xl font-bold text-black">{stats.weekBookings}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">За месяц</p>
                    <p className="text-3xl font-bold text-black">{stats.monthBookings}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">Всего записей</p>
                    <p className="text-3xl font-bold text-black">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">Отменено</p>
                    <p className="text-3xl font-bold text-gray-500">{stats.cancelledBookings}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h4 className="font-bold mb-3 text-black">Загруженность по дням</h4>
                    {Object.entries(stats.slotsByDay).length > 0 ? (
                      Object.entries(stats.slotsByDay).map(([day, count]) => (
                        <div key={day} className="flex justify-between items-center mb-2">
                          <span>{day}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(stats.slotsByDay))) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold">{count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Нет данных</p>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-bold mb-3">Популярные часы</h4>
                    {Object.entries(stats.bookingsByHour).length > 0 ? (
                      Object.entries(stats.bookingsByHour)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([hour, count]) => (
                          <div key={hour} className="flex justify-between items-center mb-2">
                            <span>{hour}:00</span>
                            <span className="font-bold text-indigo-600">{count} записей</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Нет данных</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3 text-xl flex items-center gap-2">
                <Plus size={20} />
                Быстрые действия
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={addNextWeekSchedule}
                  className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  Добавить следующую неделю
                </button>
                
                <button
                  onClick={copyLastWeekSchedule}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Copy size={20} />
                  Копировать прошлую неделю
                </button>

                <button
                  onClick={removeDuplicateSlots}
                  className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Удалить дубликаты
                </button>

                <div className="bg-white p-3 rounded-lg border-2 border-gray-300">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {Object.entries(timeTemplates).map(([key, template]) => (
                      <option key={key} value={key}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Поиск по имени или телефону..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-3 border-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Cancellation requests */}
            {pendingCancellations > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-xl text-red-600">⚠️ Запросы на отмену ({pendingCancellations})</h3>
                <div className="space-y-3">
                  {hockeyCancellations.filter(c => c.status === 'pending').map(cancellation => {
                    const booking = hockeyBookings.find(b => b.id === cancellation.bookingId);
                    return (
                      <div key={cancellation.id} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div className="flex-1">
                            <p className="font-bold">{booking?.name || 'Неизвестно'}</p>
                            <p className="text-sm text-gray-600">{cancellation.phone}</p>
                            {cancellation.reason && (
                              <p className="text-sm mt-1 text-gray-700">💬 {cancellation.reason}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Слоты: {booking?.slotIds.map(slotId => {
                                const slot = hockeySlots.find(s => s.id === slotId);
                                return slot ? `${slot.date} ${slot.time}` : '';
                              }).join(', ')}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => approveCancellation(cancellation.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-sm"
                            >
                              <CheckCircle size={16} />
                              Разрешить
                            </button>
                            <button
                              onClick={() => rejectCancellation(cancellation.id)}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1 text-sm"
                            >
                              <XCircle size={16} />
                              Отклонить
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending Bookings */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-xl">Новые заявки ({pendingCount})</h3>
              {pendingCount === 0 ? (
                <p className="text-gray-500">Нет новых заявок</p>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.filter(b => b.status === 'pending').map(booking => (
                    <div key={booking.id} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div className="flex-1">
                          <p className="font-bold">{booking.name}</p>
                          <p className="text-sm text-gray-600">{booking.phone}</p>
                          {booking.telegram && <p className="text-sm text-blue-600">@{booking.telegram}</p>}
                          {booking.comment && <p className="text-sm mt-1 text-gray-700">💬 {booking.comment}</p>}
                          <p className="text-sm text-gray-600 mt-1">
                            {booking.slotIds.map(slotId => {
                              const slot = hockeySlots.find(s => s.id === slotId);
                              return slot ? `${slot.date} ${slot.time}` : '';
                            }).join(', ')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveBooking(booking.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-sm"
                            >
                              <CheckCircle size={16} />
                              Подтвердить
                            </button>
                            <button
                              onClick={() => rejectBooking(booking.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1 text-sm"
                            >
                              <XCircle size={16} />
                              Отклонить
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`tel:${booking.phone}`}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1 text-sm"
                            >
                              📞 Позвонить
                            </a>
                            {booking.telegram && (
                              <a
                                href={`https://t.me/${booking.telegram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-sm"
                              >
                                ✈️ Telegram
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Bookings */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-xl">Подтвержденные записи ({filteredBookings.filter(b => b.status === 'confirmed').length})</h3>
              {filteredBookings.filter(b => b.status === 'confirmed').length === 0 ? (
                <p className="text-gray-500">Нет подтвержденных записей</p>
              ) : (
                <div className="space-y-2">
                  {filteredBookings.filter(b => b.status === 'confirmed').map(booking => {
                    const handleCancelClick = () => {
                      setConfirmCancelBookingId(booking.id);
                    };
                    
                    return (
                      <div key={booking.id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div>
                            <p className="font-bold text-lg">{booking.name}</p>
                            <p className="text-sm text-gray-600">{booking.phone}</p>
                            {booking.telegram && <p className="text-sm text-blue-600">@{booking.telegram}</p>}
                            <div className="text-sm text-gray-700 mt-2 space-y-1">
                              {booking.slotIds.map(slotId => {
                                const slot = hockeySlots.find(s => s.id === slotId);
                                if (!slot) return null;
                                return (
                                  <div key={slotId} className="flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-600" />
                                    <span>{slot.date}</span>
                                    <Clock size={14} className="text-indigo-600" />
                                    <span>{slot.time}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {booking.comment && (
                              <p className="text-sm text-gray-600 mt-2 italic">💬 {booking.comment}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <a
                                href={`tel:${booking.phone}`}
                                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-1 text-sm"
                              >
                                📞 Позвонить
                              </a>
                              {booking.telegram && (
                                <a
                                  href={`https://t.me/${booking.telegram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1 text-sm"
                                >
                                  ✈️ Telegram
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleCancelClick}
                              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:bg-red-700 flex items-center gap-2 text-sm font-medium shadow-md"
                            >
                              <XCircle size={16} />
                              Отменить запись
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cancel Confirmation Modal */}
            {confirmCancelBookingId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">⚠️ Подтверждение отмены</h3>
                  <p className="text-gray-600 mb-6">
                    Вы уверены, что хотите отменить эту запись? Слоты станут снова доступными для других клиентов.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => cancelConfirmedBooking(confirmCancelBookingId)}
                      className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Да, отменить
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelBookingId(null)}
                      className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Нет, оставить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Bookings History */}
            {hockeyBookings.filter(b => b.status === 'cancelled' || b.status === 'cancelled_by_admin').length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-xl text-gray-600">История отменённых записей</h3>
                <div className="space-y-2">
                  {hockeyBookings.filter(b => b.status === 'cancelled' || b.status === 'cancelled_by_admin').map(booking => (
                    <div key={booking.id} className="bg-gray-100 p-3 rounded-lg border-l-4 border-gray-400">
                      <p className="font-bold text-gray-600">{booking.name} - {booking.phone}</p>
                      <p className="text-sm text-gray-500">
                        {booking.slotIds.map(slotId => {
                          const slot = hockeySlots.find(s => s.id === slotId);
                          return slot ? `${slot.date} ${slot.time}` : '';
                        }).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.status === 'cancelled_by_admin' ? '❌ Отменено администратором' : '❌ Отменено клиентом'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Slots */}
            <div>
              <h3 className="font-bold mb-3 text-xl">Доступные слоты ({hockeySlots.filter(s => s.status === 'available').length})</h3>
              {hockeySlots.filter(s => s.status === 'available').length === 0 ? (
                <p className="text-gray-500">Нет доступных слотов</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hockeySlots.filter(s => s.status === 'available').sort((a, b) => {
                    const dateA = new Date(a.date + ' ' + a.time);
                    const dateB = new Date(b.date + ' ' + b.time);
                    return dateA - dateB;
                  }).map(slot => (
                    <div key={slot.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border">
                      <div>
                        <p className="font-bold">{slot.date}</p>
                        <p className="text-sm text-gray-600">{slot.time} ({slot.duration} мин)</p>
                      </div>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  if (view === 'select') return renderSelectView();
  if (view === 'admin-login') return renderAdminLogin();
  if (view === 'client-hockey') return renderClientBooking();
  if (isAdminAuth && view === 'admin-hockey') return renderAdminDashboard();

  return renderSelectView();
};

export default BookingSystem;
