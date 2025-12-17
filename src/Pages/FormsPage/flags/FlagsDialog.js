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
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  // Reset form values when initialValues change
  useEffect(() => {
    setFormValues({ ...initialValues });
  }, [initialValues]);

  const validateExplaination = (value) => {
    if (value.length > 100) {
      setExplainationError(t('FormsPage.maxLengthError'));
      setExplainationBorderColor('red');
    } else {
      setExplainationError('');
      setExplainationBorderColor('initial');
    }
  };

  const validateIntervention = (value) => {
    if (!value) {
      setInterventionError(t('FormsPage.requiredFieldError'));
      setInterventionBorderColor('red');
    } else if (value.length > 100) {
      setInterventionError(t('FormsPage.maxLengthError'));
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
            <DialogTitle id='flag-dialog-title'>{t('FormsPage.editTask')}</DialogTitle>
          </>
        ) : (
          <>
            <DialogTitle id='flag-dialog-title'>{t('FormsPage.editTask')}</DialogTitle>
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
            label={t('FormsPage.task')}
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
          label={t('FormsPage.classification')}
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
            label={t('FormsPage.intervention')}
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
            label={t('FormsPage.intervention')}
            type='text'
            value={t('FormsPage.fieldAvailableYellowOnly')}
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
            value={t('FormsPage.fieldAvailableRedOnly')}
            id='select-Alternatives'
            label={t('FormsPage.alternatives')}
            fullWidth
            style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
            disabled
          >
            <option value={t('FormsPage.fieldAvailableRedOnly')}>
              {t('FormsPage.fieldAvailableRedOnly')}
            </option>
          </Select>
        )}

        {formValues.Alternatives !== ' ' && (
          <Select
            native
            value={formValues?.Alternatives?.toString()}
            id='select-Alternatives'
            label={t('FormsPage.alternatives')}
            fullWidth
            onChange={(e) =>
              setFormValues({
                ...formValues,
                Alternatives: e.target.value,
              })
            }
            style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
          >
            <optgroup label={t('FormsPage.writingUnfamiliarWords')}>
              <option value={t('FormsPage.readyStickers')}>{t('FormsPage.readyStickers')}</option>
              <option value={t('FormsPage.card')}>{t('FormsPage.card')}</option>
              <option value={t('FormsPage.shapes')}>{t('FormsPage.shapes')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.hypersensitivityTouch')}>
              <option value={t('FormsPage.glove')}>{t('FormsPage.glove')}</option>
              <option value={t('FormsPage.cloth')}>{t('FormsPage.cloth')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.complexColorIdentification')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.complexShapeIdentification')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.attentionDivision')}>
              <option value={t('FormsPage.quietRoom')}>{t('FormsPage.quietRoom')}</option>
              <option value={t('FormsPage.break')}>{t('FormsPage.break')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.shortTermMemory')}>
              <option value={t('FormsPage.taskRepetition')}>{t('FormsPage.taskRepetition')}</option>
              <option value={t('FormsPage.appReminders')}>{t('FormsPage.appReminders')}</option>
              <option value={t('FormsPage.printedList')}>{t('FormsPage.printedList')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.shapeIdentification2D')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.peopleIdentification')}>
              <option value={t('FormsPage.photography')}>{t('FormsPage.photography')}</option>
              <option value={t('FormsPage.printedCard')}>{t('FormsPage.printedCard')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.imageIdentification')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.simpleGraphicSymbols')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.iconIdentification')}>
              <option value={t('FormsPage.drawing')}>{t('FormsPage.drawing')}</option>
              <option value={t('FormsPage.symbolization')}>{t('FormsPage.symbolization')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.dangerousMaterialsCaution')}>
              <option value={t('FormsPage.addProtection')}>{t('FormsPage.addProtection')}</option>
              <option value={t('FormsPage.removal')}>{t('FormsPage.removal')}</option>
              <option value={t('FormsPage.addWarning')}>{t('FormsPage.addWarning')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.sharpObjectsCaution')}>
              <option value={t('FormsPage.addProtection')}>{t('FormsPage.addProtection')}</option>
              <option value={t('FormsPage.removal')}>{t('FormsPage.removal')}</option>
              <option value={t('FormsPage.addWarning')}>{t('FormsPage.addWarning')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.electricalAppliancesCaution')}>
              <option value={t('FormsPage.addProtection')}>{t('FormsPage.addProtection')}</option>
              <option value={t('FormsPage.removal')}>{t('FormsPage.removal')}</option>
              <option value={t('FormsPage.addWarning')}>{t('FormsPage.addWarning')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.prolongedStanding')}>
              <option value={t('FormsPage.sitOnChair')}>{t('FormsPage.sitOnChair')}</option>
              <option value={t('FormsPage.breaks10Minutes')}>{t('FormsPage.breaks10Minutes')}</option>
              <option value={t('FormsPage.changePosture')}>{t('FormsPage.changePosture')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.placeIdentificationSpatial')}>
              <option value={t('FormsPage.signsWithText')}>{t('FormsPage.signsWithText')}</option>
              <option value={t('FormsPage.images')}>{t('FormsPage.images')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
            </optgroup>
            <optgroup label={t('FormsPage.colorBlindness')}>
              <option value={t('FormsPage.differentSortingMethod')}>{t('FormsPage.differentSortingMethod')}</option>
              <option value={t('FormsPage.voiceExplanation')}>{t('FormsPage.voiceExplanation')}</option>
              <option value={t('FormsPage.externalControl')}>{t('FormsPage.externalControl')}</option>
            </optgroup>
          </Select>
        )}

        <TextField
          margin='dense'
          id='explaination'
          label={t('FormsPage.explanation')}
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
        <Button onClick={handleReset}>{t('FormsPage.reset')}</Button>
        <Button onClick={handleSave}>{t('FormsPage.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlagsDialog;
