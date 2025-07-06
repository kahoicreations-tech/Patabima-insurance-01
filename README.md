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

## 🛠 Technologies

- **React Native** with Expo SDK 53
- **React Navigation v6** for navigation
- **Poppins Font** for typography
- **Document Picker** for file uploads
- **Image Picker** for camera integration
- **React Native Paper** for enhanced UI components

## 📋 Motor Insurance Flow Steps

1. **Vehicle Category**: Select from Private, Commercial, PSV, Motorcycle, TukTuk, Special Classes
2. **Insurance Product**: Choose Third Party or Comprehensive coverage
3. **Policy Details**: Personal info, duration, insurer selection
4. **Vehicle Verification**: AKI lookup with existing cover detection
5. **Document Upload**: ID, Logbook, KRA PIN with camera/gallery support
6. **Payment**: Premium calculation and M-PESA STK Push
7. **Confirmation**: Policy details, receipt generation, and next actions

## 🎯 Production Features

### Business Logic
- **Dynamic Premium Calculation**: Based on vehicle type, age, value, and risk factors
- **Statutory Fees**: Automatic calculation of levies (Training Levy, PCF, Stamp Duty)
- **Minimum Premiums**: Enforced minimums per vehicle category
- **Policy Duration Options**: 1, 3, 6, or 12-month terms

### Security & Validation
- **Document Validation**: File type and size restrictions
- **Form Validation**: Real-time field validation with helpful messages
- **Payment Security**: Secure M-PESA integration patterns
- **Input Sanitization**: Protection against malicious inputs

### UX Enhancements
- **Quick Actions**: Prominent motor insurance button on home screen
- **Progress Tracking**: Visual stepper with clickable navigation
- **Auto-Fill**: Sample data for testing and AKI data population
- **Error Recovery**: Clear error messages with recovery options

## 📊 Sample Data

The app includes a "Test" button that pre-fills realistic sample data:
- **Vehicle**: Toyota Corolla 2020 (KCA123A)
- **Owner**: John Kamau Mwangi
- **Coverage**: Comprehensive Insurance
- **Premium**: ~KES 67,500 (calculated dynamically)

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
