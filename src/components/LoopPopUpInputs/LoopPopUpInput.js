import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../I18nHoverText/I18nHoverText';
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
          <h3>
            <I18nHoverText translationKey="LoopPopup.title">
              {t('LoopPopup.title')}
            </I18nHoverText>
          </h3>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="loop-popup-form">
          <div className="input-group">
            <label htmlFor="duration">
              <I18nHoverText translationKey="LoopPopup.duration">
                {t('LoopPopup.duration')}
              </I18nHoverText>:
            </label>
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
            <label htmlFor="endTime">
              <I18nHoverText translationKey="LoopPopup.endTime">
                {t('LoopPopup.endTime')}
              </I18nHoverText>:
            </label>
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
            <label htmlFor="iterations">
              <I18nHoverText translationKey="LoopPopup.iterations">
                {t('LoopPopup.iterations')}
              </I18nHoverText>:
            </label>
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
              <I18nHoverText translationKey="Forms.Cancel">
                {t('Forms.Cancel')}
              </I18nHoverText>
            </button>
            <button type="submit" className="submit-button">
              <I18nHoverText translationKey="LoopPopup.apply">
                {t('LoopPopup.apply')}
              </I18nHoverText>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoopPopUpInput;