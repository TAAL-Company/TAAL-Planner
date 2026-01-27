import React, { useEffect, useState } from "react";
import {
  getingData_Places,
  uploadFiles,
  updateTask,
  generateAzureImage,
} from './api/api';
import { useTranslator } from './Utility/TranslationProvider';

// Extracted component so the hook is called at component level
function TaskCard({ task, index, selectedSite, onTaskUpdated }) {
  const { translate } = useTranslator();
  const [translatedPrompt, setTranslatedPrompt] = useState(null);
  const [tTitle, setTTitle] = useState("");
  const [tSubtitle, setTSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState(task.picture_url || null); // Initialize with existing image
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false); // Track if we uploaded a NEW image in this session
  const [editablePrompt, setEditablePrompt] = useState(""); // User-editable prompt
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Image prompt settings (similar to TaalAi)
  const imagePromptPrefix = "A highly realistic photo of a person performing the task: " ;
  const imagePromptSuffix = 'The scene should look natural and immersive, fitting the task context (e.g., office, workshop, or classroom). Use natural lighting, realistic details, and authentic atmosphere. Ultra-realistic, cinematic composition, shallow depth of field, detailed textures, and no visible text or written words.';

  // Generate image using Azure DALL-E
  const generateImage = async (promptToUse = null) => {
    setIsGenerating(true);
    setImageUrl(null);

    try {
      let prompt = promptToUse;

      if (!prompt) {
        // Translate title and subtitle to English
        const translatedTitle = await translate(task.title, "en");
        const translatedSubtitle = await translate(task.subtitle, "en");
        const title = translatedTitle || task.title;
        const subtitle = translatedSubtitle || task.subtitle;

        setTTitle(title);
        setTSubtitle(subtitle);

        prompt = `${imagePromptPrefix}: ${title}. ${subtitle}.${imagePromptSuffix}`;
        setTranslatedPrompt(prompt);
        setEditablePrompt(prompt);
      }

      console.log("Generating image with prompt:", prompt);

      const generatedUrl = await generateAzureImage(prompt, {
        size: '1024x1024',
        style: 'natural',
        quality: 'standard',
        n: 1,
      });

      console.log("Generated Azure image URL:", generatedUrl);
      setImageUrl(generatedUrl);
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    generateImage();
  };

  const handleApplyPromptChange = () => {
    // Trigger regeneration with the edited prompt
    setIsEditingPrompt(false);
    setHasUploadedNewImage(false);
    generateImage(editablePrompt);
  };

  const handleRegenerate = () => {
    // Reset states and regenerate
    setHasUploadedNewImage(false);
    const promptToUse = editablePrompt || translatedPrompt;
    generateImage(promptToUse);
  };

  // Convert image URL to File for Azure upload
  const urlToFile = async (url, filename) => {
    // Try direct fetch first (works for Azure DALL-E signed URLs)
    try {
      console.log('Attempting direct fetch:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith('image/')) {
          console.log('✅ Direct fetch successful:', blob.type, blob.size);
          return new File([blob], filename, { type: blob.type });
        }
      }
    } catch (error) {
      console.log('Direct fetch failed, trying canvas method:', error.message);
    }

    // Fallback: Canvas-based conversion
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], filename, { type: 'image/png' });
              console.log('✅ Image converted via canvas:', file.size);
              resolve(file);
            } else {
              console.error('❌ Failed to convert canvas to blob');
              resolve(null);
            }
          }, 'image/png');
        } catch (error) {
          console.error('❌ Canvas conversion failed:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.error('❌ Failed to load image for canvas conversion');
        resolve(null);
      };
      
      img.src = url;
      
      // Timeout after 15 seconds
      setTimeout(() => {
        console.error('❌ Image load timeout');
        resolve(null);
      }, 15000);
    });
  };

  // Upload image to Azure and update task
  const handleUploadToAzure = async () => {
    if (!imageUrl || !selectedSite) return;

    setIsUploading(true);

    try {
      // Convert the generated image URL to a File
      const translatedTitle = await translate(task.title, "en");
      const imageFile = await urlToFile(imageUrl, `AI_${translatedTitle}.png`);

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

      {!imageUrl && !isGenerating ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: "10px 20px",
            backgroundColor: isGenerating ? "#999" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isGenerating ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>
      ) : (
        <>
          {imageUrl && !isGenerating ? (
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
          ) : isGenerating ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>Generating image with Azure DALL-E...</p>
          ) : null}
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
// import React, { useEffect, useState } from "react";
// import {
//   getingData_Places,
//   uploadFiles,
//   updateTask,
// } from './api/api';
// import { useTranslator } from './Utility/TranslationProvider';

// function TaskCard({ task, index, selectedSite, onTaskUpdated }) {

//   const handleGenerate = async () => {
//     const { translate } = useTranslator();
//     const translatedTitle = await translate(task.title, "en");
//     const translatedSubtitle = await translate(task.subtitle, "en");
//   };

//   return (
//     <div
//       style={{
//         background: "#fff",
//         borderRadius: 16,
//         padding: 16,
//         boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
//       }}
//     >
//       <h3 style={{ margin: "0 0 8px 0" }}>{index + 1}. {task.title} - {tTitle}</h3>
//       <p style={{ margin: "0 0 12px 0", color: "#666" }}>{task.subtitle} - {tSubtitle}</p>
//     </div>
//   );
// }

// export default function getJson() {
//   const [sites, setSites] = useState([]);
//   const [selectedSite, setSelectedSite] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getingData_Places()  // Use directly - it already returns parsed data
//       .then(setSites)
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading sites...</p>;

//   return (
//     <div style={{ padding: 24 }}>
//       {/* Site Selector */}
//       <select
//         style={{ padding: 10, marginBottom: 24, width: 320 }}
//         value={selectedSite?.id || ""}
//         onChange={(e) =>
//           setSelectedSite(
//             sites.find((s) => s.id === e.target.value)
//           )
//         }
//       >
//         <option value="">Select a site</option>
//         {sites.map((site) => (
//           <option key={site.id} value={site.id}>
//             {site.name}
//           </option>
//         ))}
//       </select>

//       {/* Task Images */}
//       {selectedSite && (
//         <>  </>
//       )}
//     </div>
//   );
// }
