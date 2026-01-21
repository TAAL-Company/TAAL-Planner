import React, { useState, useEffect, useMemo } from "react";
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
  Paper,
  TextField,
  InputAdornment,
  LinearProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../components/Notification/NotificationProvider";
// Import API functions
import { insertSite, insertStation, insertTask, insertRoute, uploadFiles, getingData_Places } from "../../../api/api";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Site selection popup states
  const [sitePopupOpen, setSitePopupOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loadingSites, setLoadingSites] = useState(false);

  // NEW: Create site popup states
  const [createSiteOpen, setCreateSiteOpen] = useState(false);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteNameEn, setNewSiteNameEn] = useState("");
  const [newSiteDescription, setNewSiteDescription] = useState("");
  const [newSiteImageFile, setNewSiteImageFile] = useState(null);

  // NEW: Route name state (required)
  const [routeName, setRouteName] = useState("");
  const suggestedRouteName = useMemo(
    () => `AI Route - ${new Date().toLocaleString()}`,
    []
  );
  const isRouteNameValid = routeName.trim().length > 0;

  // NEW: search state
  const [searchTerm, setSearchTerm] = useState("");

  // NEW: memoized filtered sites
  const filteredSites = useMemo(() => {
    if (!searchTerm?.trim()) return sites;
    const q = searchTerm.trim().toLowerCase();
    return sites.filter((s) => {
      const hay = `${s?.name || ""} ${s?.description || ""} ${s?.nameInEnglish || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sites, searchTerm]);

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
    // Require route name before continuing
    if (!routeName.trim()) {
      showNotification('error', t('PushToPlannerPopup.routeNameRequired') || 'Please enter a route name');
      return;
    }
    setSitePopupOpen(true);
    setSearchTerm(""); // reset search each time
    loadSites();
  };

  // Close site selection popup
  const handleCloseSitePopup = () => {
    setSitePopupOpen(false);
    setSelectedSite(null);
  };

  const resetCreateSiteForm = () => {
    setNewSiteName("");
    setNewSiteNameEn("");
    setNewSiteDescription("");
    setNewSiteImageFile(null);
  };

  const handleOpenCreateSitePopup = () => {
    setCreateSiteOpen(true);
  };

  const handleCloseCreateSitePopup = () => {
    setCreateSiteOpen(false);
    setIsCreatingSite(false);
    resetCreateSiteForm();
  };

  // Select site and start upload process
  const handleSelectSite = (site) => {
    setSelectedSite(site);
    handleCloseSitePopup();
    processTasksToAPI(site);
  };

  const isNewSiteValid = newSiteName.trim().length > 0 && newSiteNameEn.trim().length > 0;

  const toSafeAzureKey = (value) => {
    return (value || "")
      .toString()
      .trim()
      .replace(/%/g, "")
      .replace(/[\\/]/g, "-");
  };

  const handleCreateSite = async () => {
    if (!isNewSiteValid) {
      showNotification('error', t('PushToPlannerPopup.siteNameRequired') || 'Please enter site name and English name');
      return;
    }

    setIsCreatingSite(true);
    try {
      let pictureUrl = null;
      if (newSiteImageFile) {
        try {
          const siteKey = toSafeAzureKey(newSiteNameEn || newSiteName);
          pictureUrl = await uploadFiles(newSiteImageFile, 'Site media/picture', siteKey);
        } catch (e) {
          console.error('Error uploading site image:', e);
          showNotification('error', t('PushToPlannerPopup.errorUploadingSiteImage') || 'Failed to upload site image (continuing without image)');
        }
      }

      const siteObj = {
        name: newSiteName.trim(),
        nameInEnglish: newSiteNameEn.trim(),
        description: newSiteDescription.trim(),
        picture_url: pictureUrl,
        studentIds: [],
        editorIds: [],
        taskIds: [],
        routeIds: [],
        stationIds: [],
      };

      const created = await insertSite(siteObj);
      showNotification('success', t('PushToPlannerPopup.siteCreatedSuccessfully') || 'Site created successfully');

      setCreateSiteOpen(false);
      resetCreateSiteForm();

      await loadSites();

      if (created) {
        handleSelectSite(created);
      }
    } catch (error) {
      console.error('Error creating site:', error);
      showNotification('error', t('PushToPlannerPopup.errorCreatingSite') || 'Error creating site');
    } finally {
      setIsCreatingSite(false);
    }
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

  // NEW: Derive a station name from AI tasks (with sane fallbacks)
  const getAiStationName = (aiTasks, routeNameInput, complexityInput) => {
    const candidates = [];

    for (const t of aiTasks || []) {
      // common possible keys from AI output
      if (t.stationName) candidates.push(t.stationName);
      if (t.station) candidates.push(t.station);
      if (t.location) candidates.push(t.location);
      if (t.topic) candidates.push(`${t.topic} Station`);
    }

    const normalized = candidates
      .map((s) => (s || "").toString().trim())
      .filter(Boolean);

    if (normalized.length) {
      // pick the most frequent candidate
      const counts = normalized.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      const top = normalized.sort((a, b) => {
        const diff = counts[b] - counts[a];
        return diff !== 0 ? diff : a.length - b.length;
      })[0];
      return top;
    }

    if (routeNameInput?.trim()) return `${routeNameInput.trim()} - Station`;
    if (complexityInput?.trim()) return `${complexityInput.trim()} Station`;
    return "AI Generated Station";
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

    const finalRouteName = routeName.trim();
    if (!finalRouteName) {
      showNotification('error', t('PushToPlannerPopup.routeNameRequired') || 'Please enter a route name');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(t('PushToPlannerPopup.preparingUpload') || 'Preparing upload...');
    
    try {
      const siteId = site;
      const tasksIdsfromAI = [];
      
      // Calculate total steps for progress: stations + tasks + route creation
      const totalTasks = tasks.length;
      const stationNames = [...new Set(tasks.map(task => task.station || task.stationName || 'AI Generated Station'))];
      const totalSteps = stationNames.length + totalTasks + 1; // stations + tasks + route
      let completedSteps = 0;
      
      try {
        // Create stations based on task.station (with fallbacks)
        const defaultStationName = getAiStationName(tasks, finalRouteName, complexity);
        const normalizedTasks = (tasks || []).map((task) => {
          const station = (task?.station || task?.stationName || defaultStationName || 'AI Generated Station')
            .toString()
            .trim();
          return {
            ...task,
            station: station || (defaultStationName || 'AI Generated Station')
          };
        });

        const tasksByStation = groupBy(normalizedTasks, 'station');
        const stationIdsByName = {};

        setUploadStatus(t('PushToPlannerPopup.creatingStations') || 'Creating stations...');
        for (const stationName of Object.keys(tasksByStation)) {
          const createdStation = await insertStation(stationName, stationName, siteId, [], null, null);
          stationIdsByName[stationName] = createdStation;
          completedSteps++;
          setUploadProgress(Math.round((completedSteps / totalSteps) * 100));
        }

        // Process each task (assigned to its station)
        setUploadStatus(t('PushToPlannerPopup.uploadingTasks') || 'Uploading tasks...');
        for (const task of normalizedTasks) {
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
          const stationForTask = stationIdsByName[task.station];

          const response = await insertTask(
            task.title,
            task.subtitle || '',
            [stationForTask.id],
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
          completedSteps++;
          setUploadProgress(Math.round((completedSteps / totalSteps) * 100));
          setUploadStatus(t('PushToPlannerPopup.uploadingTaskProgress', { current: completedSteps - stationNames.length, total: totalTasks }) || `Uploading task ${completedSteps - stationNames.length}/${totalTasks}...`);
          console.log(`✅ Task "${task.title}" created with ID: ${response.id}`);
        }

        // showNotification('success', t('PushToPlannerPopup.tasksUploadedSuccessfully') || 'Tasks uploaded successfully');
      } catch (error) {
        console.error("Error inserting station or tasks:", error);
        showNotification('error', t('PushToPlannerPopup.errorUploadingTasks') || 'Error uploading tasks');
        return;
      }

      // Create route with uploaded tasks
      try {
        setUploadStatus(t('PushToPlannerPopup.creatingRoute') || 'Creating route...');
        // Use user-provided route name
        const route = {
          name: finalRouteName,
          studentIds: [],
          taskIds: tasksIdsfromAI,
          siteIds: [siteId.id],
        };
        
        console.log("📦 Inserting AI route:", route);
        await insertRoute(route);
        
        completedSteps++;
        setUploadProgress(100);
        setUploadStatus(t('PushToPlannerPopup.completed') || 'Completed!');
        
        // showNotification('success', t('PushToPlannerPopup.routeCreatedSuccessfully') || 'Route created successfully');
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
      setUploadProgress(0);
      setUploadStatus('');
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

          {/* NEW: Route Name input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              required
              label={t('PushToPlannerPopup.routeName') || 'Route Name'}
              placeholder={t('PushToPlannerPopup.routeNamePlaceholder') || suggestedRouteName}
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              inputProps={{ maxLength: 100 }}
              sx={{
                bgcolor: "#3a3a3a",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4a4a4a" },
                  "&:hover fieldset": { borderColor: "#6a6a6a" },
                }
              }}
              helperText={
                !isRouteNameValid
                  ? (t('PushToPlannerPopup.routeNameRequired') || 'Please enter a route name')
                  : " "
              }
              FormHelperTextProps={{ sx: { color: !isRouteNameValid ? "#ff6b35" : "#2b2b2b" } }}
            />
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
            disabled={isUploading || tasks.length === 0 || !isRouteNameValid}
            sx={{
              bgcolor: "#4a9eff",
              "&:hover": { bgcolor: "#3a8eef" },
              "&:disabled": {
                bgcolor: "#555",
                color: "#999"
              },
              minWidth: "160px",
              flexDirection: 'column',
              py: isUploading ? 1 : undefined
            }}
          >
            {isUploading 
              ? (
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {uploadStatus} {uploadProgress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      width: '100%', 
                      height: 4, 
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 2,
                      }
                    }} 
                  />
                </Box>
              )
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
          {/* Search bar */}
          <Box sx={{ p: 2, borderBottom: "1px solid #4a4a4a", position: "sticky", top: 0, bgcolor: "#2b2b2b", zIndex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('PushToPlannerPopup.searchSites') || 'Search sites'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon sx={{ color: "#aaa" }} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              sx={{
                bgcolor: "#3a3a3a",
                input: { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4a4a4a" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6a6a6a" }
              }}
            />
            <Typography variant="caption" sx={{ color: "#aaa", mt: 1, display: "block" }}>
              {loadingSites
                ? (t('PushToPlannerPopup.loadingSites') || 'Loading sites...')
                : `${filteredSites.length} ${(t('PushToPlannerPopup.results') || 'results')}`
              }
            </Typography>
          </Box>

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
              {filteredSites.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={t('PushToPlannerPopup.noSitesFound') || 'No sites found'}
                    sx={{ color: "gray", textAlign: "center" }}
                  />
                </ListItem>
              ) : (
                filteredSites.map((site) => {
                  return (
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
                          <Typography sx={{ color: "#ccc", fontSize: "0.95rem" }}>
                            {site.description || site.nameInEnglish}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateSitePopup}
            disabled={loadingSites || isUploading}
            sx={{
              borderColor: "#4a9eff",
              color: "#4a9eff",
              mr: "auto",
              "&:hover": { borderColor: "#3a8eef", bgcolor: "rgba(74, 158, 255, 0.08)" },
              "&:disabled": { borderColor: "#555", color: "#777" }
            }}
          >
            {t('PushToPlannerPopup.createSite') || 'Create Site'}
          </Button>
          <Button 
            onClick={handleCloseSitePopup}
            sx={{ color: "gray" }}
          >
            {t('PushToPlannerPopup.cancel') || 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Site Dialog */}
      <Dialog
        open={createSiteOpen}
        onClose={handleCloseCreateSitePopup}
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
          <AddIcon sx={{ color: "#4a9eff" }} />
          {t('PushToPlannerPopup.createSiteTitle') || 'Create Site'}
          <IconButton
            onClick={handleCloseCreateSitePopup}
            sx={{ marginLeft: "auto", color: "gray" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              required
              label={t('PushToPlannerPopup.siteName') || 'Site Name'}
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              sx={{
                bgcolor: "#3a3a3a",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4a4a4a" },
                  "&:hover fieldset": { borderColor: "#6a6a6a" },
                }
              }}
            />

            <TextField
              fullWidth
              required
              label={t('PushToPlannerPopup.siteNameEnglish') || 'Site Name (English)'}
              value={newSiteNameEn}
              onChange={(e) => setNewSiteNameEn(e.target.value)}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              sx={{
                bgcolor: "#3a3a3a",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4a4a4a" },
                  "&:hover fieldset": { borderColor: "#6a6a6a" },
                }
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label={t('PushToPlannerPopup.siteDescription') || 'Description'}
              value={newSiteDescription}
              onChange={(e) => setNewSiteDescription(e.target.value)}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              sx={{
                bgcolor: "#3a3a3a",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#4a4a4a" },
                  "&:hover fieldset": { borderColor: "#6a6a6a" },
                }
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: "#4a4a4a",
                  color: "#ccc",
                  "&:hover": { borderColor: "#6a6a6a", bgcolor: "rgba(255,255,255,0.04)" },
                }}
              >
                {newSiteImageFile
                  ? (t('PushToPlannerPopup.changePicture') || 'Change picture')
                  : (t('PushToPlannerPopup.uploadPicture') || 'Upload picture')}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setNewSiteImageFile(file || null);
                  }}
                />
              </Button>

              {newSiteImageFile && (
                <>
                  <Typography variant="body2" sx={{ color: "#aaa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {newSiteImageFile.name}
                  </Typography>
                  <IconButton size="small" onClick={() => setNewSiteImageFile(null)}>
                    <ClearIcon sx={{ color: "#aaa" }} />
                  </IconButton>
                </>
              )}
            </Box>

            {!isNewSiteValid && (
              <Typography variant="caption" sx={{ color: "#ff6b35" }}>
                {t('PushToPlannerPopup.siteNameRequired') || 'Site name and English name are required'}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #4a4a4a", p: 2, gap: 1 }}>
          <Button onClick={handleCloseCreateSitePopup} sx={{ color: "gray" }}>
            {t('PushToPlannerPopup.cancel') || 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSite}
            disabled={isCreatingSite || !isNewSiteValid}
            startIcon={isCreatingSite ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: "#4a9eff",
              "&:hover": { bgcolor: "#3a8eef" },
              "&:disabled": { bgcolor: "#555", color: "#999" },
              minWidth: "140px"
            }}
          >
            {isCreatingSite
              ? (t('PushToPlannerPopup.creating') || 'Creating...')
              : (t('PushToPlannerPopup.create') || 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}