import { useState, useEffect } from 'react';

const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState(0);
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#ef4444');

    const calculateStrength = (p) => {
        let score = 0;
        if (!p) return 0;
        if (p.length >= 8) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    useEffect(() => {
        const score = calculateStrength(password);
        setStrength(score);

        switch (score) {
            case 0:
                setLabel('');
                setColor('#ef4444');
                break;
            case 1:
                setLabel('Weak');
                setColor('#ef4444');
                break;
            case 2:
                setLabel('Fair');
                setColor('#f97316');
                break;
            case 3:
                setLabel('Good');
                setColor('#eab308');
                break;
            case 4:
                setLabel('Strong');
                setColor('#10b981');
                break;
            default:
                break;
        }
    }, [password]);

    if (!password) return null;

    return (
        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
            }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Password Strength</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: color }}>{label}</span>
            </div>
            <div style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${(strength / 4) * 100}%`,
                    backgroundColor: color,
                    transition: 'width 0.3s ease, background-color 0.3s ease'
                }}></div>
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
