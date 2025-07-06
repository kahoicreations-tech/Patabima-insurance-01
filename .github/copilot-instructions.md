# PataBima App - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React Native Expo application for PataBima, an insurance sales agent mobile app. The app helps insurance agents manage quotations, track commissions, view policies, and handle upcoming renewals and extensions.

## Technology Stack
- **Frontend**: React Native with Expo SDK 53
- **Navigation**: React Navigation v6 (Bottom Tabs + Native Stack)
- **Backend**: AWS (to be integrated)
- **UI Components**: React Native built-in components with custom styling
- **State Management**: React Context API (or Redux if needed later)

## App Features
Based on the wireframes and final implementation:
1. **Dashboard/Home**: 
   - Welcome section with agent greeting
   - Summary cards showing Sales, Production, Commission with white card styling
   - Insurance categories horizontal slider/carousel (Vehicle, Medical, WIBA, Last Expense)
   - Active campaigns horizontal slider with indicators and red CTA buttons
   - Upcoming summary section with renewals/extensions count and preview card
   - Claims section with search functionality and pill toggles (Pending/Processed)
2. **Quotations**: List and manage insurance quotations with policy details
3. **Upcoming**: Full detailed view of renewals and extensions
4. **My Account**: Agent profile, sales agent code, earnings, activity tracking

## Design Implementation
- **Brand Colors**: PataBima official colors (#D5222B red, #646767 gray)
- **Typography**: Poppins font family throughout the app
- **Layout**: Scrollable design with card-based UI components
- **UI Style**: Modern cards with rounded corners, shadows, and proper spacing
- **Interactive Elements**: Horizontal sliders, pill toggles, search functionality
- **Navigation**: Bottom tab navigation with proper padding to avoid device navigation overlap

## Development Guidelines
- Use functional components with React hooks
- Follow React Native best practices for performance
- Implement responsive design for different screen sizes
- Use TypeScript for better code quality and maintainability
- Follow Expo development workflow
- Structure components in a modular way
- Use proper error handling and loading states
- Implement proper navigation patterns

## Code Structure
- `/src/components` - Reusable UI components
- `/src/screens` - Screen components for each tab/page
- `/src/navigation` - Navigation configuration
- `/src/services` - API calls and business logic
- `/src/utils` - Helper functions and utilities
- `/src/constants` - App constants and configurations
- `/src/types` - TypeScript type definitions

## Styling Guidelines
- Use StyleSheet.create() for component styles
- Implement consistent color scheme and typography
- Use flexbox for layouts
- Follow material design principles for Android and iOS guidelines
- Ensure accessibility compliance

## AWS Integration Notes
- Prepare for AWS Amplify integration
- Plan for authentication (AWS Cognito)
- Design API structure for backend services
- Consider offline-first approach for better UX
