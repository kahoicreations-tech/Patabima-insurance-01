# PataBima App - Motor Vehicle Insurance Platform

A comprehensive React Native Expo application for PataBima insurance agents, featuring a complete motor vehicle insurance purchase flow from vehicle selection to policy issuance and payment processing.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
```

## ✨ Key Features

### Complete Motor Insurance Purchase Flow
- **7-Step Purchase Process**: Vehicle selection → Product selection → Policy details → Vehicle verification → Document upload → Payment → Confirmation
- **AKI Integration**: Real vehicle verification with existing cover detection
- **M-PESA Payments**: STK Push integration for seamless mobile payments
- **Document Upload**: Camera and gallery support for KYC documents
- **Dynamic Pricing**: Real-time premium calculation with detailed breakdown
- **Policy Issuance**: Instant policy generation with receipt

### Professional Mobile UI
- **Clickable Stepper**: Navigate between steps with visual progress indicator
- **PataBima Branding**: Consistent brand colors and typography
- **Mobile Optimized**: Safe area compliance and responsive design
- **Material Design**: Modern card-based UI with smooth animations

### Smart Features
- **Test Mode**: Pre-filled sample data for rapid testing
- **Form Validation**: Real-time validation with helpful error messages
- **Offline Support**: Local state management for uninterrupted flow
- **Error Handling**: Graceful handling of network and payment errors

## 📱 App Structure

```
PataBima App/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard with quick actions
│   │   ├── MotorQuotationScreen.js # Complete purchase flow
│   │   ├── QuotationsScreen.js     # Quotation management
│   │   ├── UpcomingScreen.js       # Renewals and extensions
│   │   └── MyAccountScreen.js      # Agent profile
│   ├── constants/
│   │   ├── Colors.js               # PataBima brand colors
│   │   ├── Typography.js           # Poppins font definitions
│   │   └── Layout.js               # Spacing and layout
│   └── navigation/
│       └── AppNavigator.js         # Tab navigation setup
├── assets/                         # Images and fonts
└── MOTOR_INSURANCE_FLOW.md        # Detailed feature documentation
```

## 📁 Enhanced Project Structure

The project has been reorganized for better maintainability and scalability:

```
PataBima-App/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button.js    # Reusable button component
│   │   │   ├── Card.js      # Card wrapper component
│   │   │   └── Input.js     # Form input component
│   │   ├── cards/           # Specific card components
│   │   │   ├── AgentSummaryCard.js
│   │   │   ├── CampaignCard.js
│   │   │   └── InsuranceCategoryCard.js
│   │   └── index.js         # Component exports
│   │
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   │   ├── SplashScreen.js
│   │   │   ├── InsuranceWelcomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── HomeScreen.js    # Main dashboard
│   │   ├── MotorQuotationScreen.js # Motor insurance flow
│   │   ├── QuotationsScreen.js
│   │   ├── UpcomingScreen.js
│   │   └── MyAccountScreen.js
│   │
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.js  # Auth & main app navigation
│   │   └── index.js
│   │
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.js   # Authentication state management
│   │
│   ├── services/            # API calls and external services
│   │   ├── api.js           # API service with all endpoints
│   │   └── index.js
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useData.js       # Data fetching hooks
│   │   ├── useFormValidation.js # Form validation hook
│   │   └── index.js
│   │
│   ├── utils/               # Helper functions
│   │   ├── helpers.js       # Utility functions
│   │   └── index.js
│   │
│   ├── constants/           # App constants
│   │   ├── Colors.js        # Color palette
│   │   ├── Typography.js    # Font styles
│   │   ├── Layout.js        # Layout constants
│   │   └── index.js
│   │
│   ├── config/              # Configuration files
│   │   └── constants.js     # App-wide configuration
│   │
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Type definitions
│
├── assets/                  # Static assets (images, fonts)
├── docs/                    # Documentation and reference files
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── MOTOR_INSURANCE_FLOW.md
│   ├── PartaBima Wireframe.pdf
│   └── [other documentation files]
├── App.js                   # Main app component
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🎨 Design System & Components

### Reusable Components
- **Button**: Multiple variants (primary, secondary, outline) with loading states
- **Card**: Flexible card wrapper with shadow and padding options
- **Input**: Form input with validation states and password toggle
- **AgentSummaryCard**: Dashboard summary with commission/sales data
- **CampaignCard**: Marketing campaign display with CTA buttons
- **InsuranceCategoryCard**: Insurance type selection cards

### Authentication Flow
- **Complete onboarding flow** with splash, welcome, login, signup screens
- **Demo authentication** for development and testing
- **Form validation** with real-time error feedback
- **Keyboard handling** with KeyboardAvoidingView

## 🔧 Development Utilities

### Custom Hooks
- **useQuotations**: Manage quotation data with CRUD operations
- **useRenewals**: Handle policy renewal data
- **useClaims**: Manage claims data with pagination
- **useFormValidation**: Form validation with custom rules

### Utility Functions
- **formatCurrency**: Currency formatting with abbreviation support
- **formatDate**: Flexible date formatting options
- **validateEmail/Phone**: Input validation helpers
- **debounce**: Performance optimization for search/input

### API Service Layer
- **Centralized API calls** with retry logic and error handling
- **Authentication management** with token handling
- **Endpoint organization** by feature (auth, quotations, policies, etc.)
- **Mock data support** for development

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (for testing)

### Installation
1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
1. Start the development server:
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

2. Scan the QR code with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app

### Using Components
```javascript
import { Button, Card, Input } from '../components';
import { AgentSummaryCard } from '../components/cards';

// Use in your screens
<Card>
  <Input 
    label="Phone Number"
    placeholder="Enter phone number"
    value={phone}
    onChangeText={setPhone}
  />
  <Button 
    title="Submit"
    onPress={handleSubmit}
    loading={isLoading}
  />
</Card>
```

### Using Hooks
```javascript
import { useQuotations, useFormValidation } from '../hooks';

const MyScreen = () => {
  const { quotations, loading, createQuotation } = useQuotations();
  const { values, errors, handleChange, validateForm } = useFormValidation(
    initialValues,
    validationRules
  );
  
  // Your component logic
};
```

### Using Services
```javascript
import { quotationsAPI, userAPI } from '../services';

// API calls
const quotations = await quotationsAPI.getQuotations();
const userProfile = await userAPI.getProfile();
```

## 📚 Documentation

For detailed feature documentation, see [MOTOR_INSURANCE_FLOW.md](./MOTOR_INSURANCE_FLOW.md)

---

**PataBima App** - Making insurance accessible, one policy at a time. 🚗✨

## AWS Integration (Planned)

- AWS Amplify for backend services
- AWS Cognito for authentication
- API Gateway for RESTful services
- DynamoDB for data storage
- S3 for file storage

## Contributing

1. Follow React Native best practices
2. Use functional components with hooks
3. Maintain consistent code formatting
4. Add proper error handling
5. Write descriptive commit messages

## Development Status

Current version includes:
- ✅ Basic navigation setup
- ✅ UI screens with mockup data
- ✅ Responsive design
- ✅ Color scheme and styling
- 🔄 AWS backend integration (in progress)
- 🔄 Real data integration (planned)
- 🔄 Authentication system (planned)

## License

This project is proprietary software for PataBima.

## Support

For development support or questions, contact the development team.
