import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  CircularProgress,
  IconButton,
  Paper
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../components/Notification/NotificationProvider";
// Import API functions
import { insertStation, insertTask, insertRoute, uploadFiles, getingData_Places } from "../../../api/api";

export default function PushToPlannerPopup({
  isOpen,
  onClose,
  tasks,
  complexity,
  direction
}) {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  
  // Site selection popup states
  const [sitePopupOpen, setSitePopupOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loadingSites, setLoadingSites] = useState(false);

  // Load sites when popup opens
  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const sitesData = await getingData_Places();
      setSites(sitesData || []);
    } catch (error) {
      console.error('Error loading sites:', error);
      showNotification('error', t('PushToPlannerPopup.errorLoadingSites') || 'Error loading sites');
    } finally {
      setLoadingSites(false);
    }
  };

  // Open site selection popup
  const handleOpenSitePopup = () => {
    setSitePopupOpen(true);
    loadSites();
  };

  // Close site selection popup
  const handleCloseSitePopup = () => {
    setSitePopupOpen(false);
    setSelectedSite(null);
  };

  // Select site and start upload process
  const handleSelectSite = (site) => {
    setSelectedSite(site);
    handleCloseSitePopup();
    processTasksToAPI(site);
  };

  // Helper functions
  const groupBy = (array, key) => {
    return array.reduce((acc, obj) => {
      const property = obj[key];
      acc[property] = acc[property] || [];
      acc[property].push(obj);
      return acc;
    }, {});
  };

  // Fix URL if it's using the wrong Pollinations format
  const fixPollinationsUrl = (url) => {
    if (url.includes('pollinations.ai/p/')) {
      // Convert from pollinations.ai/p/ to image.pollinations.ai/prompt/
      return url.replace('pollinations.ai/p/', 'image.pollinations.ai/prompt/');
    }
    return url;
  };

  // Enhanced URL to File conversion with CORS handling and retries
  const urlToFile = async (url, filename, maxRetries = 3) => {
    // Fix the URL format first
    const fixedUrl = fixPollinationsUrl(url);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} to fetch image:`, fixedUrl);
        
        // Try different approaches based on the attempt
        let response;
        
        if (attempt === 1) {
          // First attempt: Direct fetch with no-cors mode
          response = await fetch(fixedUrl, {
            mode: 'no-cors',
            cache: 'no-cache'
          });
          
          // no-cors mode returns opaque response, so we need to try a different approach
          if (response.type === 'opaque') {
            throw new Error('CORS blocked, trying alternative method');
          }
        } else if (attempt === 2) {
          // Second attempt: Try with CORS proxy (you might need to implement this)
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fixedUrl)}`;
          response = await fetch(proxyUrl);
        } else {
          // Third attempt: Direct fetch with different headers
          response = await fetch(fixedUrl, {
            method: 'GET',
            headers: {
              'Accept': 'image/*,*/*;q=0.8',
              'Cache-Control': 'no-cache',
            },
            mode: 'cors',
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Verify it's actually an image
        if (!blob.type.startsWith('image/')) {
          throw new Error(`Invalid content type: ${blob.type}`);
        }

        console.log(`✅ Successfully fetched image on attempt ${attempt}:`, blob.type, blob.size);
        return new File([blob], filename, { type: blob.type });

      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error('All attempts failed to fetch image:', error);
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    
    return null;
  };

  // Alternative method: Convert image URL to base64 and then to File
  const urlToFileViaCanvas = async (url, filename) => {
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
              console.log('✅ Image converted via canvas:', file);
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
      
      // Add timestamp to bypass cache
      const urlWithCache = `${fixPollinationsUrl(url)}&t=${Date.now()}`;
      img.src = urlWithCache;
      
      // Timeout after 10 seconds
      setTimeout(() => {
        console.error('❌ Image load timeout');
        resolve(null);
      }, 10000);
    });
  };

  // Process tasks to API with enhanced image handling
  const processTasksToAPI = async (site) => {
    if (!site) {
      showNotification('error', t('PushToPlannerPopup.noSiteSelected') || 'No site selected');
      return;
    }

    if (tasks.length === 0) {
      showNotification('error', t('PushToPlannerPopup.noTasksToUpload') || 'No tasks to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      const siteId = site;
      const tasksIdsfromAI = [];
      
      // Create stations based on task complexity or default station
      const stationName = complexity ? `${complexity} Station` : 'AI Generated Station';
      let stationId;
      
      try {
        stationId = await insertStation(stationName, stationName, siteId, [], null, null);
        
        // Process each task
        for (const task of tasks) {
          let taskimage = null;
          
          // Handle image upload if task has picture_url
          if (task.picture_url) {
            try {
              console.log("🖼️ Processing image for task:", task.title);
              
              // Try multiple methods to get the image
              let imageFile = await urlToFile(task.picture_url, `ai_generated_image_${Date.now()}.png`);
              
              // If direct fetch failed, try canvas method
              if (!imageFile) {
                console.log("🔄 Trying canvas method...");
                imageFile = await urlToFileViaCanvas(task.picture_url, `ai_generated_image_${Date.now()}.png`);
              }
              
              if (imageFile) {
                console.log("📦 Uploading image file:", imageFile.name, imageFile.size);
                taskimage = await uploadFiles(imageFile, 'Task media/picture', siteId.nameInEnglish);
                console.log("✅ Image uploaded successfully:", taskimage);
              } else {
                console.log("⚠️ Could not process image, continuing without image");
              }
            } catch (error) {
              console.error('❌ Error processing image:', error);
              // Continue without image if upload fails
            }
          }

          // Convert estimatedTimeMinutes to seconds
          const estimatedTimeSeconds = (task.estimatedTimeMinutes || 1) * 60;

          const response = await insertTask(
            task.title,
            task.subtitle || '',
            [stationId.id],
            taskimage,
            null, // audio_url
            siteId.id,
            estimatedTimeSeconds,
            "{}",
            null,
            null,
            null,
            null,
            [{
              help_text: task.subtitle || task.title,
              UserID: "General"
            }]
          );
          
          tasksIdsfromAI.push(response.id);
          console.log(`✅ Task "${task.title}" created with ID: ${response.id}`);
        }

        showNotification('success', t('PushToPlannerPopup.tasksUploadedSuccessfully') || 'Tasks uploaded successfully');
      } catch (error) {
        console.error("Error inserting station or tasks:", error);
        showNotification('error', t('PushToPlannerPopup.errorUploadingTasks') || 'Error uploading tasks');
        return;
      }

      // Create route with uploaded tasks
      try {
        const routeName = `AI Route - ${new Date().toLocaleString()}`;
        
        const route = {
          name: routeName,
          studentIds: [],
          taskIds: tasksIdsfromAI,
          siteIds: [siteId.id],
        };
        
        console.log("📦 Inserting AI route:", route);
        await insertRoute(route);
        
        showNotification('success', t('PushToPlannerPopup.routeCreatedSuccessfully') || 'Route created successfully');
      } catch (error) {
        console.error("Error inserting route:", error);
        showNotification('error', t('PushToPlannerPopup.errorCreatingRoute') || 'Error creating route');
      }

      showNotification('success', t('PushToPlannerPopup.allDataUploadedSuccessfully') || 'All data uploaded successfully');
      
      // Close the main popup after successful upload
      onClose();
      
    } catch (error) {
      console.error("Error processing tasks:", error);
      showNotification('error', t('PushToPlannerPopup.errorProcessingTasks') || 'Error processing tasks');
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate total time
  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTimeMinutes, 0);
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `~${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `~${hours}h ${remainingMinutes}min` : `~${hours}h`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Push to Planner Dialog */}
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#2b2b2b",
            color: "white",
            direction: direction
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          borderBottom: "1px solid #4a4a4a"
        }}>
          <CloudUploadIcon sx={{ color: "#4a9eff" }} />
          {t('PushToPlannerPopup.pushToPlanner') || 'Push to Planner'}
          <IconButton 
            onClick={onClose}
            sx={{ 
              marginLeft: "auto", 
              color: "gray" 
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#4a9eff", mb: 2 }}>
              {t('PushToPlannerPopup.uploadSummary') || 'Upload Summary'}
            </Typography>
            
            <Paper sx={{ 
              bgcolor: "#3a3a3a", 
              p: 2, 
              borderRadius: 2,
              border: "1px solid #4a4a4a"
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {t('PushToPlannerPopup.totalTasks') || 'Total Tasks'}:
                </Typography>
                <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                  {tasks.length}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {t('PushToPlannerPopup.estimatedTime') || 'Estimated Time'}:
                </Typography>
                <Typography variant="body2" sx={{ color: "#4a9eff", fontWeight: "bold" }}>
                  {formatTime(totalTime)}
                </Typography>
              </Box>
              
              {complexity && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "gray" }}>
                    {t('PushToPlannerPopup.complexity') || 'Complexity'}:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#00e676", fontWeight: "bold" }}>
                    {complexity}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          <Typography variant="body2" sx={{ color: "#ccc", mb: 2, textAlign: "center" }}>
            {t('PushToPlannerPopup.selectSiteToUploadMessage') || 'Select a site to upload your AI-generated tasks and create a new route in the planner.'}
          </Typography>
          
          <Typography variant="caption" sx={{ color: "#ff6b35", fontStyle: "italic", display: "block", textAlign: "center" }}>
            {t('PushToPlannerPopup.uploadNote') || 'Note: This will create a new station and route with all your tasks.'}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2, gap: 1 }}>
          <Button 
            onClick={onClose}
            sx={{ color: "gray" }}
          >
            {t('PushToPlannerPopup.cancel') || 'Cancel'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
            onClick={handleOpenSitePopup}
            disabled={isUploading || tasks.length === 0}
            sx={{
              bgcolor: "#4a9eff",
              "&:hover": { bgcolor: "#3a8eef" },
              "&:disabled": {
                bgcolor: "#555",
                color: "#999"
              },
              minWidth: "160px"
            }}
          >
            {isUploading 
              ? (t('PushToPlannerPopup.uploading') || 'Uploading...') 
              : (t('PushToPlannerPopup.selectSiteAndUpload') || 'Select Site & Upload')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Site Selection Dialog */}
      <Dialog 
        open={sitePopupOpen} 
        onClose={handleCloseSitePopup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#2b2b2b",
            color: "white",
            direction: direction
          }
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          borderBottom: "1px solid #4a4a4a"
        }}>
          <BusinessIcon sx={{ color: "#4a9eff" }} />
          {t('PushToPlannerPopup.selectSite') || 'Select Site'}
          <IconButton 
            onClick={handleCloseSitePopup}
            sx={{ 
              marginLeft: "auto", 
              color: "gray" 
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {loadingSites ? (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              minHeight: "200px" 
            }}>
              <CircularProgress sx={{ color: "#4a9eff" }} />
            </Box>
          ) : (
            <List>
              {sites.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={t('PushToPlannerPopup.noSitesFound') || 'No sites found'}
                    sx={{ color: "gray", textAlign: "center" }}
                  />
                </ListItem>
              ) : (
                sites.map((site) => (
                  <ListItemButton
                    key={site.id}
                    onClick={() => handleSelectSite(site)}
                    sx={{
                      "&:hover": { bgcolor: "#3a3a3a" },
                      borderBottom: "1px solid #4a4a4a"
                    }}
                  >
                    <Avatar 
                      src={site.picture_url} 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        bgcolor: "#4a9eff"
                      }}
                    >
                      <BusinessIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: "white", fontWeight: "bold" }}>
                          {site.name}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>
                          {site.description || site.nameInEnglish}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2 }}>
          <Button 
            onClick={handleCloseSitePopup}
            sx={{ color: "gray" }}
          >
            {t('PushToPlannerPopup.cancel') || 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}