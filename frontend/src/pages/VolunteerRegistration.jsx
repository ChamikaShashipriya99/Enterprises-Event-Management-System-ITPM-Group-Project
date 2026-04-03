// frontend/src/pages/VolunteerRegistration.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clipboard, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const VolunteerRegistration = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: ''
    });

    const [selectedSkills, setSelectedSkills] = useState([]);

    const skillsList = [
        'Event Planning', 'Photography', 'Videography', 'Stage Setup', 
        'Sound & Lighting', 'Marketing & Social Media', 'Graphic Design', 
        'Web / Tech Support', 'Registration & Check-in', 'First Aid / Safety', 
        'Hospitality', 'Decoration'
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['06:00-09:00', '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'];
    
    // Matrix for availability [day][timeSlot]
    const [availability, setAvailability] = useState(
        days.reduce((acc, day) => {
            acc[day] = timeSlots.reduce((tAcc, slot) => {
                tAcc[slot] = false;
                return tAcc;
            }, {});
            return acc;
        }, {})
    );

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        if (name === 'fullName') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        } else if (name === 'phone') {
            value = value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const toggleSkill = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const toggleAvailability = (day, slot) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slot]: !prev[day][slot]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Frontend Validations
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            return toast.error("Name field can contain only spaces and letters.");
        }
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
            return toast.error("Email address field should be @gmail.com type.");
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            return toast.error("Phone number field can contain only 10 digits.");
        }
        if (selectedSkills.length === 0) {
            return toast.error("Please select at least one skill.");
        }

        let hasAvailability = false;
        for (const day of days) {
            for (const slot of timeSlots) {
                if (availability[day][slot] === true) {
                    hasAvailability = true;
                    break;
                }
            }
            if (hasAvailability) break;
        }

        if (!hasAvailability) {
            return toast.error("Please select at least one time availability slot.");
        }

        try {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = user?.token || '';
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            // Using standard localhost port 5000 for backend assuming proxy isn't robust
            const response = await fetch('http://localhost:5000/api/volunteer/register', {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify({ ...formData, skills: selectedSkills, availability })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            
            toast.success("Volunteer Registration submitted successfully!");
            navigate('/student-dashboard');
        } catch (error) {
            toast.error(error.message || "An error occurred during registration.");
        }
    };

    return (
        <div style={{ padding: '40px 5%', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>
                    Volunteer <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Registration</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    Fill out details to get matched with amazing events on campus!
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* 1. Personal Information */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card" 
                    style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#a855f7', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>1</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Personal Information</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name *</label>
                            <input 
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="e.g. Asel Perera"
                                required
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address *</label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="e.g. example@gmail.com"
                                required
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' }}>Phone Number *</label>
                            <input 
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g. 0771234567"
                                required
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                    </div>
                </motion.section>

                {/* 2. Skills */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="glass-card" 
                    style={{ padding: '30px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#ec4899', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>2</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Skills</h2>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '25px' }}>Select all that apply — you can choose multiple.</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {skillsList.map(skill => (
                            <button
                                type="button"
                                key={skill}
                                onClick={() => toggleSkill(skill)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '50px',
                                    border: selectedSkills.includes(skill) ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                                    background: selectedSkills.includes(skill) ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255,255,255,0.03)',
                                    color: selectedSkills.includes(skill) ? '#fbcfe8' : '#e2e8f0',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {selectedSkills.includes(skill) && <CheckCircle2 size={16} color="#ec4899" />}
                                {skill}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* 3. Availability */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="glass-card" 
                    style={{ padding: '30px', overflowX: 'auto' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>3</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Availability</h2>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '25px' }}>Tick the time slots you're available for each day.</p>

                    <div style={{ minWidth: '700px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '15px', color: '#94a3b8', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>Day</th>
                                    {timeSlots.map(slot => (
                                        <th key={slot} style={{ padding: '15px', color: '#94a3b8', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{slot}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map(day => (
                                    <tr key={day}>
                                        <td style={{ padding: '15px', fontWeight: '600', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>{day}</td>
                                        {timeSlots.map(slot => (
                                            <td key={slot} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div 
                                                    onClick={() => toggleAvailability(day, slot)}
                                                    style={{ 
                                                        width: '24px', 
                                                        height: '24px', 
                                                        margin: '0 auto', 
                                                        borderRadius: '6px',
                                                        border: availability[day][slot] ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                                        background: availability[day][slot] ? '#3b82f6' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {availability[day][slot] && <Check size={16} color="white" strokeWidth={3} />}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button 
                        type="submit"
                        className="btn-primary" 
                        style={{ 
                            padding: '15px 40px', 
                            fontSize: '1.1rem', 
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)', 
                            border: 'none', 
                            width: '100%', 
                            maxWidth: '400px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Clipboard size={20} /> Complete Registration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VolunteerRegistration;
