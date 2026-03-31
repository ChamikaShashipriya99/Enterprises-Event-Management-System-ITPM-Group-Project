# Quick Integration Guide

## 🚀 How to Use Enhanced QR Scanner

### Step 1: Update Your App Routes
In your `App.jsx`, replace the old QRCodeScanner with the enhanced version:

```jsx
import QRCodeScannerEnhanced from './components/QRCodeScannerEnhanced';

// In your routes:
<Route path="/qr-scanner" element={<QRCodeScannerEnhanced eventId={eventId} />} />
```

### Step 2: Enhanced StudentDashboard is Ready
The StudentDashboard now shows:
- 3 summary cards (Events, Certificates, Attended)
- Quick links section
- Better empty states
- Improved event listing

Just navigate to the StudentDashboard page - no changes needed!

### Step 3: Enhanced StudentCertificates is Ready
The certificates page now features:
- Card-based grid layout
- Search functionality
- Summary statistics
- Better UX

Just navigate to `/certificates` - no changes needed!

---

## 🎨 How to Apply to Other Pages

### Example: Adding to MyBookings Page

```jsx
import StatusBadge from '../components/StatusBadge';
import UICard from '../components/UICard';
import EmptyState from '../components/EmptyState';

// In your JSX:
{bookings.length === 0 ? (
    <EmptyState
        icon="🎫"
        title="No Bookings Yet"
        description="Register for events to create bookings."
        actionLabel="Browse Events"
        onAction={() => navigate('/events')}
    />
) : (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {bookings.map(booking => (
            <UICard key={booking._id} hover={true}>
                <h3>{booking.eventTitle}</h3>
                <p>{booking.eventDate}</p>
                <StatusBadge status={booking.status} size="sm" />
            </UICard>
        ))}
    </div>
)}
```

### Example: Adding Search to AllEvents Page

```jsx
import SearchFilter from '../components/SearchFilter';

const [searchTerm, setSearchTerm] = useState('');
const filtered = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <div>
        <SearchFilter 
            onSearch={setSearchTerm}
            placeholder="Search events by name..."
        />
        {/* Your events grid here */}
    </div>
);
```

### Example: Adding Summary Cards to OrganizerDashboard

```jsx
import SummaryCard from '../components/SummaryCard';

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
    <SummaryCard
        icon="📅"
        label="My Events"
        value={myEvents.length}
        color="#6366f1"
    />
    <SummaryCard
        icon="👥"
        label="Total Attendees"
        value={totalAttendees}
        color="#10b981"
    />
    <SummaryCard
        icon="✓"
        label="Checked In"
        value={totalCheckedIn}
        color="#f59e0b"
    />
</div>
```

---

## 🎯 Status Badge Examples

```jsx
<StatusBadge status="booked" />          // Blue badge: "✓ Booked"
<StatusBadge status="cancelled" />       // Red badge: "✕ Cancelled"
<StatusBadge status="checked-in" />      // Green badge: "✓ Checked In"
<StatusBadge status="absent" />          // Red badge: "− Absent"
<StatusBadge status="pending" />         // Orange badge: "⏳ Pending"
<StatusBadge status="generated" />       // Green badge: "✓ Generated"
<StatusBadge status="not-generated" />   // Gray badge: "− Not Generated"

// Size options: "sm" (small), "md" (medium - default)
<StatusBadge status="checked-in" size="sm" />
```

---

## 📊 Summary Card Examples

```jsx
// Without trend
<SummaryCard
    icon="📅"
    label="Events Created"
    value={25}
    color="#6366f1"
/>

// With trend (up)
<SummaryCard
    icon="👥"
    label="Total Attendees"
    value={342}
    color="#10b981"
    trend={{ positive: true, value: '8%' }}
/>

// With trend (down)
<SummaryCard
    icon="❌"
    label="Cancellations"
    value={12}
    color="#f87171"
    trend={{ positive: false, value: '3%' }}
/>
```

---

## 🛠️ Common Patterns

### Pattern 1: List with Search & Empty State
```jsx
const [searchTerm, setSearchTerm] = useState('');
const filtered = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <>
        <SearchFilter onSearch={setSearchTerm} />
        {filtered.length === 0 ? (
            <EmptyState icon="📭" title="No items" />
        ) : (
            <div style={{...gridStyle}}>
                {filtered.map(item => (...))}
            </div>
        )}
    </>
);
```

### Pattern 2: Stats + Data Grid
```jsx
<div style={{...gridStyle}}>
    <SummaryCard icon="📊" label="Total" value={total} />
    <SummaryCard icon="✓" label="Completed" value={completed} />
    <SummaryCard icon="⏳" label="Pending" value={pending} />
</div>

<div style={{...gridStyle}}>
    {items.map(item => (
        <UICard key={item.id} hover>
            <h3>{item.title}</h3>
            <StatusBadge status={item.status} />
        </UICard>
    ))}
</div>
```

### Pattern 3: Action Feedback
```jsx
const [successMsg, setSuccessMsg] = useState('');
const [errorMsg, setErrorMsg] = useState('');

const handleAction = async () => {
    try {
        await api.call();
        setSuccessMsg('✅ Success!');
        setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
        setErrorMsg(`❌ ${err.message}`);
        setTimeout(() => setErrorMsg(''), 4000);
    }
};

return (
    <>
        {errorMsg && <Toast type="error" message={errorMsg} />}
        {successMsg && <Toast type="success" message={successMsg} />}
        <button onClick={handleAction}>Action</button>
    </>
);
```

---

## ✨ Pro Tips

1. **Combine components** - Use multiple components together for rich UX
2. **Responsive grids** - Use `gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'`
3. **Consistent spacing** - Stick to gap: '1rem' or '1.5rem'
4. **Color coding** - Use status colors for quick visual recognition
5. **Empty states guide users** - Always provide call-to-action buttons
6. **Toast notifications** - Use for temporary feedback, not errors
7. **Hover effects** - Keep components interactive with UICard's hover prop

---

## 🐛 Troubleshooting

**Issue**: Component not visible
- ✅ Check import path is correct
- ✅ Verify component is exported default
- ✅ Check parent div has padding/margin

**Issue**: Styles not applying
- ✅ Verify inline styles in component
- ✅ Check z-index for overlays (Toast)
- ✅ Ensure parent has proper layout

**Issue**: Click events not firing
- ✅ Check onClick handler is passed correctly
- ✅ Verify button/div pointer-events is not 'none'
- ✅ Check z-index doesn't block clicks

---

## 🚢 Deployment Checklist

- [ ] All new components imported correctly
- [ ] No console errors
- [ ] Tested on mobile (320px width)
- [ ] Tested on tablet (768px width)
- [ ] Tested on desktop (1920px width)
- [ ] All buttons/links functional
- [ ] Search/filter works correctly
- [ ] Toast notifications auto-dismiss
- [ ] Empty states display correctly
- [ ] No performance issues (no lag)

✅ You're ready to deploy!
