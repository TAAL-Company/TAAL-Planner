import React, { useState, useEffect } from "react";
import { Box, IconButton, CircularProgress, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";
import { useTranslator } from "../../../Utility/TranslationProvider";
import { generateAzureImage } from "../../../api/api";

export default function TaskImage({
  tasks,
  setTasks,
  task,
  taskIndex,
  imagePromptPrefix,
  imagePromptSuffix,
  imageWidth = 400,
  imageHeight = 300,
  imageModel = "turbo",
  imageNoLogo = true,
  imageSeed = 42,
  trigger = 0, // new: parent can trigger generation
}) {
  const { t } = useTranslation();
  const { translate } = useTranslator();

  const [isGenerating, setIsGenerating] = useState(false);
  const [seed, setSeed] = useState(imageSeed);

  // Main image generation logic (Postman-like)
  const GenerateTaskImage = async () => {
    setIsGenerating(true);

    let title = task?.title || "";
    let subtitle = task?.subtitle || "";

    try {
      const tTitle = await translate(title, "en");
      const tSubtitle = await translate(subtitle, "en");
      title = tTitle || title;
      subtitle = tSubtitle || subtitle;
    } catch (e) {
      console.error("Translation error:", e);
    }

    const prompt = `${imagePromptPrefix}: ${title}. ${subtitle}.${imagePromptSuffix}`;

    // Azure DALL·E only supports square presets (256/512/1024), clamp requested size accordingly
    const targetSize = `${Math.min(Math.max(imageWidth, 256), 1024)}x${Math.min(
      Math.max(imageHeight, 256),
      1024
    )}`;

    try {
      const imageUrl = await generateAzureImage(prompt, {
        size: "1024x1024",
        style: "natural",
        quality: "standard",
      });

      console.log("Generated Azure image URL:", imageUrl);

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].picture_url = imageUrl;
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Azure image generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasImage = !!task.picture_url;

  // Only generate on trigger if the task is missing an image
  useEffect(() => {
    if (trigger > 0 && !task?.picture_url && !isGenerating) {
      GenerateTaskImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
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
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
              zIndex: 2,
              "&:hover": { opacity: 1 },
            }}
            onClick={GenerateTaskImage}
          >
            <Tooltip title={t("TextGenerative.regenerate_image")}>
              <RefreshIcon
                sx={{
                  color: "white",
                  fontSize: 24,
                  "&:hover": { transform: "scale(1.1)" },
                  transition: "transform 0.2s ease",
                }}
              />
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Tooltip title={t("TextGenerative.generate_image")}>
          <IconButton
            size="small"
            onClick={GenerateTaskImage}
            disabled={isGenerating}
            sx={{
              color: "#4a9eff",
              "&:hover": {
                bgcolor: "rgba(74, 158, 255, 0.1)",
                transform: "scale(1.1)",
              },
              "&:disabled": { color: "#666" },
              transition: "all 0.2s ease",
            }}
          >
            <ImageIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      )}

      {isGenerating && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(26, 26, 26, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            animation: "fadeIn 0.3s ease-in",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          <CircularProgress size={20} sx={{ color: "#4a9eff" }} />
        </Box>
      )}
    </Box>
  );
}
