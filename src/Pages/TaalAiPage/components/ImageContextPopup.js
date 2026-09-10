import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { createChatCompletion, getingData_Places, uploadFiles } from "../../../api/api";
import { useNotification } from "../../../components/Notification/NotificationProvider";
import SiteSelectionDialog from "./SiteSelectionDialog";

const DEFAULT_CONTEXT = {
  environment: "",
  people: "",
  objects: "",
  styleMood: "",
  additionalDetails: "",
  peopleImage: null,
  environmentImage: null,
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
  initialContext = null,
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
  const [siteSelectionOpen, setSiteSelectionOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [siteSearchTerm, setSiteSearchTerm] = useState("");
  const [loadingSites, setLoadingSites] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const peopleImageInputRef = useRef(null);
  const environmentImageInputRef = useRef(null);

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
          peopleImage: context.peopleImage || null,
          environmentImage: context.environmentImage || null,
        });
      }
    } catch (e) {
      console.error("ImageContextPopup: auto-generate failed:", e);
      showNotification("warning", "Could not auto-generate context — fill in the fields manually.");
    } finally {
      setIsAutoGenerating(false);
    }
  }, [open, mode, task, taskIndex, tasks, originalPrompt, outputLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      // Only auto-generate if context has never been filled (first open)
      const isEmpty = Object.values(context).every((v) => !v);
      if (isEmpty && !initialContext) {
        autoGenerateContext();
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && initialContext) {
      setContext({ ...DEFAULT_CONTEXT, ...initialContext });
    }
  }, [open, initialContext]);

  const handleFieldChange = (field) => (e) => {
    setContext((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleReferenceChange = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    if (!file) return;

    setContext((prev) => ({
      ...prev,
      [field]: {
        file,
        preview: URL.createObjectURL(file),
        url: "",
        name: file.name,
      },
    }));
  };

  const handleReferenceRemove = (field) => () => {
    const reference = context[field];
    if (reference?.preview?.startsWith("blob:")) URL.revokeObjectURL(reference.preview);
    setContext((prev) => ({ ...prev, [field]: null }));
  };

  const saveContext = async (site = null) => {
    const nextContext = { ...context };
    for (const field of ["peopleImage", "environmentImage"]) {
      const reference = nextContext[field];
      if (reference?.file && !reference.url) {
        try {
          const siteKey = site.nameInEnglish || site.name || site.id;
          const url = await uploadFiles(reference.file, `AI image context/${field}`, siteKey);
          nextContext[field] = { ...reference, url };
        } catch (error) {
          console.error(`Failed to persist ${field}:`, error);
          showNotification("warning", t("ImageContext.persistFailed", "Image reference could not be saved."));
        }
      }
    }
    onGenerate(nextContext);
    setSiteSelectionOpen(false);
    onClose();
  };

  const handleGenerate = async () => {
    const hasUnpersistedImages = ["peopleImage", "environmentImage"].some(
      (field) => context[field]?.file && !context[field]?.url
    );

    if (!hasUnpersistedImages) {
      onGenerate({ ...context });
      onClose();
      return;
    }

    setSiteSearchTerm("");
    setSiteSelectionOpen(true);
    setLoadingSites(true);
    try {
      const sitesData = await getingData_Places();
      setSites(sitesData || []);
    } catch (error) {
      console.error("ImageContextPopup: failed to load sites:", error);
      showNotification("error", t("ImageContext.errorLoadingSites", "Could not load sites."));
    } finally {
      setLoadingSites(false);
    }
  };

  const filteredSites = sites.filter((site) => {
    const query = siteSearchTerm.trim().toLowerCase();
    if (!query) return true;
    return `${site?.name || ""} ${site?.description || ""} ${site?.nameInEnglish || ""}`
      .toLowerCase()
      .includes(query);
  });

  const handleSelectSite = async (site) => {
    setIsUploading(true);
    try {
      await saveContext(site);
    } finally {
      setIsUploading(false);
    }
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

  const referenceFields = [
    {
      key: "peopleImage",
      label: t("ImageContext.peopleImage", "People / Face image"),
      hint: t("ImageContext.peopleImageHint", "Used as the standard person or face reference"),
      inputRef: peopleImageInputRef,
    },
    {
      key: "environmentImage",
      label: t("ImageContext.environmentImage", "Environment / Background image"),
      hint: t("ImageContext.environmentImageHint", "Used as the standard setting or background reference"),
      inputRef: environmentImageInputRef,
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
    <>
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

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {referenceFields.map(({ key, label, hint, inputRef }) => {
            const reference = context[key];
            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.25,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 1,
                  bgcolor: colors.backgroundTertiary,
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={handleReferenceChange(key)}
                />
                {reference?.preview ? (
                  <img
                    src={reference.preview}
                    alt={label}
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                  />
                ) : (
                  <ImageIcon sx={{ color: colors.textMuted, fontSize: 40, flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: "block" }}>
                    {reference?.name || hint}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => inputRef.current?.click()}
                  disabled={isAutoGenerating}
                  sx={{ color: colors.primary, borderColor: colors.primary, flexShrink: 0 }}
                >
                  {reference
                    ? t("ImageContext.replaceImage", "Replace")
                    : t("ImageContext.uploadImage", "Upload")}
                </Button>
                {reference && (
                  <Tooltip title={t("ImageContext.removeImage", "Remove image")}>
                    <IconButton
                      size="small"
                      onClick={handleReferenceRemove(key)}
                      disabled={isAutoGenerating}
                      sx={{ color: colors.textMuted, flexShrink: 0 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}
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

      <SiteSelectionDialog
        open={siteSelectionOpen}
        onClose={() => setSiteSelectionOpen(false)}
        sites={sites}
        filteredSites={filteredSites}
        loadingSites={loadingSites}
        searchTerm={siteSearchTerm}
        onSearchChange={setSiteSearchTerm}
        onSelectSite={handleSelectSite}
        isUploading={isUploading}
        direction={isRTL ? "rtl" : "ltr"}
      />
    </>
  );
}
