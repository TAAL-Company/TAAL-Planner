# TAAL Planner - Project Documentation

## Overview

TAAL Planner is a React-based web application designed to create and manage work routes for individuals with cognitive disabilities. The platform provides tools for cognitive assessment, route planning, task management, and AI-powered route generation.

**Project URL**: https://planner.taal.link/

## Table of Contents
- Project Structure
- Core Features
- Technology Stack
- Installation & Setup
- Key Components
- Data Models
- API Integration
- Internationalization
- File Structure

## Project Structure

The application follows a React-based architecture with the following main directories:

```
src/
├── Pages/           # Main application pages
├── components/      # Reusable components
├── api/            # API integration layer
├── Pictures/       # Static assets
├── redux/          # State management
├── state/          # Additional state management
├── Utility/        # Utility functions and providers
└── SpreadsheetTemplate/ # Template files
```

## Core Features

### 1. **Cognitive Assessment System**
- Comprehensive cognitive profiling with 340+ traits
- Categories include: Communication, Self-care, Technology & Money, Basic Learning, etc.
- Machine Learning integration for profile analysis
- Support for Hebrew and English assessments

### 2. **Route Planning & Management**
- Visual route builder with stations and tasks
- Task classification system (red/yellow/green difficulty levels)
- Intervention and alternative support options
- Real-time route execution on tablet interface

### 3. **AI-Powered Route Generation**
- Integration with multiple AI models (GPT, Claude, Flux)
- Natural language processing for Hebrew and English inputs
- Automated route structure generation
- Excel template support for bulk route creation

### 4. **Multi-Platform Support**
- Desktop editor interface
- Tablet execution interface
- Mobile-responsive design
- Real-time synchronization

### 5. **User Management**
- Worker profiles with cognitive assessments
- Role-based access control
- Site and route assignments
- Performance tracking

## Technology Stack

- **Frontend**: React 18+
- **Styling**: CSS3 with custom stylesheets
- **State Management**: Redux + React Context
- **UI Components**: Material-UI (@mui/x-license-pro)
- **Internationalization**: react-i18next
- **Analytics**: PostHog
- **File Processing**: CSV/Excel parsing
- **Image Processing**: Azure Blob Storage
- **Development**: Create React App

## Installation & Setup

1. **Clone the repository**
```bash
git clone [repository-url]
cd TAAL-Planner
```

2. **Install dependencies**
```bash
npm i
```

3. **Environment Setup**
Create a .env file with required configuration variables.

4. **Start development server**
```bash
npm start
```

## Key Components

### Pages

#### `FormPage`
- **Purpose**: Cognitive assessment and profile management
- **Key Files**: 
  - `Forms.js` - Main form interface
  - `cognitive.json` - Trait definitions
  - `cognitiveProfiles.json` - User profiles

#### `PlannerPage`
- **Purpose**: Route execution and task management
- **Key Files**:
  - `Tablet.js` - Tablet interface
  - `Modal_Student.js` - Worker information modal
  - `Modal_help.js` - Task assistance modal

#### `TaalAiPage`
- **Purpose**: AI-powered route generation
- **Key Files**:
  - `TextGenerative.js` - AI interface

### Core Components

#### Navigation & Layout
- `Nav` - Main navigation component
- `Toolbar` - Application toolbar

#### Data Management
- `SpreadsheetPopup` - Excel import functionality
- `PopupTable` - Data display tables

#### Utilities
- `TranslationProvider.js` - Internationalization support

## Data Models

### Cognitive Assessment Structure
```json
{
  "index": "number",
  "trait": "string (Hebrew description)",
  "requiredField": "boolean",
  "category": "string",
  "score": "1-5",
  "ML": "boolean (Machine Learning enabled)"
}
```

### User Profile Structure
```json
{
  "name": "string",
  "worker_id": "string",
  "mail": "string",
  "value": ["array of scores/responses"]
}
```

### Task Structure
```javascript
{
  id: "number",
  image: "image_reference",
  classification: "red|yellow|green",
  task: "string (Hebrew task description)",
  intervention: "string",
  Alternatives: "string",
  explaination: "string"
}
```

## API Integration

### Configuration
API configuration is managed through `config.js` and `api.js`.

### Key API Endpoints
- User authentication and management
- Cognitive profile CRUD operations
- Route and task management
- AI service integration

### Azure Integration
- Blob storage for images and media
- Integration handled through `azureBlob.js`

## Internationalization

The application supports multiple languages through `i18n.js`:
- **Hebrew** (primary)
- **English**
- **Arabic**

### Translation Structure
```javascript
{
  Language: {
    "key": "translated_text"
  },
  FormsErrors: {
    "validation_key": "error_message"
  }
}
```

## File Structure Details

### Templates
- `SpreadsheetTemplate/` - Contains CSV and Excel templates for route import in both Hebrew and English

### Assets
- `Pictures/` - Static assets including icons, logos, and UI elements
- SVG icons for various UI components
- Background images and branding assets

### State Management
- `redux/` - Redux store configuration
- `state/` - Additional state management utilities

## Development Guidelines

### Code Organization
- Components are organized by feature/page
- Reusable components are in the main `components/` directory
- Each major feature has its own subdirectory

### Styling
- CSS files are co-located with components
- Global styles in `index.css` and `App.css`

### Data Flow
- Redux for global state
- Local component state for UI interactions
- API calls handled through dedicated service layer

## License & Dependencies

The project uses MUI X Pro license for advanced data grid functionality. License configuration is handled in `TopSecret.js`.

## Analytics

PostHog integration for user analytics and performance tracking, initialized in `index.js`.

---

This documentation provides an overview of the TAAL Planner project structure and core functionality. For specific implementation details, refer to the individual component files and their inline documentation.