# DREAMNEST AI

## Cover Page Content

- **Project Title:** DREAMNEST AI: AN AI-POWERED INTERIOR DESIGN AND VENDOR SOURCING PLATFORM
- **Report Type:** A PROJECT REPORT
- **Team Number:** Replace with your actual team number
- **Team Members:** Replace with actual names and enrollments
- **Submitted To:** School of Computer Science Engineering and Technology, Bennett University
- **Place:** Greater Noida, Uttar Pradesh, India
- **Month and Year:** April 2026

---

## DECLARATION

I/We hereby declare that the work presented in the report entitled **“DreamNest AI: An AI-Powered Interior Design and Vendor Sourcing Platform”** is an authentic record of my/our own work carried out during the academic session 2025-2026 at the School of Computer Science Engineering and Technology, Bennett University, Greater Noida.

The matter embodied in this project report has not been submitted by me/us for the award of any other degree, diploma, or certificate in any other institution.

Replace this section with individual names, enrollment numbers, and signatures as required by the template.

---

## ACKNOWLEDGEMENT

We express our sincere gratitude to our faculty mentor, project guide, and the School of Computer Science Engineering and Technology, Bennett University, for their guidance and support during the development of DreamNest AI.

We also thank our peers and evaluators for their suggestions during the design, implementation, and testing phases of the project. Their feedback helped us improve the usability, architecture, and practical relevance of the system.

Finally, we acknowledge the availability of modern open-source web technologies, database systems, and AI APIs that enabled us to build an end-to-end interior design assistance platform with recommendation, vision analysis, and vendor discovery capabilities.

---

## LIST OF TABLES

Use Word auto-captioning if needed. Suggested table titles:

1. Functional Modules of DreamNest AI
2. Technology Stack Used in DreamNest AI
3. Database Tables and Their Purpose
4. User Roles and Permissions
5. Core API Endpoints

---

## LIST OF FIGURES

Suggested figure titles:

1. Overall System Architecture of DreamNest AI
2. Project Workflow Diagram
3. Database Entity Relationship Diagram
4. Dashboard Interface
5. Project Workspace Interface
6. Vendor Discovery and Popup View
7. Product Recommendation Marketplace
8. Authentication Workflow

---

## LIST OF ABBREVIATIONS

- **AI** - Artificial Intelligence
- **API** - Application Programming Interface
- **UI** - User Interface
- **UX** - User Experience
- **JWT** - JSON Web Token
- **DB** - Database
- **ER Diagram** - Entity Relationship Diagram
- **SQL** - Structured Query Language
- **LLM** - Large Language Model
- **CRUD** - Create, Read, Update, Delete
- **SPA** - Single Page Application

---

## ABSTRACT

DreamNest AI is a full-stack web platform designed to simplify interior design planning for end users by combining room planning, AI-assisted recommendations, live product sourcing, and local vendor discovery in one workflow. Traditional interior planning is fragmented across inspiration websites, e-commerce platforms, local vendors, and budgeting tools. DreamNest AI addresses this problem by providing a unified workspace where users can define a room, budget, design style, material preferences, and functional requirements, and then receive actionable outputs.

The system includes project creation, requirement capture, AI-assisted planning, product recommendation, Pinterest-based design inspiration, image-based decor analysis, vendor discovery, vendor shortlisting, and project tracking. The frontend is implemented using React and Vite, while the backend uses Node.js, Express, and MySQL. Authentication is secured using JWT and bcrypt-based password hashing. AI services are integrated through Groq-hosted Llama models for text and vision-based outputs. External recommendation support is also provided through vendor and shopping search integrations.

The delivered solution demonstrates how AI can be applied in a practical, consumer-facing interior design workflow rather than as a standalone chatbot. DreamNest AI improves decision-making, reduces planning friction, and provides a more structured path from design inspiration to execution.

---

## INTRODUCTION

Interior design decisions are usually spread across multiple disconnected tools. A user may browse Pinterest for inspiration, search separate e-commerce websites for products, contact local vendors manually, maintain a budget in spreadsheets, and coordinate progress using chat or notes. This fragmented process creates delays, inconsistency, and poor decision visibility.

DreamNest AI was developed as an integrated digital workspace for residential interior planning. The platform enables users to create projects based on room type, area, style, city, and budget. It then uses AI-assisted planning to generate budget splits, shopping queries, decor ideas, and next-step suggestions. In parallel, it provides access to local vendor information and product links so that the user can move from concept to sourcing and execution.

The core goal of DreamNest AI is not only to recommend ideas but to help the user progress through a realistic design workflow. It therefore combines planning, recommendation, retrieval, tracking, and execution support inside one web application.

### Problem Statement

Users planning home interiors face four major challenges:

1. Inspiration and execution are disconnected.
2. Product research is time-consuming and repetitive.
3. Local vendor discovery is unstructured and difficult to compare.
4. Budget planning and project tracking are often manual and inconsistent.

As a result, users struggle to move from design ideas to actual implementation. There is a need for a platform that can collect user requirements, generate planning guidance, retrieve relevant products and vendors, and present all information in a clear, trackable workflow.

---

## Background Research

The project is based on the convergence of three domains:

1. **Interior design planning systems**
   - Existing platforms provide inspiration or visualization, but many do not provide an integrated workflow for budgeting, sourcing, and vendor management.

2. **E-commerce and local discovery platforms**
   - Marketplaces and map-based search tools offer product and vendor data, but they are optimized for search and listing, not for project-oriented interior planning.

3. **AI-assisted decision support**
   - Modern LLMs and vision models can generate layout direction, decor suggestions, and search keywords from user inputs, making them useful for guided planning interfaces.

DreamNest AI combines these areas into a single application with persistent user projects, requirement storage, AI planning, product/vendor retrieval, and execution support.

### Proposed System

DreamNest AI is a web-based full-stack system that allows users to:

1. Register and log in securely.
2. Create room-based interior design projects.
3. Enter project requirements such as notes, colors, and must-have items.
4. Generate AI-supported budget splits and shopping queries.
5. Fetch product recommendations and external product links.
6. Discover local vendors relevant to the project city and service type.
7. Analyze uploaded room images for decor ideas.
8. Use Pinterest-based keyword generation for design inspiration.
9. Track design deliverables, vendor tasks, and project progress.

The system is designed as a project workspace instead of a simple recommendation interface.

### Goals and Objectives

The major goals of DreamNest AI are:

1. To create a centralized platform for interior design planning.
2. To reduce manual effort in product and vendor discovery.
3. To improve planning quality using AI-assisted suggestions.
4. To support structured project tracking from idea to execution.
5. To deliver a clean and usable user interface for desktop and mobile access.

The specific objectives are:

1. Build secure user authentication and project management.
2. Store project, requirement, product, and vendor data in MySQL.
3. Integrate AI APIs for planning, chat assistance, and image analysis.
4. Support vendor and product retrieval from internal and external sources.
5. Provide shortlist, progress, and feedback features for realistic usage.

---

## Project Planning

### Project Lifecycle

The DreamNest AI project followed an iterative lifecycle:

1. **Requirement identification**
   - Defined the pain points in interior planning and vendor sourcing.

2. **System design**
   - Planned the frontend, backend, database schema, AI integration points, and routing structure.

3. **Implementation**
   - Developed authentication, dashboard, project workspace, vendor module, admin module, and AI routes.

4. **Testing and debugging**
   - Fixed backend startup issues, search route issues, responsive layout problems, and chatbot timeout behavior.

5. **Deployment**
   - Frontend was configured for Vercel and backend for a hosted Node environment with MySQL support.

### Project Setup

The project was set up as a monorepo with separate `frontend`, `backend`, and `database` directories.

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Authentication:** JWT + bcrypt
- **File Uploads:** Multer
- **AI Integration:** Groq API with Llama-based text and vision models

The development workflow used modular route files, service files, and reusable frontend API wrappers.

### Stakeholders

The main stakeholders in DreamNest AI are:

1. End users planning home interiors
2. Interior-related vendors and service providers
3. Project evaluators and faculty mentors
4. System administrators managing vendors and curated products

### Project Resources

The major resources used were:

1. **Programming Languages:** JavaScript, SQL
2. **Frontend Tools:** React, Vite, React Router
3. **Backend Tools:** Node.js, Express, MySQL2
4. **Security Libraries:** bcryptjs, jsonwebtoken
5. **Media Handling:** Multer
6. **AI Services:** Groq-hosted Llama models
7. **Version Control and Deployment:** Git, Vercel, backend hosting platform

### Assumptions

The following assumptions were made during development:

1. Users have access to internet connectivity for API-based features.
2. A valid MySQL database is available for project persistence.
3. AI outputs are advisory and assistive, not final professional design approvals.
4. Vendor and product availability may change depending on location and external sources.
5. The user will provide meaningful room, style, budget, and requirement inputs for best results.

---

## Project Tracking

### Tracking

Progress tracking in DreamNest AI is implemented through project state, requirements, shortlisted products, vendor views, and vendor shortlists. The system derives project progress from linked actions rather than using a static progress value. This makes tracking more realistic and event-driven.

The following user actions contribute to measurable project progress:

1. Project creation
2. Requirement submission
3. Product shortlisting
4. Vendor exploration
5. Vendor shortlisting

### Communication Plan

The project supports communication at two levels:

1. **System-to-user communication**
   - AI chatbot replies
   - notices, alerts, and error messages
   - progress guidance and next-step suggestions

2. **User-to-vendor navigation**
   - contact actions such as call, WhatsApp, maps, and website links

Internally, the team followed iterative feedback and correction cycles to improve the product.

### Deliverables

The main deliverables of the project are:

1. Responsive frontend web application
2. Backend REST API
3. MySQL database schema
4. AI planning and chatbot integration
5. Image-based decor analysis
6. Product recommendation and vendor discovery modules
7. Admin and feedback modules
8. Deployment-ready configuration

---

## SYSTEM ANALYSIS AND DESIGN

### Overall Description

DreamNest AI is a multi-module web application. The frontend handles user interaction, visualization, and navigation. The backend exposes REST endpoints for authentication, project handling, requirements, products, vendors, AI functionality, analytics, feedback, and search. The database stores all persistent entities such as users, projects, requirements, vendors, products, and interaction logs.

The AI subsystem is used for text planning, chat assistance, Pinterest keyword generation, and image-based decor guidance. Product and vendor modules connect project inputs to practical outcomes such as real product links and local service discovery.

### Users and Roles

The system supports the following users and roles:

1. **Registered User**
   - Create and manage projects
   - Save requirements
   - Run AI planning
   - Retrieve products and vendors
   - Use chatbot and vision analysis
   - Shortlist products and vendors

2. **Vendor**
   - Submit vendor application
   - Maintain vendor profile and portfolio through administrative flow

3. **Administrator**
   - Manage vendors and applications
   - Ingest curated product data
   - View analytics

### Design diagrams/Architecture/ UML diagrams/ Flow Charts/ E-R diagrams

#### System Architecture

DreamNest AI follows a three-layer architecture:

1. **Presentation Layer**
   - React frontend with route-based pages such as Landing, Auth, Dashboard, Project, Vendors, Admin, Wishlist, and Marketplace.

2. **Application Layer**
   - Express backend with modular API routes:
     - `/api/auth`
     - `/api/projects`
     - `/api/requirements`
     - `/api/products`
     - `/api/vendors`
     - `/api/ai`
     - `/api/search`
     - `/api/analytics`
     - `/api/feedback`
     - `/api/clicks`

3. **Data Layer**
   - MySQL database storing user, project, requirement, vendor, product, shortlist, review, and analytics data.

#### AI Architecture

DreamNest AI uses Groq-hosted Llama models:

1. **Text model:** `llama-3.3-70b-versatile`
   - Used for chatbot responses, AI planning, and Pinterest keyword generation.

2. **Vision model:** `llama-3.2-90b-vision-preview`
   - Used for uploaded image analysis and decor suggestion generation.

#### Database Design

Major tables include:

1. `users`
2. `projects`
3. `project_events`
4. `requirements`
5. `products`
6. `shortlist`
7. `vendors`
8. `vendor_applications`
9. `vendor_portfolio`
10. `vendor_reviews`
11. `click_events`
12. `feedbacks`

Suggested ER relationships to include in the diagram:

- One user can have many projects
- One project can have many requirements and events
- One project can shortlist many products
- One vendor can have many portfolio items and reviews

#### Flow of Operation

1. User registers or logs in
2. User creates a project
3. User enters room requirements
4. AI plan is generated
5. Product links and vendor options are retrieved
6. User explores, shortlists, and tracks progress
7. User uses chatbot or image analysis for additional guidance

---

## User Interface

### UI Description

The UI of DreamNest AI is designed as a project workspace rather than a plain form or chat interface. The user first authenticates into the system and lands on a dashboard where projects can be created and managed. The dashboard also includes retrieval functionality for internal data lookup and a design brief wizard for project setup.

The project workspace is the central interaction area of the application. It allows users to:

1. View project summary details
2. Add design requirements
3. Run AI planning
4. View product recommendation previews
5. View vendor previews
6. Open full product and vendor boards in popup overlays
7. Use chatbot and image-based decor analysis
8. Track deliverables and execution tasks

The interface supports both laptop and phone modes. It also provides theme switching and responsive layout adjustments to improve usability across devices.

### UI Mockup

Insert screenshots from the following pages:

1. Landing page
2. Authentication page
3. Dashboard
4. Project workspace
5. Vendor popup modal
6. Product marketplace
7. Admin page

Add captions such as:

- Figure 1: Landing page of DreamNest AI
- Figure 2: User authentication interface
- Figure 3: Dashboard with project creation wizard
- Figure 4: Project workspace with AI planning and sourcing
- Figure 5: Vendor detail popup
- Figure 6: Product recommendation marketplace

---

## Algorithms/Pseudo Code OF CORE FUNCTIONALITY

### 1. Project Creation Workflow

```text
START
User logs in
User enters title, room type, style, city, area, budget
Validate fields
Store project in database
Create project event = "created"
Return project details to frontend
END
```

### 2. AI Planning Workflow

```text
START
Receive room type, budget, style tags, colors, must-haves
Build structured AI prompt
Send prompt to text model
If model response is valid JSON:
    return budget split + shopping queries + vendor needs
Else:
    return fallback plan
END
```

### 3. Product Recommendation Workflow

```text
START
Collect project room type, style, colors, must-haves
Generate shopping queries
Send product search requests
Collect results from all queries
Remove duplicate product URLs
Group products by store and category
Balance output according to budget categories
Return final recommendation list
END
```

### 4. Vendor Retrieval Workflow

```text
START
Receive project city and service filter
Fetch vendors from database
Optionally include external vendor search results
Merge and normalize vendor records
Sort by rating and relevance
Return vendor list
END
```

### 5. Chatbot Workflow

```text
START
Receive user message and optional project context
Load project progress if project ID exists
Check whether Pinterest links are needed
Send prompt to AI text model
If timeout or API failure:
    return fallback chat reply
Else:
    return generated reply and optional links
END
```

---

## Project Closure

### Goals / Vision

The original vision of DreamNest AI was to build an interior design platform that goes beyond inspiration and supports actual execution planning. During development, this vision was refined into a project-oriented workflow system that combines design brief creation, AI planning, product sourcing, vendor discovery, and execution tracking.

The final project remains aligned with the original vision, but it is now better defined as a practical decision-support platform for home interior planning rather than only an AI decor assistant.

### Delivered Solution

The delivered solution includes:

1. Secure authentication and account management
2. Dashboard-based project creation
3. Requirement capture for each project
4. AI planning for budget split and shopping queries
5. Product recommendation and marketplace handling
6. Vendor retrieval and popup-based detailed viewing
7. Image upload-based decor idea generation
8. Pinterest inspiration keyword generation
9. Project progress tracking and deliverables management
10. Feedback and analytics support

In practical terms, DreamNest AI delivers a usable web application that integrates planning, sourcing, and tracking into one interface.

### Remaining Work

Although the current version is functional, the following work can further improve the project:

1. Add email verification and password reset flows
2. Add stronger vendor verification and approval tooling
3. Add richer comparison tools for products and vendors
4. Add saved layouts, floor plan upload, and measurement-based furniture placement
5. Improve analytics and user history reporting
6. Add better caching and performance optimization for large-scale usage
7. Add deeper integration with external commerce and vendor data providers
8. Add multilingual support for broader accessibility

---

## REFERENCES

Use your final citation style required by the department. Suggested references for this project:

1. React Documentation. Available at: https://react.dev/
2. Vite Documentation. Available at: https://vitejs.dev/
3. Express.js Documentation. Available at: https://expressjs.com/
4. MySQL Documentation. Available at: https://dev.mysql.com/doc/
5. JSON Web Token Introduction. Available at: https://jwt.io/introduction
6. Groq API Documentation. Available at: https://console.groq.com/docs
7. Node.js Documentation. Available at: https://nodejs.org/en/docs
8. Pinterest Search. Available at: https://www.pinterest.com/

---

## Final Notes For Template Filling

- Replace team names, enrollment numbers, and signatures.
- Insert your faculty mentor and guide details wherever required.
- Add actual screenshots in the **UI Mockup** section.
- Add architecture diagram, ER diagram, and workflow chart as figures.
- Update month and year if your submission date differs.
- If your guide wants chapter numbering, keep the same headings and convert them into numbered headings inside Word.
