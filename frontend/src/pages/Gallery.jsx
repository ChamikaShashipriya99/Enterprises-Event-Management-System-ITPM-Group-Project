import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

// Images imported from the gallery assets folder
import Bash from '../assets/gallery/Bash.jpeg';
import Thaala from '../assets/gallery/Thaala.jpg';
import Wiramaya from '../assets/gallery/Wiramaya.jpeg';
import Wiramaya24 from '../assets/gallery/wiramaya-2024.jpg';
import Wiramaya25 from '../assets/gallery/wiramaya-2025.jpg';
import Wiramaya1 from '../assets/gallery/wiramaya1.jpg';
import Wiramaya22 from '../assets/gallery/wiramaya22.jpg';
import Wiramaya3 from '../assets/gallery/wiramaya3.jpg';

const galleryData = [
  { id: 1, url: Bash, label: 'Grand Bash' },
  { id: 2, url: Thaala, label: 'Thaala Night' },
  { id: 3, url: Wiramaya, label: 'Wiramaya Showcase' },
  { id: 4, url: Wiramaya24, label: '2024 Retrospective' },
  { id: 5, url: Wiramaya25, label: '2025 Highlights' },
  { id: 6, url: Wiramaya1, label: 'Cultural Fusion' },
  { id: 7, url: Wiramaya22, label: 'Legacy Moments' },
  { id: 8, url: Wiramaya3, label: 'Modern Beats' }
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Split images into two columns for the "Split-Vertical" look
  const leftColumn = galleryData.filter((_, i) => i % 2 === 0);
  const rightColumn = galleryData.filter((_, i) => i % 2 !== 0);

  return (
    <div style={{ 
      padding: '4rem 8%', 
      minHeight: '100vh', 
      background: '#0a0f1d',
      color: 'white' 
    }}>
      {/* Narrative Header */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem', maxWidth: '600px' }}
      >
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1', marginBottom: '2rem', letterSpacing: '-3px' }}>
          Visual <br/> <span style={{ color: '#6366f1' }}>Chronicles.</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.8', borderLeft: '2px solid #6366f1', paddingLeft: '20px' }}>
          A minimalist journey through the atmosphere, energy, and milestones of our ecosystem. Captured in silence, told in frames.
        </p>
      </motion.div>

      {/* Split-Vertical Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '4rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column (Slightly Offset for Narrative feel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '2rem' }}>
          {leftColumn.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              onClick={() => setSelectedImage(item)}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '12px' }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', height: index % 3 === 0 ? '600px' : '450px' }}
              >
                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(10%) contrast(110%)' }} />
              </motion.div>
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Frame {item.id}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column (Standard Offset) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {rightColumn.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.15, duration: 0.7 }}
              onClick={() => setSelectedImage(item)}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '12px' }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', height: index % 2 === 0 ? '400px' : '550px' }}
              >
                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(10%) contrast(110%)' }} />
              </motion.div>
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Frame {item.id}</span>
              </div>
            </motion.div>
          ))}
          
          {/* Narrative Footer inside column */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ padding: '4rem 0', textAlign: 'left' }}
          >
            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#6366f1' }}>And many more <br/> to come.</h3>
            <p style={{ color: '#64748b', marginTop: '1rem' }}>Join our next event and become part of the story.</p>
          </motion.div>
        </div>

      </div>

      {/* Minimal Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 7, 10, 0.98)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={32} />
            </button>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              style={{ maxWidth: '1400px', width: '100%', height: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
            >
              <img 
                src={selectedImage.url} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.5 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>FRAME // {selectedImage.id.toString().padStart(2, '0')}</span>
                <div style={{ width: '40px', height: '1px', background: 'white' }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>EVENTBUDDY ECOSYSTEM</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
