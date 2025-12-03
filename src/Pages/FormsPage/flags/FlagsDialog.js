import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Select,
} from '@mui/material';
import { getTranslation } from '../i18n';

const FlagsDialog = ({
  open,
  handleClose,
  initialValues,
  language,
  onSave,
}) => {
  const [formValues, setFormValues] = useState({ ...initialValues });
  const [explainationError, setExplainationError] = useState('');
  const [interventionError, setInterventionError] = useState('');
  const [explainationBorderColor, setExplainationBorderColor] = useState('initial');
  const [interventionBorderColor, setInterventionBorderColor] = useState('initial');

  const t = (key) => getTranslation(key, language);

  // Reset form values when initialValues change
  useEffect(() => {
    setFormValues({ ...initialValues });
  }, [initialValues]);

  const validateExplaination = (value) => {
    if (value.length > 100) {
      setExplainationError(t('maxLengthError'));
      setExplainationBorderColor('red');
    } else {
      setExplainationError('');
      setExplainationBorderColor('initial');
    }
  };

  const validateIntervention = (value) => {
    if (!value) {
      setInterventionError(t('requiredFieldError'));
      setInterventionBorderColor('red');
    } else if (value.length > 100) {
      setInterventionError(t('maxLengthError'));
      setInterventionBorderColor('red');
    } else {
      setInterventionError('');
      setInterventionBorderColor('initial');
    }
  };

  const handleReset = () => {
    setFormValues(initialValues);
  };

  const handleSave = () => {
    if (explainationError || interventionError) {
      return;
    }
    onSave(formValues);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='flag-dialog-title'
      disableEscapeKeyDown
    >
      <div style={{ display: 'flex' }}>
        {language === 'he' ? (
          <>
            <DialogActions style={{ direction: 'rtl', flexGrow: 1 }}>
              <Button onClick={handleClose}>X</Button>
            </DialogActions>
            <DialogTitle id='flag-dialog-title'>{t('editTask')}</DialogTitle>
          </>
        ) : (
          <>
            <DialogTitle id='flag-dialog-title'>{t('editTask')}</DialogTitle>
            <DialogActions style={{ direction: 'ltr', flexGrow: 1 }}>
              <Button onClick={handleClose}>X</Button>
            </DialogActions>
          </>
        )}
      </div>

      <DialogContent dividers>
        <div
          className='firstRowForms'
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextField
            autoFocus
            margin='dense'
            id='task'
            label={t('task')}
            type='text'
            value={formValues.task}
            onChange={(e) =>
              setFormValues({ ...formValues, task: e.target.value })
            }
            style={{ width: '75%' }}
            disabled
          />
          <img
            src={formValues.image}
            alt=''
            style={{
              marginLeft: '20px',
              marginTop: '4px',
              width: '88px',
              height: '56px',
              borderRadius: '6px',
            }}
          />
        </div>

        <TextField
          margin='dense'
          id='classification'
          label={t('classification')}
          type='text'
          value={formValues.classification}
          onChange={(e) =>
            setFormValues({
              ...formValues,
              classification: e.target.value,
            })
          }
          fullWidth
          disabled
        />

        {formValues.intervention !== ' ' && (
          <TextField
            margin='dense'
            id='intervention'
            label={t('intervention')}
            type='text'
            value={formValues.intervention}
            onChange={(e) => {
              setFormValues({
                ...formValues,
                intervention: e.target.value,
              });
              validateIntervention(e.target.value);
            }}
            error={Boolean(interventionError)}
            helperText={interventionError}
            style={{ borderColor: interventionBorderColor }}
            fullWidth
          />
        )}

        {formValues.intervention === ' ' && (
          <TextField
            margin='dense'
            id='intervention'
            label={t('intervention')}
            type='text'
            value={t('fieldAvailableYellowOnly')}
            style={{
              borderColor: interventionBorderColor,
            }}
            fullWidth
            disabled
          />
        )}

        {formValues.Alternatives === ' ' && (
          <Select
            native
            value={t('fieldAvailableRedOnly')}
            id='select-Alternatives'
            label={t('alternatives')}
            fullWidth
            style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
            disabled
          >
            <option value={t('fieldAvailableRedOnly')}>
              {t('fieldAvailableRedOnly')}
            </option>
          </Select>
        )}

        {formValues.Alternatives !== ' ' && (
          <Select
            native
            value={formValues?.Alternatives?.toString()}
            id='select-Alternatives'
            label={t('alternatives')}
            fullWidth
            onChange={(e) =>
              setFormValues({
                ...formValues,
                Alternatives: e.target.value,
              })
            }
            style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
          >
            <optgroup label={t('writingUnfamiliarWords')}>
              <option value={t('readyStickers')}>{t('readyStickers')}</option>
              <option value={t('card')}>{t('card')}</option>
              <option value={t('shapes')}>{t('shapes')}</option>
            </optgroup>
            <optgroup label={t('hypersensitivityTouch')}>
              <option value={t('glove')}>{t('glove')}</option>
              <option value={t('cloth')}>{t('cloth')}</option>
            </optgroup>
            <optgroup label={t('complexColorIdentification')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('complexShapeIdentification')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('attentionDivision')}>
              <option value={t('quietRoom')}>{t('quietRoom')}</option>
              <option value={t('break')}>{t('break')}</option>
            </optgroup>
            <optgroup label={t('shortTermMemory')}>
              <option value={t('taskRepetition')}>{t('taskRepetition')}</option>
              <option value={t('appReminders')}>{t('appReminders')}</option>
              <option value={t('printedList')}>{t('printedList')}</option>
            </optgroup>
            <optgroup label={t('shapeIdentification2D')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('peopleIdentification')}>
              <option value={t('photography')}>{t('photography')}</option>
              <option value={t('printedCard')}>{t('printedCard')}</option>
            </optgroup>
            <optgroup label={t('imageIdentification')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('simpleGraphicSymbols')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('iconIdentification')}>
              <option value={t('drawing')}>{t('drawing')}</option>
              <option value={t('symbolization')}>{t('symbolization')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('dangerousMaterialsCaution')}>
              <option value={t('addProtection')}>{t('addProtection')}</option>
              <option value={t('removal')}>{t('removal')}</option>
              <option value={t('addWarning')}>{t('addWarning')}</option>
            </optgroup>
            <optgroup label={t('sharpObjectsCaution')}>
              <option value={t('addProtection')}>{t('addProtection')}</option>
              <option value={t('removal')}>{t('removal')}</option>
              <option value={t('addWarning')}>{t('addWarning')}</option>
            </optgroup>
            <optgroup label={t('electricalAppliancesCaution')}>
              <option value={t('addProtection')}>{t('addProtection')}</option>
              <option value={t('removal')}>{t('removal')}</option>
              <option value={t('addWarning')}>{t('addWarning')}</option>
            </optgroup>
            <optgroup label={t('prolongedStanding')}>
              <option value={t('sitOnChair')}>{t('sitOnChair')}</option>
              <option value={t('breaks10Minutes')}>{t('breaks10Minutes')}</option>
              <option value={t('changePosture')}>{t('changePosture')}</option>
            </optgroup>
            <optgroup label={t('placeIdentificationSpatial')}>
              <option value={t('signsWithText')}>{t('signsWithText')}</option>
              <option value={t('images')}>{t('images')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('colorBlindness')}>
              <option value={t('differentSortingMethod')}>{t('differentSortingMethod')}</option>
              <option value={t('voiceExplanation')}>{t('voiceExplanation')}</option>
              <option value={t('externalControl')}>{t('externalControl')}</option>
            </optgroup>
          </Select>
        )}

        <TextField
          margin='dense'
          id='explaination'
          label={t('explanation')}
          type='text'
          value={formValues.explaination}
          onChange={(e) => {
            setFormValues({
              ...formValues,
              explaination: e.target.value,
            });
            validateExplaination(e.target.value);
          }}
          error={Boolean(explainationError)}
          helperText={explainationError}
          style={{ borderColor: explainationBorderColor }}
          fullWidth
        />
      </DialogContent>

      <DialogActions style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}>
        <Button onClick={handleReset}>{t('reset')}</Button>
        <Button onClick={handleSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlagsDialog;
