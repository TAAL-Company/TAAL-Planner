import React, { useEffect, useState } from "react";
import { usePollinationsImage } from "@pollinations/react";
import {
  getingData_Places,
  uploadFiles,
  updateTask,
} from './api/api';
import { useTranslator } from './Utility/TranslationProvider';

// Extracted component so the hook is called at component level
function TaskCard({ task, index, selectedSite, onTaskUpdated }) {
  const { translate } = useTranslator();
  const [translatedPrompt, setTranslatedPrompt] = useState(null);
  const [tTitle, setTTitle] = useState("");
  const [tSubtitle, setTSubtitle] = useState("");
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false); // Track if we uploaded a NEW image in this session
  const [seed, setSeed] = useState(() => Math.abs(
    (task.title + task.subtitle)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0)
  ));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState(""); // User-editable prompt
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Image prompt settings (similar to TaalAi)
  const imagePromptPrefix = "A highly realistic photo of a person performing the task: " ;
  const imagePromptSuffix = 'The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.';

  // Translate title and subtitle to English before generating image
  useEffect(() => {
    if (!shouldGenerate) return;
    
    const buildPrompt = async () => {
      try {
        const translatedTitle = await translate(task.title, "en");
        const translatedSubtitle = await translate(task.subtitle, "en");
        const title = translatedTitle || task.title;
        const subtitle = translatedSubtitle || task.subtitle;
        
        setTTitle(title);
        setTSubtitle(subtitle);
        
        const prompt = `${imagePromptPrefix}: ${title}. ${subtitle}.${imagePromptSuffix}`;
        setTranslatedPrompt(prompt);
        setEditablePrompt(prompt); // Initialize editable prompt
      } catch (e) {
        console.error("Translation error:", e);
        // Fallback to original text if translation fails
        setTTitle(task.title);
        setTSubtitle(task.subtitle);
        const prompt = `${imagePromptPrefix}: ${task.title}. ${task.subtitle}.${imagePromptSuffix}`;
        setTranslatedPrompt(prompt);
        setEditablePrompt(prompt); // Initialize editable prompt
      }
    };
    buildPrompt();
  }, [task.title, task.subtitle, translate, shouldGenerate]);

  // Only pass prompt to hook when shouldGenerate is true
  // Use editablePrompt if user has edited it, otherwise use translatedPrompt
  const activePrompt = editablePrompt || translatedPrompt;
  const imageUrl = usePollinationsImage(shouldGenerate ? activePrompt : null, {
    width: 512,
    height: 512,
    model: "flux",
    seed: seed,
  });

  const handleGenerate = () => {
    setShouldGenerate(true);
  };

  const handleApplyPromptChange = () => {
    // Trigger regeneration with the new prompt
    setIsEditingPrompt(false);
    setHasUploadedNewImage(false);
    setIsRegenerating(true);
    setSeed(prev => prev + 1);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 100);
  };

  const handleRegenerate = () => {
    // Reset states for new generation
    setHasUploadedNewImage(false);
    setIsRegenerating(true);
    // Change seed to get a different image
    setSeed(prev => prev + 1);
    // Small delay to allow the hook to reset
    setTimeout(() => {
      setIsRegenerating(false);
    }, 100);
  };

  // Convert image URL to File for Azure upload
  const urlToFile = async (url, filename) => {
    try {
      // Use CORS proxy to fetch the image
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || 'image/png' });
    } catch (error) {
      console.error('Error converting URL to file:', error);
      return null;
    }
  };

  // Upload image to Azure and update task
  const handleUploadToAzure = async () => {
    if (!imageUrl || !selectedSite) return;
    
    setIsUploading(true);
    
    try {
      // Convert the generated image URL to a File
      const translatedTitle = await translate(task.title, "en");
      const imageFile = await urlToFile(imageUrl, `ai_generated_image_${translatedTitle}.png`);
      
      if (!imageFile) {
        console.error('Failed to convert image URL to file');
        alert('Failed to process image. Please try again.');
        setIsUploading(false);
        return;
      }
      
      console.log('📦 Uploading image to Azure:', imageFile.name, imageFile.size);
      
      // Upload to Azure Blob Storage (using site's nameInEnglish as folder structure)
      const azureImageUrl = await uploadFiles(imageFile, 'Task media/picture', selectedSite.nameInEnglish);
      
      console.log('✅ Image uploaded to Azure:', azureImageUrl);
      
      // Update the task with the new image URL
      const updatedTask = {
        picture_url: azureImageUrl
      };
      
      await updateTask(task.id, updatedTask);
      
      console.log('✅ Task updated with new image');
      
      setHasUploadedNewImage(true);
      
      // Notify parent component if callback provided
      if (onTaskUpdated) {
        onTaskUpdated(task.id, azureImageUrl);
      }
      
      alert('Image uploaded and task updated successfully!');
      
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 8px 0" }}>{index + 1}. {task.title} - {tTitle}</h3>
      <p style={{ margin: "0 0 12px 0", color: "#666" }}>{task.subtitle} - {tSubtitle}</p>
      
      {!shouldGenerate ? (
        <button
          onClick={handleGenerate}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          Generate Image
        </button>
      ) : (
        <>
          {imageUrl && !isRegenerating ? (
            <div>
              {/* Editable Prompt Section */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: "#666", fontWeight: "bold" }}>Image Prompt:</label>
                  {!isEditingPrompt ? (
                    <button
                      onClick={() => setIsEditingPrompt(true)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#673AB7",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✏️ Edit Prompt
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromptChange}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✓ Apply & Regenerate
                    </button>
                  )}
                </div>
                {isEditingPrompt ? (
                  <textarea
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: 8,
                      borderRadius: 8,
                      border: "2px solid #673AB7",
                      fontSize: 12,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <p style={{ 
                    fontSize: 11, 
                    color: "#888", 
                    margin: 0,
                    padding: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                    maxHeight: 60,
                    overflow: "auto",
                  }}>
                    {editablePrompt || translatedPrompt}
                  </p>
                )}
              </div>
              
              <img
                src={imageUrl}
                alt={task.title}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleRegenerate}
                  disabled={isUploading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isUploading ? "#999" : "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={handleUploadToAzure}
                  disabled={isUploading || hasUploadedNewImage}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: hasUploadedNewImage ? "#888" : isUploading ? "#999" : "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: hasUploadedNewImage || isUploading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {hasUploadedNewImage ? "✓ Uploaded" : isUploading ? "Uploading..." : "💾 Save to Task"}
                </button>
              </div>
              {hasUploadedNewImage && (
                <p style={{ color: "#4CAF50", fontSize: 12, marginTop: 8 }}>
                  Image saved to task successfully!
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: "#999", fontStyle: "italic" }}>Generating image...</p>
          )}
        </>
      )}
    </div>
  );
}

export default function GenerateTaskImagesPage() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getingData_Places()  // Use directly - it already returns parsed data
      .then(setSites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading sites...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>AI Task Image Generator</h1>
      <p>Generate visual instructions for each task</p>

      {/* Site Selector */}
      <select
        style={{ padding: 10, marginBottom: 24, width: 320 }}
        value={selectedSite?.id || ""}
        onChange={(e) =>
          setSelectedSite(
            sites.find((s) => s.id === e.target.value)
          )
        }
      >
        <option value="">Select a site</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>

      {/* Task Images */}
      {selectedSite && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {selectedSite.tasks.map((task, index) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              index={index} 
              selectedSite={selectedSite}
              onTaskUpdated={(taskId, newImageUrl) => {
                console.log(`Task ${taskId} updated with image: ${newImageUrl}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
