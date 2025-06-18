# Task Manager (Trello-style Clone)

A full-featured task management application built with React Native, TypeScript, and Firebase. This project provides a modern, scalable solution for team collaboration and project management with real-time synchronization.

## 🚀 Features

### Core Functionality
- **Board Management**: Create, edit, and organize multiple project boards
- **Column Organization**: Customizable columns (To Do, In Progress, Done, etc.)
- **Task Management**: Create, edit, delete, and move tasks between columns
- **Real-time Sync**: Live updates across all connected devices using Firebase
- **Drag & Drop**: Intuitive task movement with smooth animations
- **Responsive Design**: Optimized for mobile and tablet devices

### Advanced Features
- **User Authentication**: Secure login with email/password and social providers
- **Collaborative Boards**: Share boards with team members
- **Task Priorities**: Set priority levels (Low, Medium, High, Urgent)
- **Due Dates**: Set and track task deadlines with notifications
- **Labels & Tags**: Categorize tasks with custom labels
- **File Attachments**: Upload and manage task-related files
- **Activity Tracking**: Monitor board and task activity
- **Search & Filter**: Find tasks quickly with advanced search
- **Offline Support**: Work offline with sync when connection returns

### UI/UX Features
- **Modern Design**: Clean, intuitive interface with Material Design principles
- **Dark/Light Theme**: Toggle between themes for user preference
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Accessibility**: Full support for screen readers and accessibility tools
- **Keyboard Navigation**: Complete keyboard support for productivity
- **Gesture Support**: Swipe actions and touch gestures

## 🛠 Tech Stack

### Frontend
- **React Native 0.72.6**: Cross-platform mobile development
- **TypeScript 4.8.4**: Type-safe development
- **React Navigation 6**: Navigation and routing
- **React Native Reanimated 3**: Smooth animations
- **React Native Gesture Handler**: Touch and gesture handling
- **React Native Vector Icons**: Icon library

### Backend & Database
- **Firebase Firestore**: Real-time NoSQL database
- **Firebase Authentication**: User authentication and authorization
- **Firebase Storage**: File storage and management
- **Firebase Analytics**: Usage analytics and insights

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Metro**: React Native bundler

## 📱 Screenshots

*Screenshots will be added here showing the app interface*

## 🏗 Project Structure

```
TaskManager/
├── Frontend/                 # React Native application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── TaskCard.tsx
│   │   │   └── BoardColumn.tsx
│   │   ├── screens/          # Screen components
│   │   │   └── BoardScreen.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useFirebaseTasks.ts
│   │   ├── context/          # React Context providers
│   │   │   └── BoardContext.tsx
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── styles/           # Global styles and themes
│   │       └── globalStyles.ts
│   ├── package.json
│   └── README.md
├── Backend/                  # Firebase configuration
│   └── firebaseConfig.ts
├── Database/                 # SQL schema reference
│   └── sql-schema.sql
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. **Install dependencies**
   ```bash
   cd Frontend
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Download your Firebase configuration
   - Update `Backend/firebaseConfig.ts` with your Firebase credentials

4. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Run the application**
   ```bash
   # Start Metro bundler
   npm start
   
   # Run on Android
   npm run android
   
   # Run on iOS (macOS only)
   npm run ios
   ```

### Firebase Configuration

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Services**
   - **Authentication**: Enable Email/Password and Google Sign-in
   - **Firestore Database**: Create database in test mode
   - **Storage**: Enable storage for file uploads
   - **Analytics**: Enable for usage insights

3. **Update Configuration**
   Replace the placeholder values in `Backend/firebaseConfig.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Boards: users can read/write their own boards
       match /boards/{boardId} {
         allow read, write: if request.auth != null && 
           (resource.data.userId == request.auth.uid || 
            request.auth.uid in resource.data.members);
       }
       
       // Columns: users can read/write columns of their boards
       match /columns/{columnId} {
         allow read, write: if request.auth != null && 
           exists(/databases/$(database)/documents/boards/$(resource.data.boardId)) &&
           (get(/databases/$(database)/documents/boards/$(resource.data.boardId)).data.userId == request.auth.uid ||
            request.auth.uid in get(/databases/$(database)/documents/boards/$(resource.data.boardId)).data.members);
       }
       
       // Tasks: users can read/write tasks of their boards
       match /tasks/{taskId} {
         allow read, write: if request.auth != null && 
           exists(/databases/$(database)/documents/boards/$(resource.data.boardId)) &&
           (get(/databases/$(database)/documents/boards/$(resource.data.boardId)).data.userId == request.auth.uid ||
            request.auth.uid in get(/databases/$(database)/documents/boards/$(resource.data.boardId)).data.members);
       }
     }
   }
   ```

## 📊 Database Schema

The application uses Firebase Firestore as the primary database, but includes a PostgreSQL schema for reference and potential backend expansion:

### Firestore Collections
- `users`: User profiles and authentication data
- `boards`: Project boards with metadata
- `columns`: Board columns for task organization
- `tasks`: Individual tasks with all properties
- `labels`: Task categorization labels
- `attachments`: File attachments for tasks
- `notifications`: User notifications and alerts

### SQL Schema (Reference)
The `Database/sql-schema.sql` file contains a comprehensive PostgreSQL schema that can be used for:
- Understanding data relationships
- Backend API development
- Data migration planning
- Enterprise deployment

## 🔧 Development

### Available Scripts

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run test          # Run tests
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # TypeScript type checking

# Building
npm run build:android # Build Android APK
npm run build:ios     # Build iOS app
npm run clean         # Clean build files
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **React Native** best practices

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Android
1. Generate a signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. The APK will be available at:
   `android/app/build/outputs/apk/release/app-release.apk`

### iOS
1. Open the project in Xcode:
   ```bash
   open ios/TaskManager.xcworkspace
   ```

2. Configure signing and build settings
3. Archive and distribute through App Store Connect

## 🔒 Security

### Authentication
- Firebase Authentication with email/password
- Social login providers (Google, Facebook, Apple)
- Biometric authentication support
- Secure token management

### Data Protection
- Firestore security rules
- File upload restrictions
- Input validation and sanitization
- HTTPS encryption for all communications

### Privacy
- GDPR compliance features
- Data export and deletion
- Privacy policy integration
- User consent management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation as needed
- Follow the existing code style
- Test on both Android and iOS

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) for the amazing framework
- [Firebase](https://firebase.google.com/) for backend services
- [React Navigation](https://reactnavigation.org/) for navigation
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations
- [Trello](https://trello.com/) for inspiration

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@taskmanager.com
- Documentation: [docs.taskmanager.com](https://docs.taskmanager.com)

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Basic board and task management
- Firebase integration
- Drag and drop functionality
- Real-time synchronization

---

**Note**: This is a production-ready application with enterprise-level features. The SQL schema is provided for reference and potential backend expansion, but the application currently uses Firebase as the primary backend service. 
