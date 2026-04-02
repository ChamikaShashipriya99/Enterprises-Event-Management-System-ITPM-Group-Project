import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Eye } from 'lucide-react';

// Assets from gallery folder
import Bash from '../assets/gallery/Bash.jpeg';
import Thaala from '../assets/gallery/Thaala.jpg';
import Wiramaya from '../assets/gallery/Wiramaya.jpeg';
import Wiramaya24 from '../assets/gallery/wiramaya-2024.jpg';
import Wiramaya25 from '../assets/gallery/wiramaya-2025.jpg';
import Wiramaya1 from '../assets/gallery/wiramaya1.jpg';
import Wiramaya22 from '../assets/gallery/wiramaya22.jpg';
import Wiramaya3 from '../assets/gallery/wiramaya3.jpg';

// Video assets
import V1 from '../assets/gallery/V1.mp4';
import V2 from '../assets/gallery/V2.mp4';
import V3 from '../assets/gallery/V3.mp4';

const galleryData = [
  { id: 1, type: 'video', url: V1, label: 'Cinema Reel I' },
  { id: 2, type: 'image', url: Bash, label: 'Campus Bash' },
  { id: 3, type: 'image', url: Thaala, label: 'Thaala Night' },
  { id: 4, type: 'video', url: V2, label: 'Dynamic Atmosphere' },
  { id: 5, type: 'image', url: Wiramaya, label: 'Wiramaya Showcase' },
  { id: 6, type: 'image', url: Wiramaya24, label: '2024 Archive' },
  { id: 7, type: 'video', url: V3, label: 'Event Highlights' },
  { id: 8, type: 'image', url: Wiramaya25, label: '2025 Retrospective' },
  { id: 9, type: 'image', url: Wiramaya1, label: 'Culture Fusion' },
  { id: 10, type: 'image', url: Wiramaya22, label: 'Legacy Days' },
  { id: 11, type: 'image', url: Wiramaya3, label: 'Modern Beats' }
];

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const leftColumn = galleryData.filter((_, i) => i % 2 === 0);
  const rightColumn = galleryData.filter((_, i) => i % 2 !== 0);

  return (
    <div style={{ padding: '4rem 8%', minHeight: '100vh', background: '#0a0f1d', color: 'white' }}>
      {/* Narrative Header */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem', maxWidth: '700px' }}
      >
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1', marginBottom: '2rem', letterSpacing: '-3px' }}>
          Visual <br/> <span style={{ color: '#6366f1' }}>Chronicles.</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.8', borderLeft: '2px solid #6366f1', paddingLeft: '20px' }}>
          Moving frames and silent stills. Witness the energy of our ecosystem through a curated collection of cinematic reels and captures.
        </p>
      </motion.div>

      {/* Split-Vertical Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '2rem' }}>
          {leftColumn.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              onClick={() => setSelectedItem(item)}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} style={{ width: '100%', height: item.type === 'video' ? '300px' : (index % 3 === 0 ? '600px' : '450px') }}>
                {item.type === 'video' ? (
                  <video src={item.url} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => {e.target.pause(); e.target.currentTime = 0; }} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                ) : (
                  <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(10%) contrast(110%)' }} />
                )}
              </motion.div>
              
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: item.type === 'video' ? 1 : 0, transition: '0.3s' }}>
                <PlayCircle size={48} strokeWidth={1} style={{ color: 'white' }} />
              </div>

              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px' }}>{item.type.toUpperCase()} // 0{item.id}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {rightColumn.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              onClick={() => setSelectedItem(item)}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} style={{ width: '100%', height: item.type === 'video' ? '300px' : (index % 2 === 0 ? '400px' : '550px') }}>
                {item.type === 'video' ? (
                  <video src={item.url} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => {e.target.pause(); e.target.currentTime = 0; }} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                ) : (
                  <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(10%) contrast(110%)' }} />
                )}
              </motion.div>

              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: item.type === 'video' ? 1 : 0, transition: '0.3s' }}>
                <PlayCircle size={48} strokeWidth={1} style={{ color: 'white' }} />
              </div>

              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px' }}>{item.type.toUpperCase()} // 0{item.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Immersive Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 10, 0.98)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={32} /></button>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} style={{ maxWidth: '1400px', width: '100%', height: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              {selectedItem.type === 'video' ? (
                <video src={selectedItem.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px' }} />
              ) : (
                <img src={selectedItem.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.4 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedItem.type.toUpperCase()} // 0{selectedItem.id}</span>
                <div style={{ width: '40px', height: '1px', background: 'white' }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedItem.label.toUpperCase()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
