# FormsPage Module

## Overview
The FormsPage module is a fully refactored, modular React application for managing various forms and performance data. It follows a clean architecture pattern with separated concerns for different data domains.

## Project Structure

```
FormsPage/
├── i18n.js                          # Internationalization (i18n) translations
├── index.js                         # Main export file
├── FormsPage.js                     # Main component orchestrating all tables
├── FormsPage.css                    # Styling for the main page
│
├── flags/                           # Flags (Task Classification) Package
│   ├── FlagsTable.js               # Main table component for flags
│   ├── FlagsColumns.js             # Column definitions
│   ├── FlagsRows.js                # Row data management
│   ├── FlagsDialog.js              # Edit dialog for flags
│   └── Status.js                   # Status badge component
│
├── personalinfo/                    # Personal Information Package
│   ├── PersonalInfoTable.js        # Main table component
│   ├── PersonalInfoColumns.js      # Column definitions
│   └── PersonalInfoRows.js         # Row data management
│
├── taskperformanceinfo/             # Task Performance Info (Cognitive Profile) Package
│   ├── TaskPerformanceTable.js     # Main table component
│   ├── TaskPerformanceColumns.js   # Column definitions
│   └── TaskPerformanceRows.js      # Row data management
│
├── taskability/                     # Task Ability (Task Requirements) Package
│   ├── TaskAbilityTable.js         # Main table component
│   ├── TaskAbilityColumns.js       # Column definitions
│   └── TaskAbilityRows.js          # Row data management
│
└── generalperformanceinfo/          # General Performance Info (Cognitive Abilities) Package
    ├── GeneralPerformanceTable.js  # Main table component
    ├── GeneralPerformanceColumns.js # Column definitions
    └── GeneralPerformanceRows.js   # Row data management
```

## Package Descriptions

### 1. Flags Package
**Purpose:** Manages task classification and interventions for workers on specific routes.

**Key Features:**
- Display tasks with color-coded classifications (green, yellow, red)
- Edit interventions and alternatives for tasks
- Show task ability requirements
- User and route selection

**Components:**
- `FlagsTable.js` - Main table with DataGrid
- `FlagsColumns.js` - Column configuration including actions
- `FlagsRows.js` - Row data transformation
- `FlagsDialog.js` - Modal for editing flag details
- `Status.js` - Colored status badge component

### 2. Personal Info Package
**Purpose:** Displays personal information and employment history of workers.

**Key Features:**
- Basic personal information (name, contact, photo)
- Employment history
- Training records
- System-integrated data fields

**Components:**
- `PersonalInfoTable.js` - Main table component
- `PersonalInfoColumns.js` - Column definitions
- `PersonalInfoRows.js` - Static row data generation

### 3. Task Performance Info Package
**Purpose:** Manages cognitive profiles for individual workers.

**Key Features:**
- Display cognitive abilities for selected worker
- Editable grade fields (A-F scale)
- Save cognitive profile data
- ML factor indicators

**Components:**
- `TaskPerformanceTable.js` - Main table with editing capabilities
- `TaskPerformanceColumns.js` - Column definitions with editable fields
- `TaskPerformanceRows.js` - Row generation from cognitive data

### 4. Task Ability Package
**Purpose:** Displays cognitive requirements for tasks in a selected route.

**Key Features:**
- Route-based task listing
- Dynamic columns based on cognitive abilities
- Shows cognitive requirement values per task
- Task-specific cognitive profiles

**Components:**
- `TaskAbilityTable.js` - Main table with route selection
- `TaskAbilityColumns.js` - Dynamic column generation
- `TaskAbilityRows.js` - Task data transformation

### 5. General Performance Info Package
**Purpose:** Displays all available cognitive abilities in the system.

**Key Features:**
- Complete list of cognitive traits
- Required field indicators
- Category groupings
- ML relevance flags

**Components:**
- `GeneralPerformanceTable.js` - Main table component
- `GeneralPerformanceColumns.js` - Column definitions
- `GeneralPerformanceRows.js` - Row data transformation

## i18n (Internationalization)

The `i18n.js` file contains all text strings used throughout the application in both Hebrew (he) and English (en).

**Usage:**
```javascript
import { getTranslation } from '../i18n';

const t = (key) => getTranslation(key, language);
const translatedText = t('flags'); // Returns 'דגלים' (he) or 'Flags' (en)
```

**Features:**
- Complete Hebrew and English translations
- Placeholder support for dynamic content
- Centralized text management
- Easy to extend with new languages

## Main Component (FormsPage.js)

The main `FormsPage` component orchestrates all sub-modules:

**Responsibilities:**
- Fetch and manage global data (users, tasks, routes, abilities)
- Handle language switching (Hebrew ⇄ English)
- Navigate between different table views
- Provide shared state to child components
- Display loading states

**State Management:**
- `allUsers` - All user data
- `allTasks` - All task data
- `allRoutes` - All route data
- `cognitiveAbillities` - All cognitive abilities
- `worker` - Currently selected worker
- `language` - Current language (hebrew/english)
- `selectedTable` - Active table view

## Key Features

### 1. Bilingual Support
- Complete Hebrew and English translations
- RTL (Right-to-Left) support for Hebrew
- Language toggle button
- Direction-aware UI components

### 2. Modular Architecture
- Each package is self-contained
- Clean separation of concerns
- Reusable components
- Easy to maintain and extend

### 3. Material-UI DataGrid
- Sortable columns
- Pagination
- Custom styling
- Editable cells
- Action menus

### 4. API Integration
All components integrate with backend APIs:
- `getingData_Users()` - Fetch users
- `getingData_Tasks()` - Fetch tasks
- `getingData_Routes()` - Fetch routes
- `getCognitiveAbillities()` - Fetch cognitive abilities
- `getCognitiveProfile()` - Fetch user's cognitive profile
- `postDataCognitiveProfile()` - Save cognitive profile
- `updateDataCognitiveProfile()` - Update cognitive profile
- `getingDataFlags()` - Fetch evaluation flags
- `postEvaluation()` - Run evaluation algorithm
- And more...

### 5. Responsive Design
- Mobile-friendly layout
- Flexible table widths
- Responsive navigation
- Touch-friendly buttons

## Usage

### Basic Import
```javascript
import { FormsPage } from './Pages/FormsPage';

function App() {
  return <FormsPage />;
}
```

### Individual Table Import
```javascript
import { FlagsTable } from './Pages/FormsPage';

function MyComponent() {
  return (
    <FlagsTable
      language="he"
      allUsers={users}
      allRoutes={routes}
      worker={selectedWorker}
      setWorker={setSelectedWorker}
      cognitiveList={cognitiveAbilities}
      taskAbilityLists={taskAbilities}
      setTaskAbilityList={setTaskAbilities}
    />
  );
}
```

## API Dependencies

The FormsPage relies on the following API endpoints (from `../../api/api.js`):

- `getingData_Users()`
- `getingData_Tasks()`
- `getingData_Routes()`
- `getingData_Places()`
- `getCognitiveAbillities()`
- `getCognitiveProfile(workerId)`
- `postDataCognitiveProfile(workerId, values)`
- `updateDataCognitiveProfile(values, workerId)`
- `getAllCognitiveProfiles()`
- `getAllTaskCognitiveRequirements()`
- `gettaskCognitiveRequirements(taskId)`
- `getingDataFlags()`
- `postEvaluation(studentIds, taskIds)`
- `postEvaluationEvents(workerId, taskId, evaluation)`

## Styling

All components use Material-UI's `sx` prop for styling, with additional CSS in `FormsPage.css`.

**Theme Colors:**
- Primary: `#114260` (Dark Blue)
- Background: `#F5F5F5` (Light Gray)
- Hover: `#EDF3F8` (Light Blue-Gray)
- White: `#FFFFFF`

## Best Practices Followed

1. **Component Separation**: Each package has separate files for columns, rows, and main table
2. **i18n Integration**: All user-facing strings use translation keys
3. **PropTypes/TypeScript**: Ready for TypeScript migration
4. **Reusability**: Components are designed to be reusable
5. **Clean Code**: Follows React best practices and hooks patterns
6. **Error Handling**: Proper try-catch blocks and error states
7. **Loading States**: Loading indicators for async operations
8. **Consistent Naming**: Clear, descriptive naming conventions

## Future Enhancements

Potential improvements:
1. Add TypeScript for type safety
2. Implement unit tests for each component
3. Add data export functionality
4. Implement advanced filtering
5. Add print functionality
6. Create reusable form components
7. Add validation schemas
8. Implement undo/redo functionality
9. Add audit logging
10. Improve accessibility (ARIA labels)

## Migration from Old Code

This refactored codebase replaces the monolithic `Forms.js` (2939 lines) with a modular structure:

**Before:**
- Single 2939-line file
- Mixed concerns
- Hardcoded strings
- Difficult to maintain

**After:**
- Modular packages (~200-400 lines each)
- Separated concerns
- i18n support
- Easy to maintain and extend

## Contributing

When adding new features:
1. Follow the existing package structure
2. Add translations to `i18n.js`
3. Keep components focused and single-purpose
4. Use Material-UI components consistently
5. Maintain RTL support for Hebrew
6. Test with both languages
7. Document new components

## Support

For issues or questions, refer to the main project documentation or contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** TAAL Development Team
