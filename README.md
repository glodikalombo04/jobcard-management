New repo created where additional features will be added, tested and then implemetned on the main branch.

Initial push is for the creation of a Stock Take feature, where our regional managers will be able to login and quickly complete their weekly stock takes which have historically been an issue.


# JobCard Management System

A comprehensive job card management application built with Django REST Framework and React.

## Features

- ✅ Paginated job card listing (25 items per page)
- ✅ Global search across all columns
- ✅ Column-specific filtering with dropdowns
- ✅ "Load All Data" feature for bulk operations
- ✅ CSV export functionality for filtered data
- ✅ Professional toast notifications
- ✅ Smooth table animations
- ✅ Create, Read, Update operations
- ✅ Customer creation modal
- ✅ Responsive UI/UX

## Installation

### Backend
```bash
cd aftech_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd aftech_frontend
npm install
npm run dev
```

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open http://localhost:5173 in your browser
4. Create, search, filter, and export job cards

## Technologies

- **Backend**: Django, Django REST Framework
- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **API Communication**: Fetch API
- **UI Components**: React Select, React Toastify
- **Data Export**: file-saver

## License

MIT License