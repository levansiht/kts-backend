# Changelog

All notable changes to KTS Backend will be documented in this file.

## [2.0.0] - 2024-12-10

### 🎉 Major Release - PostgreSQL Migration & New Features

### Added

#### Database & Infrastructure

- ✅ PostgreSQL database integration with Docker
- ✅ TypeORM configuration and setup
- ✅ Database migration scripts
- ✅ Proper database indexing for performance
- ✅ Docker Compose for PostgreSQL

#### Authentication & Security

- ✅ Enhanced error handling in auth module
- ✅ Email validation
- ✅ Account status checking
- ✅ Logout endpoint
- ✅ Get current user endpoint
- ✅ Better security practices

#### Payment System (NEW)

- ✅ Payment module with Sepay integration
- ✅ Transaction management system
- ✅ User balance tracking
- ✅ Deposit functionality
- ✅ Webhook handler for Sepay
- ✅ Transaction history with pagination
- ✅ Atomic database transactions

#### History Tracking (NEW)

- ✅ History module for tracking API usage
- ✅ Track all Gemini API calls
- ✅ Cost tracking per action
- ✅ Performance metrics (processing time)
- ✅ Success/failure tracking
- ✅ Statistics endpoint
- ✅ Filter by action type and status
- ✅ Pagination support

#### User Profile (NEW)

- ✅ User controller for profile management
- ✅ Get/Update profile endpoint
- ✅ Change password functionality
- ✅ Update email with verification
- ✅ Get balance endpoint
- ✅ Avatar support
- ✅ Phone number field

#### API Improvements

- ✅ Standardized response format
- ✅ Response helper utility
- ✅ Enhanced error responses
- ✅ Better validation messages
- ✅ Consistent status codes

#### Database Entities

- ✅ Updated User entity with balance, phone, avatar
- ✅ New Transaction entity
- ✅ New GeminiHistory entity
- ✅ Proper relationships and indexes

#### Documentation

- ✅ Complete API documentation
- ✅ Migration guide
- ✅ Quick start guide
- ✅ Implementation summary
- ✅ Updated README
- ✅ Example integration code

### Changed

#### Database

- 🔄 Migrated from SQLite to PostgreSQL
- 🔄 Updated TypeORM configuration
- 🔄 Changed database connection setup

#### Error Handling

- 🔄 Improved global exception filter
- 🔄 Never expose 500 errors in production
- 🔄 Better error messages
- 🔄 Type-safe error responses

#### Code Structure

- 🔄 Better folder organization
- 🔄 Improved naming conventions
- 🔄 More reusable utilities
- 🔄 Type-safe everywhere

### Removed

#### Dependencies

- ❌ Removed better-sqlite3 (SQLite)
- ❌ Removed SQLite database file

### Fixed

- 🐛 Fixed error handling to prevent crashes
- 🐛 Fixed validation error formatting
- 🐛 Fixed type safety issues
- 🐛 Fixed async/await issues

### Technical Details

#### New Dependencies

```json
{
  "pg": "^8.13.1",
  "axios": "^1.7.9"
}
```

#### Removed Dependencies

```json
{
  "better-sqlite3": "^12.5.0"
}
```

#### Database Schema

- **users**: 10 columns with indexes
- **transactions**: 14 columns with 3 indexes
- **gemini_histories**: 13 columns with 2 indexes

#### API Endpoints

- Total: 19 new endpoints
- Auth: 4 endpoints
- User: 5 endpoints
- Payment: 4 endpoints
- History: 5 endpoints
- Gemini: All existing maintained

### Migration Notes

**Breaking Changes:**

- Database change requires migration from SQLite to PostgreSQL
- All existing SQLite data will need to be migrated manually
- New environment variables required

**Upgrade Path:**

1. Backup existing SQLite data
2. Setup PostgreSQL with Docker
3. Update environment variables
4. Run application (auto-creates tables in dev)
5. Manually migrate data if needed

### Performance Improvements

- ✅ Database indexing on frequently queried columns
- ✅ Pagination on all list endpoints
- ✅ Efficient queries with TypeORM
- ✅ Connection pooling with PostgreSQL

### Security Enhancements

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token expiration
- ✅ Account status checking
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Environment variable protection

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Added

- ✅ NestJS backend setup
- ✅ Google Gemini AI integration
- ✅ Basic authentication with JWT
- ✅ SQLite database
- ✅ User management
- ✅ CORS configuration
- ✅ Global error handling
- ✅ Request logging
- ✅ Environment configuration

#### Gemini Features

- ✅ Describe interior images
- ✅ Describe masterplan
- ✅ Generate images
- ✅ Upscale images
- ✅ Change materials
- ✅ Various utility endpoints

---

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

## Legend

- ✅ Added
- 🔄 Changed
- ❌ Removed/Deprecated
- 🐛 Fixed
- 🔒 Security
- 📝 Documentation
