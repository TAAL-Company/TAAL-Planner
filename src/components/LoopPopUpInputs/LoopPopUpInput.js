import React, { useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LoopPopUpInput.css';

const LoopPopUpInput = ({ isOpen, onClose, onSubmit, station, selectedRoute }) => {
  const { t } = useTranslation();
  // console.log("selectedRoute :", selectedRoute);
  // console.log("LoopPopUpInput :", station?.loops?.find((loop) => loop.routeId === selectedRoute?.id));

  const [duration, setDuration] = useState('');
  const [endTime, setEndTime] = useState('');
  const [iterations, setIterations] = useState('');
  
  useEffect(() => {
    if (!isOpen) return;

    const routeLoops = Array.isArray(selectedRoute?.loops) ? selectedRoute.loops : [];
    const loop =
      routeLoops.find((l) => String(l.stationid) === String(station?.id)) ||
      null;

    setDuration(loop?.loopDuration != null ? String(loop.loopDuration) : "");
    setEndTime(loop?.loopUntil != null ? String(loop.loopUntil) : "");
    setIterations(loop?.loopIteration != null ? String(loop.loopIteration) : "");
  }, [isOpen, station, selectedRoute]);



  // Get direction for RTL/LTR support
  const direction = t('Direction');
  const isRTL = direction === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ duration, endTime, iterations });
    handleClose();
  };

  const handleClose = () => {
    setDuration('');
    setEndTime('');
    setIterations('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="loop-popup-overlay">
      <div 
        className="loop-popup-container" 
        style={{ direction: direction }}
      >
        <div className="loop-popup-header">
          <h3>{t('LoopPopup.title')}</h3>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="loop-popup-form">
          <div className="input-group">
            <label htmlFor="duration">{t('LoopPopup.duration')}:</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t('LoopPopup.durationPlaceholder')}
              min="1"
              step="1"
              inputMode="numeric"
              style={{ 
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="endTime">{t('LoopPopup.endTime')}:</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder={t('LoopPopup.endTimePlaceholder')}
              style={{ 
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="iterations">{t('LoopPopup.iterations')}:</label>
            <input
              type="number"
              id="iterations"
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
              placeholder={t('LoopPopup.iterationsPlaceholder')}
              min="1"
              step="1"
              inputMode="numeric"
              style={{ 
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={handleClose} className="cancel-button">
              {t('Forms.Cancel')}
            </button>
            <button type="submit" className="submit-button">
              {t('LoopPopup.apply')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoopPopUpInput;