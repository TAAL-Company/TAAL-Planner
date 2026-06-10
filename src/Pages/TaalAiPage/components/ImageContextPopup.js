import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";
import { createChatCompletion } from "../../../api/api";
import { useNotification } from "../../../components/Notification/NotificationProvider";

const DEFAULT_CONTEXT = {
  environment: "",
  people: "",
  objects: "",
  styleMood: "",
  additionalDetails: "",
};

/**
 * ImageContextPopup
 *
 * Shared popup for editing image-generation context.
 *
 * Props
 * ─────
 * open            boolean
 * onClose         () => void
 * onGenerate      (context) => void   — called with the final context object
 * mode            'task' | 'general'
 * task            current task object (task mode)
 * taskIndex       number              (task mode)
 * tasks           full task array
 * originalPrompt  string
 * baseImage       { file, preview } | null
 * theme           colors object
 * isRTL           boolean
 */
export default function ImageContextPopup({
  open,
  onClose,
  onGenerate,
  mode = "task",
  task = null,
  taskIndex = 0,
  tasks = [],
  originalPrompt = "",
  baseImage = null,
  theme,
  isRTL = false,
}) {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();

  // Map i18n language key → human-readable name for the AI prompt
  const languageNameMap = {
    English: "English",
    Hebrew: "Hebrew",
    Arabic: "Arabic",
    Russian: "Russian",
  };
  const outputLanguage = languageNameMap[i18n.language] || "English";

  const colors = theme || {
    backgroundSecondary: "#2b2b2b",
    backgroundTertiary: "#3a3a3a",
    text: "#ffffff",
    textSecondary: "#cccccc",
    textMuted: "gray",
    border: "#4a4a4a",
    primary: "#4a9eff",
    primaryHover: "#3a8eef",
    accent: "#ff6b35",
  };

  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // ── Auto-populate context fields via GPT whenever the dialog opens ──
  const autoGenerateContext = useCallback(async () => {
    if (!open) return;
    setIsAutoGenerating(true);
    setContext(DEFAULT_CONTEXT);

    try {
      const relatedTasks = tasks
        .filter((_, i) => i !== taskIndex)
        .map((t, i) => `Task ${i + 1}: ${t.title}${t.subtitle ? ` — ${t.subtitle}` : ""}`)
        .join("\n");

      const isGeneral = mode === "general";

      const systemPrompt = `You are an expert image prompt engineer.
Analyze the project and ${isGeneral ? "all tasks" : "the specified task"} to generate structured image context.

IMPORTANT: Write ALL field values in ${outputLanguage}. Do not use any other language.

Output valid JSON only — no markdown, no explanation:
{
  "environment": "...",
  "people": "...",
  "objects": "...",
  "styleMood": "...",
  "additionalDetails": "..."
}

Field guidelines:
- environment: Physical setting, location, atmosphere (2-3 sentences)
- people: Characters, roles, or agents in the scene (1-2 sentences, or "None" if not applicable)
- objects: Key props, tools, equipment, and supporting elements (2-4 items as a list)
- styleMood: Visual style, mood, tone, lighting (1-2 sentences)
- additionalDetails: Camera angle, composition, quality enhancements, continuity notes (1-2 sentences)

Apply context weights:
- Original project goal: 60% influence (dominant theme, environment, narrative)
- ${isGeneral ? "All tasks combined: 25%" : "Current task: 25%"} (specific action to visualize)
- Related tasks: 10% (shared entities, continuity)
- Visual reference present: 5% (style cue if an image is attached)`;

      const userMessage = `Original Project Goal (60%): ${originalPrompt || "Not specified"}

${
  isGeneral
    ? `All Tasks (25%):\n${tasks.map((t, i) => `Task ${i + 1}: ${t.title}${t.subtitle ? ` — ${t.subtitle}` : ""}`).join("\n") || "None"}`
    : `Current Task #${taskIndex + 1} (25%): ${task?.title || ""}${task?.subtitle ? `\nTask Details: ${task.subtitle}` : ""}`
}

Related Tasks (10%):
${relatedTasks || "None"}

Visual Reference (5%): ${baseImage ? "Yes — a reference image is attached" : "No"}

Generate the image context JSON.`;

      const response = await createChatCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        { maxTokens: 500 }
      );

      const raw = response?.choices?.[0]?.message?.content?.trim() || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setContext({
          environment: parsed.environment || "",
          people: parsed.people || "",
          objects: parsed.objects || "",
          styleMood: parsed.styleMood || "",
          additionalDetails: parsed.additionalDetails || "",
        });
      }
    } catch (e) {
      console.error("ImageContextPopup: auto-generate failed:", e);
      showNotification("warning", "Could not auto-generate context — fill in the fields manually.");
    } finally {
      setIsAutoGenerating(false);
    }
  }, [open, mode, task, taskIndex, tasks, originalPrompt, baseImage, outputLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      // Only auto-generate if context has never been filled (first open)
      const isEmpty = Object.values(context).every((v) => !v);
      if (isEmpty) {
        autoGenerateContext();
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = (field) => (e) => {
    setContext((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGenerate = () => {
    onGenerate(context);
    onClose();
  };

  const isGeneralMode = mode === "general";

  const fields = [
    {
      key: "environment",
      label: t("ImageContext.environment", "Environment"),
      placeholder: t("ImageContext.environmentPlaceholder", "e.g. Modern smart kitchen with stainless steel appliances and overhead camera system"),
      rows: 2,
    },
    {
      key: "people",
      label: t("ImageContext.people", "People"),
      placeholder: t("ImageContext.peoplePlaceholder", "e.g. Optional homeowner observing in background, or automated robotic system only"),
      rows: 2,
    },
    {
      key: "objects",
      label: t("ImageContext.objects", "Objects"),
      placeholder: t("ImageContext.objectsPlaceholder", "e.g. Dirty dishes, AI vision overlay bounding boxes, sink, countertops, robotic arm"),
      rows: 2,
    },
    {
      key: "styleMood",
      label: t("ImageContext.styleMood", "Style / Mood"),
      placeholder: t("ImageContext.styleMoodPlaceholder", "e.g. Technical, futuristic, realistic, product-demonstration lighting"),
      rows: 2,
    },
    {
      key: "additionalDetails",
      label: t("ImageContext.additionalDetails", "Additional Details"),
      placeholder: t("ImageContext.additionalDetailsPlaceholder", "e.g. Eye-level shot, shallow depth of field, high-detail rendering, no visible text"),
      rows: 2,
    },
  ];

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      color: colors.text,
      bgcolor: colors.backgroundTertiary,
      "& fieldset": { borderColor: colors.border },
      "&:hover fieldset": { borderColor: colors.primary },
      "&.Mui-focused fieldset": { borderColor: colors.primary },
    },
    "& .MuiInputLabel-root": { color: colors.textMuted },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.primary },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.backgroundSecondary,
          color: colors.text,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          direction: isRTL ? "rtl" : "ltr",
        },
      }}
    >
      {/* ── Title ── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ color: colors.primary }} />
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
            {isGeneralMode
              ? t("ImageContext.titleGeneral", "Configure Image Context — All Tasks")
              : t("ImageContext.titleTask", `Configure Image Context — Task ${taskIndex + 1}`)}
          </Typography>
          {isGeneralMode && (
            <Chip
              label={t("ImageContext.allTasks", "All Tasks")}
              size="small"
              sx={{ bgcolor: `${colors.primary}22`, color: colors.primary, border: `1px solid ${colors.primary}44` }}
            />
          )}
          {!isGeneralMode && task?.title && (
            <Chip
              label={`#${taskIndex + 1}`}
              size="small"
              sx={{ bgcolor: `${colors.accent}22`, color: colors.accent, border: `1px solid ${colors.accent}44` }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: colors.textMuted, "&:hover": { color: colors.text } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {/* Task title hint (task mode) */}
        {!isGeneralMode && task?.title && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: colors.backgroundTertiary, borderRadius: 1, border: `1px solid ${colors.border}` }}>
            <Typography variant="caption" sx={{ color: colors.textMuted, display: "block", mb: 0.5 }}>
              {t("ImageContext.currentTask", "Current task")}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
              {task.title}
            </Typography>
            {task.subtitle && (
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {task.subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Auto-generating indicator */}
        {isAutoGenerating && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, p: 1.5, bgcolor: `${colors.primary}11`, borderRadius: 1, border: `1px solid ${colors.primary}33` }}>
            <CircularProgress size={16} sx={{ color: colors.primary, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: colors.primary }}>
              {t("ImageContext.autoGenerating", "AI is generating context based on your project…")}
            </Typography>
          </Box>
        )}

        {/* Description */}
        {!isAutoGenerating && (
          <Typography variant="caption" sx={{ color: colors.textMuted, display: "block", mb: 2 }}>
            {t("ImageContext.description", "Edit any field to customize what the AI will visualize. These fields are combined into the final image prompt.")}
          </Typography>
        )}

        {/* Context fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {fields.map(({ key, label, placeholder, rows }) => (
            <TextField
              key={key}
              label={label}
              placeholder={isAutoGenerating ? "" : placeholder}
              value={context[key]}
              onChange={handleFieldChange(key)}
              multiline
              rows={rows}
              fullWidth
              disabled={isAutoGenerating}
              sx={fieldSx}
              InputLabelProps={{ shrink: true }}
            />
          ))}
        </Box>

        <Divider sx={{ mt: 2, borderColor: colors.border }} />

        {/* Weight legend */}
        <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ color: colors.textMuted, alignSelf: "center" }}>
            {t("ImageContext.contextWeights", "Context weights:")}
          </Typography>
          {[
            { label: "Original prompt 60%", color: colors.primary },
            { label: isGeneralMode ? "All tasks 25%" : "Current task 25%", color: colors.accent },
            { label: "Related 10%", color: colors.textSecondary },
            { label: "Visual ref 5%", color: colors.textMuted },
          ].map(({ label, color }) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={{ bgcolor: "transparent", border: `1px solid ${color}55`, color, fontSize: "0.65rem" }}
            />
          ))}
        </Box>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Re-generate context button */}
        <Tooltip title={t("ImageContext.regenerateContext", "Re-generate context from AI")}>
          <span>
            <Button
              variant="outlined"
              startIcon={isAutoGenerating ? <CircularProgress size={14} sx={{ color: colors.primary }} /> : <AutoAwesomeIcon />}
              onClick={autoGenerateContext}
              disabled={isAutoGenerating}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                "&:hover": { bgcolor: `${colors.primary}1A`, borderColor: colors.primaryHover },
                "&:disabled": { borderColor: colors.border, color: colors.textMuted },
              }}
            >
              {t("ImageContext.regenerate", "Re-generate")}
            </Button>
          </span>
        </Tooltip>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="text"
            onClick={onClose}
            sx={{ color: colors.textMuted, "&:hover": { color: colors.text } }}
          >
            {t("ImageContext.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            startIcon={<ImageIcon />}
            onClick={handleGenerate}
            disabled={isAutoGenerating}
            sx={{
              bgcolor: colors.primary,
              "&:hover": { bgcolor: colors.primaryHover },
              "&:disabled": { bgcolor: colors.border, color: colors.textMuted },
            }}
          >
            {isGeneralMode
              ? t("ImageContext.generateAll", "Generate All Images")
              : t("ImageContext.generateOne", "Generate Image")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
