# JIRA-Style Issue Tracker

A comprehensive issue tracking system built with Angular 18 and ASP.NET Core 8, featuring project management, Kanban boards, and team collaboration.

## Features

### 🚀 Core Functionality
- **Project Management**: Create, edit, and manage projects with team members
- **Issue Tracking**: Full CRUD operations for issues with status tracking
- **Kanban Board**: Drag-and-drop interface for issue status management
- **Team Collaboration**: Add/remove team members with role-based permissions
- **Comment System**: Threaded comments on issues with timestamps
- **Authentication**: JWT-based authentication with email/password

### 🎯 Project Features
- Project ownership and membership management
- Role-based access control (Owner, Admin, Member)
- Issue count and member statistics
- Project descriptions and metadata

### 📋 Issue Management
- Issue types: Task, Bug, Feature, Epic
- Priority levels: Low, Medium, High, Critical
- Status tracking: Todo, In Progress, In Review, Done
- Assignment to multiple team members
- Rich descriptions and titles

### 💬 Comments
- Real-time commenting on issues
- User attribution with timestamps
- Delete permissions for comment authors
- Threaded conversation support

## Tech Stack

### Backend
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core 8** - ORM for database operations
- **SQL Server** - Database (LocalDB for development)
- **JWT Authentication** - Secure token-based auth
- **BCrypt** - Password hashing
- **FluentValidation** - Input validation
- **AutoMapper** - Object mapping

### Frontend
- **Angular 18** - Modern web framework
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Angular CDK** - Drag & Drop functionality
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server or SQL Server LocalDB
- Visual Studio Code or Visual Studio

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd Backend/IssueTracker.API
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Update the connection string in `appsettings.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=IssueTrackerDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

4. **Create and run database migrations:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Run the API:**
   ```bash
   dotnet run
   ```
   The API will be available at `https://localhost:7000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update the API URL in `src/environments/environment.ts`:**
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7000/api'
   };
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

## Usage

### Getting Started
1. **Register a new account** or login with existing credentials
2. **Create your first project** from the Projects dashboard
3. **Add team members** by email address with appropriate roles
4. **Create issues** and organize them on the Kanban board
5. **Collaborate** through comments and issue assignments

### Project Management
- **Create Projects**: Click "New Project" on the dashboard
- **Manage Members**: Add members by email, assign roles (Member/Admin)
- **Project Settings**: Edit project details (owners only)

### Issue Workflow
1. **Create Issues**: Use the "New Issue" button on the Kanban board
2. **Set Properties**: Define type, priority, description, and assignees
3. **Track Progress**: Drag issues between columns (Todo → In Progress → In Review → Done)
4. **Collaborate**: Add comments and discuss solutions
5. **Complete**: Move to "Done" when finished

### Permissions
- **Project Owners**: Full control over project settings and membership
- **Project Admins**: Can manage issues and comments within the project
- **Project Members**: Can create and modify issues, add comments

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get user's projects
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/members` - Add member
- `DELETE /api/projects/{id}/members/{memberId}` - Remove member

### Issues
- `GET /api/issues/project/{projectId}` - Get project issues
- `GET /api/issues/{id}` - Get issue details
- `POST /api/issues` - Create new issue
- `PUT /api/issues/{id}` - Update issue
- `DELETE /api/issues/{id}` - Delete issue

### Comments
- `POST /api/issues/{issueId}/comments` - Add comment
- `DELETE /api/issues/comments/{commentId}` - Delete comment

## Database Schema

### Core Entities
- **Users**: Authentication and user profiles
- **Projects**: Project information and ownership
- **ProjectMembers**: Many-to-many relationship with roles
- **Issues**: Issue tracking with status, priority, and type
- **IssueAssignments**: Many-to-many issue assignments
- **Comments**: Issue comments with authorship

### Relationships
- Users can own multiple Projects
- Projects have multiple Members (Users)
- Projects contain multiple Issues
- Issues can have multiple Assignees (Users)
- Issues have multiple Comments from Users

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt for secure password storage
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation with FluentValidation
- **CORS Configuration**: Secure cross-origin requests

## Development

### Adding New Features
1. **Backend**: Add controllers, services, and DTOs in the API project
2. **Frontend**: Create components in the appropriate feature modules
3. **Database**: Use EF Core migrations for schema changes

### Code Structure
```
Backend/
├── Controllers/     # API endpoints
├── Services/        # Business logic
├── Models/          # Entity models
├── DTOs/           # Data transfer objects
├── Data/           # Database context
└── Program.cs      # Application configuration

Frontend/
├── core/           # Shared services and models
├── features/       # Feature modules (auth, projects, issues)
├── shared/         # Shared components
└── environments/   # Environment configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
