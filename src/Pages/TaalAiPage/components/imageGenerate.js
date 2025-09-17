import React, { useState, useEffect } from "react";
import { Box, IconButton, CircularProgress, Tooltip } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageIcon from '@mui/icons-material/Image';
import { useTranslation } from "react-i18next";
import { usePollinationsImage } from '@pollinations/react';

export default function TaskImage({ 
  tasks, 
  setTasks,
  task,
  taskIndex,
  imagePromptPrefix,
  imagePromptSuffix,
  imageWidth = 400,
  imageHeight = 300,
  imageModel = 'flux',
  imageNoLogo = true,
  imageSeed = 42 // Add imageSeed prop with default
}) {
  const { t } = useTranslation();

  // Local state for this task only
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(null);
  const [seed, setSeed] = useState(imageSeed); // Initialize with configurable seed

  // Call the hook at the top level
  const imageUrl = usePollinationsImage(
    imagePrompt,
    imagePrompt
      ? {
        width: imageWidth,
        height: imageHeight,
        seed: seed, // Use dynamic seed
        model: imageModel,
        nologo: imageNoLogo
      }
      : undefined
  );

  // Effect to update the task with the generated image
  useEffect(() => {
    if (imageUrl && isGenerating) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].picture_url = imageUrl;
      setTasks(updatedTasks);
      setIsGenerating(false);
      setImagePrompt(null);
    }
    // eslint-disable-next-line
  }, [imageUrl]);

  // Function to trigger image generation for this task
  const GenerateTaskImage = () => {
    const prompt = `${imagePromptPrefix}${task.title}. ${task.subtitle || ''}.${imagePromptSuffix}`;
    
    // Generate a new random seed for regeneration, but start from the configured seed
    const newSeed = Math.floor(Math.random() * 1000000) + imageSeed;
    setSeed(newSeed);
    
    setImagePrompt(prompt);
    setIsGenerating(true);
  };

  const hasImage = task.picture_url;

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
              filter: isGenerating ? "blur(2px)" : "none"
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
              "&:hover": {
                opacity: 1,
              }
            }}
            onClick={GenerateTaskImage}
          >
            <Tooltip title={t('TextGenerative.regenerate_image')}>
              <RefreshIcon 
                sx={{ 
                  color: "white", 
                  fontSize: 24,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  transition: "transform 0.2s ease"
                }} 
              />
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Tooltip title={t('TextGenerative.generate_image')}>
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
              "&:disabled": {
                color: "#666",
              },
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
          <CircularProgress 
            size={20} 
            sx={{ color: "#4a9eff" }} 
          />
        </Box>
      )}
    </Box>
  );
}