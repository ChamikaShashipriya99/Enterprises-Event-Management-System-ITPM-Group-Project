// frontend/src/components/EventCountdown.jsx
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const EventCountdown = ({ targetDate, compact = false }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const eventDate = new Date(targetDate);
        const now = new Date();
        const difference = +eventDate - +now;
        
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            // Check if it's still the same day
            const isSameDay = eventDate.toDateString() === now.toDateString();
            if (isSameDay) {
                timeLeft = { status: 'Ongoing' };
            }
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;
    const isExpired = Object.keys(timeLeft).length === 0;

    if (isExpired) return null;

    if (timeLeft.status === 'Ongoing') {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981', 
                fontSize: compact ? '0.75rem' : '0.85rem', 
                fontWeight: '800' 
            }}>
                <div style={pulseStyle} />
                {compact ? 'Live' : 'Happening Now'}
            </div>
        );
    }

    if (compact) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: isUrgent ? '#fb7185' : '#94a3b8', 
                fontSize: '0.75rem', 
                fontWeight: '700' 
            }}>
                <Clock size={12} />
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {timeLeft.hours}h {timeLeft.minutes}m
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex', 
            gap: '8px', 
            background: isUrgent ? 'rgba(251, 113, 133, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            padding: '6px 12px',
            borderRadius: '10px',
            border: `1px solid ${isUrgent ? 'rgba(251, 113, 133, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
            alignItems: 'center'
        }}>
            <Clock size={14} style={{ color: isUrgent ? '#fb7185' : '#818cf8' }} />
            <div style={{ display: 'flex', gap: '4px' }}>
                {timeLeft.days > 0 && (
                    <div style={unitStyle}>
                        <span style={valueStyle}>{timeLeft.days}</span>
                        <span style={labelStyle}>d</span>
                    </div>
                )}
                <div style={unitStyle}>
                    <span style={valueStyle}>{timeLeft.hours}</span>
                    <span style={labelStyle}>h</span>
                </div>
                <div style={unitStyle}>
                    <span style={valueStyle}>{timeLeft.minutes}</span>
                    <span style={labelStyle}>m</span>
                </div>
                {timeLeft.days === 0 && (
                    <div style={unitStyle}>
                        <span style={valueStyle}>{timeLeft.seconds}</span>
                        <span style={labelStyle}>s</span>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
};

const pulseStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite'
};

const unitStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1px'
};

const valueStyle = {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'white'
};

const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase'
};

export default EventCountdown;
