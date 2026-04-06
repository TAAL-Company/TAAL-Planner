import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useTranslator } from "../../../Utility/TranslationProvider";
import { generateOrEditAzureImage } from "../../../api/api";

export default function TaskImage({
  tasks,
  setTasks,
  task,
  taskIndex,
  imagePromptPrefix,
  imagePromptSuffix,
  imageWidth,
  imageHeight,
  imageModel,
  imageNoLogo,
  imageSeed,
  trigger = 0,
  // ── Base image (global, set from InputContainer) ──────────────────
  // { file: File, preview: string } | null
  baseImage = null,
}) {
  const { t } = useTranslation();
  const { translate } = useTranslator();

  const [isGenerating, setIsGenerating] = useState(false);

  // Per-task override: user can upload a different image just for this task.
  // When null we fall back to baseImage (if present).
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  // Flag to ignore the global base image for this specific task
  const [ignoreBaseImage, setIgnoreBaseImage] = useState(false);

  const fileInputRef = useRef(null);

  // Revoke local preview URL on change / unmount
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  // ── Resolve the active source image ──────────────────────────────
  // Priority: per-task local upload → global baseImage (if not ignored) → null (pure generation)
  const activeFile    = localFile ?? (!ignoreBaseImage ? baseImage?.file : null) ?? null;
  const activePreview = localPreview ?? (!ignoreBaseImage ? baseImage?.preview : null) ?? null;
  const hasActiveSource = !!activeFile;
  const isLocalOverride = !!localFile; // true only when the user picked a per-task file
  const isUsingBaseImage = !isLocalOverride && !ignoreBaseImage && !!baseImage;

  // ── Build prompt ──────────────────────────────────────────────────
  const buildPrompt = async () => {
    let title    = task?.title    || "";
    let subtitle = task?.subtitle || "";

    try {
      const tTitle    = await translate(title,    "en");
      const tSubtitle = await translate(subtitle, "en");
      title    = tTitle    || title;
      subtitle = tSubtitle || subtitle;
    } catch (e) {
      console.error("Translation error:", e);
    }

    return `${imagePromptPrefix}: ${title}. ${subtitle}.${imagePromptSuffix}`;
  };

  // ── Generate / Edit ───────────────────────────────────────────────
  const GenerateTaskImage = async () => {
    setIsGenerating(true);

    const prompt     = await buildPrompt();
    const targetSize = `${imageWidth}x${imageHeight}`;

    try {
      const imageUrl = await generateOrEditAzureImage(
        prompt,
        activeFile,   // File | null
        {
          size:    targetSize,
          style:   imageModel,
          quality: "standard",
          n:       imageSeed,
        }
      );

      console.log("Generated/Edited Azure image URL:", imageUrl);

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].picture_url = imageUrl;
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Azure image generation/edit failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Per-task upload handler ───────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (localPreview) URL.revokeObjectURL(localPreview);

    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
    // Clear ignore flag when uploading a new file
    setIgnoreBaseImage(false);
  };

  const handleRemoveLocalFile = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(null);
    setLocalPreview(null);
  };

  const handleIgnoreBaseImage = () => {
    setIgnoreBaseImage(true);
  };

  const handleUseBaseImage = () => {
    setIgnoreBaseImage(false);
  };

  // ── Trigger from parent (bulk generation) ────────────────────────
  useEffect(() => {
    if (trigger > 0 && !task?.picture_url && !isGenerating) {
      GenerateTaskImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const hasImage = !!task.picture_url;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

      {/* ── Main image box ── */}
      <Box
        sx={{
          width: 200,
          height: 150,
          bgcolor: "#1a1a1a",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          border: isGenerating ? "1px solid #4a9eff" : "1px solid #333",
          transition: "border-color 0.3s ease",
        }}
      >
        {hasImage ? (
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={task.picture_url}
              alt={task.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
                filter: isGenerating ? "blur(2px)" : "none",
              }}
            />
            {/* Hover overlay */}
            <Box
              sx={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                bgcolor: "rgba(0,0,0,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.2s", cursor: "pointer", zIndex: 2,
                "&:hover": { opacity: 1 },
              }}
              onClick={GenerateTaskImage}
            >
              <Tooltip
                title={
                  hasActiveSource
                    ? t("TextGenerative.edit_image", "Edit image with source")
                    : t("TextGenerative.regenerate_image")
                }
              >
                {hasActiveSource ? (
                  <EditIcon    sx={{ color: "white", fontSize: 24, transition: "transform 0.2s ease", "&:hover": { transform: "scale(1.1)" } }} />
                ) : (
                  <RefreshIcon sx={{ color: "white", fontSize: 24, transition: "transform 0.2s ease", "&:hover": { transform: "scale(1.1)" } }} />
                )}
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Tooltip
            title={
              hasActiveSource
                ? t("TextGenerative.edit_image", "Generate from source image")
                : t("TextGenerative.generate_image")
            }
          >
            <IconButton
              size="small"
              onClick={GenerateTaskImage}
              disabled={isGenerating}
              sx={{
                color: "#4a9eff",
                "&:hover": { bgcolor: "rgba(74,158,255,0.1)", transform: "scale(1.1)" },
                "&:disabled": { color: "#666" },
                transition: "all 0.2s ease",
              }}
            >
              {hasActiveSource ? (
                <EditIcon  sx={{ fontSize: 24 }} />
              ) : (
                <ImageIcon sx={{ fontSize: 24 }} />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <Box
            sx={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              bgcolor: "rgba(26,26,26,0.9)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 0.5,
              animation: "fadeIn 0.3s ease-in",
              "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
            }}
          >
            <CircularProgress size={20} sx={{ color: "#4a9eff" }} />
          </Box>
        )}
      </Box>

      {/* ── Per-task upload section ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Tooltip
          title={
            isLocalOverride
              ? t("TextGenerative.change_task_image", "Change this task's source image")
              : ignoreBaseImage
                ? t("TextGenerative.upload_for_edit", "Upload source image for editing")
                : baseImage
                  ? t("TextGenerative.override_base_image", "Upload a different image for this task only")
                  : t("TextGenerative.upload_image", "Upload source image for editing")
          }
        >
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            sx={{
              color: isLocalOverride ? "#4a9eff" : baseImage ? "#aaa" : "#888",
              border: "1px dashed",
              borderColor: isLocalOverride ? "#4a9eff" : baseImage ? "#666" : "#555",
              borderRadius: 1,
              padding: "4px",
              "&:hover": { bgcolor: "rgba(74,158,255,0.08)", borderColor: "#4a9eff", color: "#4a9eff" },
              transition: "all 0.2s ease",
            }}
          >
            <UploadFileIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Show per-task override preview */}
        {isLocalOverride && localPreview && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              bgcolor: "#2a2a2a", border: "1px solid #4a9eff",
              borderRadius: 1, padding: "2px 6px", maxWidth: 140,
            }}
          >
            <img
              src={localPreview}
              alt="task override"
              style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
            />
            <Typography variant="caption" sx={{ color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 70 }}>
              {localFile.name}
            </Typography>
            <Tooltip title={t("TextGenerative.remove_upload", "Remove — use base image or generate")}>
              <IconButton size="small" onClick={handleRemoveLocalFile} sx={{ color: "#888", padding: 0, "&:hover": { color: "#ff6b6b" } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Show base-image indicator when no local override */}
        {isUsingBaseImage && (
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              bgcolor: "#2a2a2a", border: "1px solid #666",
              borderRadius: 1, padding: "2px 6px", maxWidth: 140,
            }}
          >
            <img
              src={baseImage.preview}
              alt="base"
              style={{ width: 20, height: 20, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
            />
            <Typography variant="caption" sx={{ color: "#aaa", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 70 }}>
              {t("TextGenerative.using_base", "base")}
            </Typography>
            <Tooltip title={t("TextGenerative.remove_base_image", "Don't use base image for this task")}>
              <IconButton size="small" onClick={handleIgnoreBaseImage} sx={{ color: "#888", padding: 0, "&:hover": { color: "#ff6b6b" } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Show "ignored" state with option to restore */}
        {!isLocalOverride && ignoreBaseImage && baseImage && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666", fontSize: "0.65rem" }}>
              {t("TextGenerative.base_ignored", "base image ignored")}
            </Typography>
            <Tooltip title={t("TextGenerative.use_base_image", "Use base image again")}>
              <IconButton size="small" onClick={handleUseBaseImage} sx={{ color: "#666", padding: 0, "&:hover": { color: "#4a9eff" } }}>
                <RefreshIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Hint text */}
      {isLocalOverride && (
        <Typography variant="caption" sx={{ color: "#4a9eff", fontSize: "0.7rem" }}>
          {t("TextGenerative.edit_mode_hint", "Edit mode: task image will be used as source")}
        </Typography>
      )}
      {isUsingBaseImage && (
        <Typography variant="caption" sx={{ color: "#888", fontSize: "0.7rem" }}>
          {t("TextGenerative.base_image_hint", "Using global base image as source")}
        </Typography>
      )}
      {ignoreBaseImage && !isLocalOverride && baseImage && (
        <Typography variant="caption" sx={{ color: "#666", fontSize: "0.7rem" }}>
          {t("TextGenerative.pure_generation_hint", "Pure generation mode (no source image)")}
        </Typography>
      )}
    </Box>
  );
}