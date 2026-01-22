import React from "react";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";

export default function SiteSelectionDialog({
  open,
  onClose,
  sites,
  filteredSites,
  loadingSites,
  searchTerm,
  onSearchChange,
  onSelectSite,
  onOpenCreateSite,
  isUploading,
  direction
}) {
  const { t } = useTranslation();

  return (
    <Dialog 
      open={open} 
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
        <BusinessIcon sx={{ color: "#4a9eff" }} />
        {t('PushToPlannerPopup.selectSite') || 'Select Site'}
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
      
      <DialogContent sx={{ p: 0 }}>
        {/* Search bar */}
        <Box sx={{ p: 2, borderBottom: "1px solid #4a4a4a", position: "sticky", top: 0, bgcolor: "#2b2b2b", zIndex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('PushToPlannerPopup.searchSites') || 'Search sites'}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#aaa" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange("")}>
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
                    onClick={() => onSelectSite(site)}
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
          onClick={onOpenCreateSite}
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
          onClick={onClose}
          sx={{ color: "gray" }}
        >
          {t('PushToPlannerPopup.cancel') || 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
