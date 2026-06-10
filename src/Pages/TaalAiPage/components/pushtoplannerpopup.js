import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../components/Notification/NotificationProvider";
// Import API functions
import { insertSite, insertStation, insertTask, insertRoute, uploadFiles, getingData_Places, generateAzureImage } from "../../../api/api";
// Import child dialogs
import MainPushToPlannerDialog from "./MainPushToPlannerDialog";
import SiteSelectionDialog from "./SiteSelectionDialog";
import CreateSiteDialog from "./CreateSiteDialog";

export default function PushToPlannerPopup({
  isOpen,
  onClose,
  tasks,
  complexity,
  direction,
  onRouteCreated,
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    setIsGeneratingImage(false);
  };

  const handleOpenCreateSitePopup = () => {
    setCreateSiteOpen(true);
  };

  const handleCloseCreateSitePopup = () => {
    setCreateSiteOpen(false);
    setIsCreatingSite(false);
    resetCreateSiteForm();
  };

  // Generate image for site using Azure OpenAI
  const handleGenerateSiteImage = async () => {
    const prompt = newSiteName.trim() || newSiteNameEn.trim();
    if (!prompt) {
      showNotification('error', t('PushToPlannerPopup.enterSiteNameFirst') || 'Please enter a site name first');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const fullPrompt = `A professional photo of ${prompt}, high quality, detailed, realistic`;
      const imageUrl = await generateAzureImage(fullPrompt, {
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      });
      
      // Fetch the generated image and convert to File
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch generated image');
      }
      
      const blob = await response.blob();
      const fileName = `${prompt.replace(/[^a-zA-Z0-9]/g, '_')}_generated.png`;
      const file = new File([blob], fileName, { type: blob.type || 'image/png' });
      
      setNewSiteImageFile(file);
      showNotification('success', t('PushToPlannerPopup.imageGenerated') || 'Image generated successfully');
    } catch (error) {
      console.error('Error generating image:', error);
      showNotification('error', t('PushToPlannerPopup.errorGeneratingImage') || 'Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
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
              let imageFile = await urlToFile(task.picture_url, `AI_${task.title}.png`);

              // If direct fetch failed, try canvas method
              if (!imageFile) {
                console.log("🔄 Trying canvas method...");
                imageFile = await urlToFileViaCanvas(task.picture_url, `AI_${task.title}.png`);
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
        const createdRoute = await insertRoute(route);
        if (onRouteCreated && createdRoute?.id) {
          onRouteCreated(createdRoute.id, finalRouteName);
        }
        
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

  if (!isOpen) return null;

  return (
    <>
      {/* Main Push to Planner Dialog */}
      <MainPushToPlannerDialog
        isOpen={isOpen}
        onClose={onClose}
        tasks={tasks}
        complexity={complexity}
        direction={direction}
        routeName={routeName}
        onRouteNameChange={setRouteName}
        suggestedRouteName={suggestedRouteName}
        isRouteNameValid={isRouteNameValid}
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        onOpenSitePopup={handleOpenSitePopup}
      />

      {/* Site Selection Dialog */}
      <SiteSelectionDialog
        open={sitePopupOpen}
        onClose={handleCloseSitePopup}
        sites={sites}
        filteredSites={filteredSites}
        loadingSites={loadingSites}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectSite={handleSelectSite}
        onOpenCreateSite={handleOpenCreateSitePopup}
        isUploading={isUploading}
        direction={direction}
      />

      {/* Create Site Dialog */}
      <CreateSiteDialog
        open={createSiteOpen}
        onClose={handleCloseCreateSitePopup}
        isCreating={isCreatingSite}
        siteName={newSiteName}
        onSiteNameChange={setNewSiteName}
        siteNameEn={newSiteNameEn}
        onSiteNameEnChange={setNewSiteNameEn}
        siteDescription={newSiteDescription}
        onSiteDescriptionChange={setNewSiteDescription}
        siteImageFile={newSiteImageFile}
        onSiteImageFileChange={setNewSiteImageFile}
        isGeneratingImage={isGeneratingImage}
        onGenerateImage={handleGenerateSiteImage}
        isValid={isNewSiteValid}
        onCreateSite={handleCreateSite}
        direction={direction}
      />
    </>
  );
}