# Road Infrastructure Tracker for Mahendragarh

A centralized dashboard for tracking road infrastructure development in Mahendragarh with standardized IDs and comprehensive metadata tracking.

![Road Infra Tracker Screenshot](https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600)

## Overview

The Mahendragarh Road Infrastructure Tracker was developed to solve coordination challenges in road infrastructure work due to inconsistent road naming and the lack of a centralized registry. This application provides a comprehensive solution with standardized road IDs and detailed metadata tracking for all infrastructure projects.

## Key Features

- **Standardized Road Registry**: Assign unique identifiers to roads with consistent naming conventions
- **Infrastructure Project Tracking**: Tag works with metadata (vendor, cost, timeline, progress)
- **Vendor Management**: Track all contractors and their performance
- **Ward-based Filtering**: Organize and filter data by ward/region
- **Progress Reporting**: Generate visual reports on project status and budgets
- **Activity Logging**: Keep a detailed log of all system activities

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, Node.js
- **Data Management**: In-memory database with TypeScript interfaces
- **Charting**: Recharts for interactive data visualization
- **State Management**: React Query for server state

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```
   https://github.com/sidgureja7803/RoadInfraTracker.git
   cd road-infra-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
├── client              # Frontend React application
│   ├── components      # Reusable UI components
│   ├── hooks           # Custom React hooks
│   ├── lib             # Utility functions and API client
│   └── pages           # Application pages
├── server              # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data storage implementation
│   └── vite.ts         # Vite server configuration
└── shared              # Shared code between client and server
    └── schema.ts       # Data models and validation schemas
```

## Data Model

The application uses the following primary data entities:

- **Roads**: Unique road identifiers, physical characteristics, and location
- **Vendors**: Contractors who carry out infrastructure projects
- **Projects**: Infrastructure works with budget, timeline, and progress tracking
- **Wards**: Administrative divisions of Mahendragarh
- **Activities**: System events for auditing and tracking changes

## Usage Guide

### Dashboard

The dashboard provides an at-a-glance view of:
- Total roads in the registry
- Active infrastructure projects
- Total allocated budget
- Vendor statistics
- Recent project activities

### Road Registry

Manage all roads in the system with standardized identifiers:
- Add new roads with unique IDs
- Record physical characteristics (length, width)
- Map roads to their respective wards

### Infrastructure Projects

Track all infrastructure development projects:
- Create new projects with road assignments
- Monitor project progress and status
- Update project completion percentage
- Track budgets and timelines

### Vendor Management

Maintain a database of all contractors:
- Add new vendors with contact information
- Track vendor performance
- Monitor vendor project history
- Calculate total budget allocation per vendor

### Reports

Generate visual reports for decision making:
- Project status distribution
- Budget allocation by ward
- Timeline analysis
- Vendor performance metrics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Developed for Mahendragarh Municipal Council
- Inspired by the need for better infrastructure project coordination
- Uses [Shadcn/UI](https://ui.shadcn.com/) for component library
- Built with [React](https://reactjs.org/) and [Express](https://expressjs.com/)