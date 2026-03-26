# DREAMNEST AI: AN AI-POWERED INTERIOR DESIGN AND VENDOR SOURCING PLATFORM

## Cover Page

**A PROJECT REPORT**

**Submitted by:**  
Replace with actual team number, team member names, and enrollment numbers

**Submitted to:**  
School of Computer Science Engineering and Technology  
Bennett University, Greater Noida, Uttar Pradesh, India

**Month and Year:**  
April 2026

---

## DECLARATION

We hereby declare that the work presented in this project report entitled **“DreamNest AI: An AI-Powered Interior Design and Vendor Sourcing Platform”** is an authentic record of our own original work carried out at the School of Computer Science Engineering and Technology, Bennett University, Greater Noida, during the academic session 2025-2026.

We further declare that the matter embodied in this report has not been submitted, either in part or in full, for the award of any other degree, diploma, or certificate in this or any other institution.

Replace this section in the final document with the names, enrollment numbers, date, and signatures of all team members as required by the department format.

---

## ACKNOWLEDGEMENT

We express our sincere gratitude to our faculty mentor and project guide for their consistent support, technical guidance, and constructive feedback throughout the development of DreamNest AI. Their suggestions helped us shape the project into a practical and academically meaningful solution.

We are also thankful to the School of Computer Science Engineering and Technology, Bennett University, for providing the academic environment and infrastructure necessary for carrying out this work. The opportunity to apply software engineering, database design, and artificial intelligence concepts in a full-stack project has been highly valuable.

We would also like to acknowledge the contribution of our peers and reviewers whose inputs during testing and evaluation helped improve the usability, reliability, and overall quality of the platform.

---

## LIST OF TABLES

Suggested entries for this section are:

1. Functional Modules of DreamNest AI  
2. Technology Stack Used in DreamNest AI  
3. Database Tables and Their Purpose  
4. User Roles and Access Capabilities  
5. Core API Endpoints and Their Function  

---

## LIST OF FIGURES

Suggested entries for this section are:

1. Overall Architecture of DreamNest AI  
2. Workflow of Project Creation and Planning  
3. Database Entity Relationship Diagram  
4. Dashboard Interface  
5. Project Workspace Interface  
6. Vendor Popup and Detailed View  
7. Product Recommendation and Marketplace View  
8. Authentication Flow  

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

Interior design planning is generally a fragmented process in which users rely on separate tools for inspiration, budgeting, shopping, and vendor communication. This creates inefficiency, inconsistency, and a lack of structured decision support. DreamNest AI has been developed to address this problem by integrating interior planning, AI-guided recommendation, product sourcing, and local vendor discovery into a single web-based platform.

DreamNest AI allows users to create room-based design projects by specifying parameters such as room type, budget, location, area, preferred style, materials, and must-have items. Based on these inputs, the system generates AI-assisted budget splits, shopping queries, Pinterest design inspiration, image-based decor suggestions, and local vendor options. In addition, the system supports product and vendor shortlisting, project tracking, feedback handling, and administrative management of vendors and products.

The frontend of the system is developed using React and Vite, while the backend is implemented using Node.js and Express. MySQL is used as the database management system, and JWT-based authentication is used to secure user sessions. AI features are integrated using Groq-hosted Llama models for both text and vision tasks.

The project demonstrates how AI can be used in a practical and workflow-oriented manner rather than as a standalone conversation tool. DreamNest AI offers a structured path from design intent to real sourcing and execution, thereby making the interior planning process more efficient, actionable, and user-friendly.

---

## INTRODUCTION

In modern home design workflows, users commonly depend on multiple disconnected platforms to complete a single interior planning task. They may use inspiration websites to explore room ideas, visit e-commerce platforms for furniture and decor products, consult local vendors separately, and maintain budgets and progress manually. This fragmented experience results in poor coordination between design inspiration and real implementation.

DreamNest AI was conceptualized as a unified interior planning system that combines design ideation, budgeting, sourcing, and vendor discovery into one digital workspace. Instead of functioning merely as a design suggestion tool, the platform is built to support the full journey of a user planning a room or home interior project. The user can create a project, define requirements, generate AI recommendations, explore market links, view local vendors, and track progress through a structured workflow.

The project is significant because it applies software engineering, database management, frontend development, backend services, and applied AI in a user-facing domain with clear practical utility. The result is a system that assists not only with “what looks good,” but also with “what to buy,” “whom to contact,” and “what to do next.”

### Problem Statement

Interior design planning suffers from a lack of integrated digital support. Users often face the following problems:

1. Design inspiration is not connected to actual purchasing decisions.  
2. Product research across multiple websites is repetitive and time-consuming.  
3. Discovering suitable local vendors is unstructured and difficult to compare.  
4. Budget allocation and project tracking are often maintained manually.  
5. Existing tools provide partial assistance, but not an end-to-end planning workflow.

Therefore, there is a need for a system that can capture user requirements, generate planning guidance, retrieve relevant products and vendors, and provide a trackable, user-friendly workflow for interior project execution.

---

## Background Research

The development of DreamNest AI is based on the intersection of interior design technology, recommendation systems, and intelligent decision-support systems. A review of existing platforms suggests that most tools in this domain specialize in one of the following areas:

1. **Visual Inspiration Platforms** such as Pinterest, which help users discover styles but do not convert inspiration into actionable sourcing or project plans.
2. **E-commerce Platforms** which provide furniture and decor listings, but are not project-centric and do not help with complete room planning.
3. **Local Discovery Platforms** which help users locate vendors, but do not connect vendor options with user-specific design preferences and project context.
4. **AI Chat or Recommendation Tools** which can suggest ideas but often do not maintain persistent user projects, structured requirements, or execution workflows.

The limitation in most existing solutions is the absence of integration. DreamNest AI addresses this by combining planning, retrieval, design support, and progress tracking in a single system.

### Proposed System

DreamNest AI is proposed as a responsive full-stack web application that acts as an interior design workspace for end users. The platform enables users to:

1. register and log in securely;
2. create and manage multiple interior design projects;
3. specify room details such as type, city, area, style, and budget;
4. add requirement notes, must-have items, and preferred colors or materials;
5. generate AI-based budget splits and planning suggestions;
6. fetch live product recommendations and curated product records;
7. retrieve relevant local vendor information;
8. obtain decor suggestions from uploaded room images;
9. explore Pinterest-style idea keywords;
10. shortlist products and vendors and monitor project progress.

This proposed system bridges the gap between conceptual design assistance and real execution-oriented planning.

### Goals and Objectives

The primary goal of DreamNest AI is to create an integrated platform that improves the process of interior planning through structured workflows and AI assistance.

The specific objectives of the project are:

1. To design and develop a secure, responsive full-stack web application for interior project planning.  
2. To provide user-specific project creation and requirement capture functionality.  
3. To integrate AI-generated planning outputs such as budget split, shopping suggestions, and decor ideas.  
4. To provide vendor discovery and product sourcing options linked to project context.  
5. To maintain persistent project state, shortlist records, and user progress.  
6. To create a practical and user-friendly interface suitable for both desktop and mobile usage.  

---

## Project Planning

### Project Lifecycle

The project followed an iterative and implementation-driven lifecycle. The main stages were:

1. **Requirement Analysis**  
   The initial stage involved identifying the fragmentation present in current interior planning workflows and defining the major system capabilities required to solve it.

2. **System Design**  
   A modular architecture was designed with separate frontend, backend, and database layers. The AI integration points, data flow, user interactions, and major routes were planned at this stage.

3. **Development and Integration**  
   Core modules such as authentication, project management, requirement handling, AI planning, vendor retrieval, product sourcing, and dashboard UI were implemented incrementally.

4. **Testing and Refinement**  
   Multiple issues such as backend startup compatibility, search route errors, mobile layout issues, and AI timeout behavior were corrected during this stage.

5. **Deployment Preparation**  
   The project was then configured for hosted deployment, including production builds, route handling, and environment-based configuration.

### Project Setup

The system is organized into a monorepo structure with clear separation of concerns:

- `frontend/` for the React-based user interface  
- `backend/` for Express-based REST APIs  
- `database/` for schema definition and related SQL assets  

The technical setup used:

- **Frontend:** React, Vite, React Router DOM, Framer Motion  
- **Backend:** Node.js, Express  
- **Database:** MySQL with `mysql2`  
- **Authentication:** JWT, bcryptjs  
- **File Handling:** Multer  
- **AI Integration:** Groq-hosted Llama text and vision models  

### Stakeholders

The major stakeholders of this project are:

1. Users planning residential interiors  
2. Vendors or service providers participating in interior execution  
3. Project mentors and faculty evaluators  
4. Administrators managing vendor and curated product records  

### Project Resources

The key resources required for this project include:

1. Development environment with Node.js and npm  
2. MySQL database server  
3. API access for AI-based features  
4. Hosting platforms for frontend and backend deployment  
5. Design and testing feedback from users and evaluators  

### Assumptions

The following assumptions were made during project development:

1. Users have access to internet-enabled devices and a stable network.  
2. The database and required environment variables are correctly configured.  
3. AI-generated outputs are assistive and do not replace professional structural or architectural approval.  
4. Vendor and product data may vary based on location and external availability.  
5. Users provide sufficiently clear input to generate relevant planning suggestions.  

---

## Project Tracking

### Tracking

Project tracking in DreamNest AI is based on real user actions rather than manually entered progress values. The system derives progress from events such as project creation, requirement entry, product shortlisting, and vendor interaction. This makes the progress mechanism more realistic and measurable.

Tracking indicators include:

1. completion of project setup;  
2. submission of design requirements;  
3. generation of AI plan;  
4. shortlisting of products;  
5. exploration and shortlisting of vendors.  

### Communication Plan

Communication within the system occurs through clear interface feedback, actionable notices, and assistant responses. DreamNest AI communicates with the user through:

1. chatbot responses;  
2. progress and validation messages;  
3. AI-generated guidance;  
4. direct vendor interaction links such as phone, WhatsApp, maps, and website access.  

From a development perspective, iterative review and feedback cycles were used to refine features and remove usability issues.

### Deliverables

The major deliverables of the project are:

1. a responsive frontend web application;  
2. a backend API system;  
3. a relational database schema;  
4. AI planning and chatbot modules;  
5. image-based decor analysis;  
6. vendor and product retrieval modules;  
7. admin and analytics support;  
8. deployment-ready project configuration.  

---

## SYSTEM ANALYSIS AND DESIGN

### Overall Description

DreamNest AI is a full-stack project-centric web application. The frontend presents the interface for user interaction, navigation, and data visualization. The backend manages business logic, authentication, API routes, AI integration, and database operations. The data layer stores all persistent information related to users, projects, vendors, requirements, products, shortlists, analytics, and feedback.

The application is designed to support a realistic workflow:

1. the user creates an account and signs in;  
2. the user creates an interior planning project;  
3. the user adds requirements and room preferences;  
4. AI services generate planning outputs;  
5. product and vendor modules provide actionable sourcing choices;  
6. the user tracks progress and moves toward execution.  

### Users and Roles

DreamNest AI includes the following user roles:

#### 1. Registered User

A registered user can:

- create and manage projects;  
- submit room requirements;  
- generate AI planning results;  
- view products and vendors;  
- shortlist products and vendors;  
- use chatbot and vision analysis features.  

#### 2. Vendor

A vendor can:

- submit application details;  
- provide profile and portfolio information through the management workflow.  

#### 3. Administrator

An administrator can:

- manage product and vendor records;  
- review vendor applications;  
- view analytics and system-level data.  

### Design diagrams/Architecture/ UML diagrams/ Flow Charts/ E-R diagrams

#### System Architecture

The architecture of DreamNest AI can be represented using three primary layers:

1. **Presentation Layer**  
   Implemented using React and Vite. It contains pages such as Landing, Authentication, Dashboard, Project Workspace, Vendors, Admin, Wishlist, and Marketplace.

2. **Application Layer**  
   Implemented using Express.js. It exposes modular REST endpoints for:
   - authentication,
   - projects,
   - requirements,
   - products,
   - vendors,
   - AI services,
   - clicks,
   - analytics,
   - feedback,
   - search.

3. **Data Layer**  
   Implemented using MySQL. It stores all persistent relational data required by the system.

#### AI Design

The AI subsystem uses Groq-hosted Llama models:

- **Text model:** `llama-3.3-70b-versatile`  
  Used for chat replies, AI planning, and Pinterest keyword generation.

- **Vision model:** `llama-3.2-90b-vision-preview`  
  Used for image-based decor suggestion generation.

The AI route layer contains fallback logic so that the application can continue to provide useful responses even if the model times out or returns malformed output.

#### Database Design

The main database entities include:

- `users`  
- `projects`  
- `project_events`  
- `requirements`  
- `products`  
- `shortlist`  
- `vendors`  
- `vendor_applications`  
- `vendor_portfolio`  
- `vendor_reviews`  
- `click_events`  
- `feedbacks`  

An ER diagram should show:

1. one-to-many relationship between `users` and `projects`;  
2. one-to-many relationship between `projects` and `requirements`;  
3. one-to-many relationship between `projects` and `project_events`;  
4. one-to-many relationship between `vendors` and `vendor_reviews`;  
5. one-to-many relationship between `vendors` and `vendor_portfolio`;  
6. many-to-many behavior between `projects` and `products` through `shortlist`.  

#### Workflow / Flow Chart

The system workflow can be represented as follows:

1. User Registration/Login  
2. Dashboard Access  
3. Project Creation  
4. Requirement Submission  
5. AI Plan Generation  
6. Product and Vendor Retrieval  
7. Shortlisting and Progress Tracking  
8. Feedback / Continued Project Management  

---

## User Interface

### UI Description

The user interface of DreamNest AI is designed to support guided interaction rather than isolated features. The dashboard serves as the primary landing area after login and provides project creation, status overview, and data retrieval support. From the dashboard, users can move into a dedicated project workspace.

The project workspace is the central operational interface of the system. It includes:

1. project summary information;  
2. requirement entry forms;  
3. AI planning actions;  
4. product recommendation previews;  
5. vendor recommendation previews;  
6. popup-based detailed product and vendor boards;  
7. chatbot and image-based decor analysis tools;  
8. deliverables and execution tracking sections.  

The interface supports both desktop and mobile layouts. A theme toggle is provided, and the layout has been optimized to reduce clutter and improve direct access to high-value actions such as recommendations and vendor exploration.

### UI Mockup

This section should contain actual screenshots from the developed system. The following screenshots are recommended:

1. Landing page  
2. Login / Signup page  
3. Dashboard page  
4. Project workspace page  
5. Product recommendation popup  
6. Vendor popup and vendor board  
7. Admin page  

Suggested figure captions:

- Figure 1: Landing interface of DreamNest AI  
- Figure 2: Authentication page  
- Figure 3: Dashboard with project creation features  
- Figure 4: Project workspace with AI planning and sourcing modules  
- Figure 5: Product recommendation board  
- Figure 6: Vendor details popup  

---

## Algorithms/Pseudo Code OF CORE FUNCTIONALITY

### Algorithm 1: User Authentication

```text
START
Receive email and password
Validate input format
Search user by email in database
If user not found:
    reject login
Compare password with stored hash
If password invalid:
    increment failure count
    apply lock if threshold exceeded
Else:
    create JWT token
    return authenticated session
END
```

### Algorithm 2: Project Creation

```text
START
Receive project title, room type, style, area, city, budget
Validate input
Insert project into database
Create project event = "created"
Return project object
END
```

### Algorithm 3: AI Planning

```text
START
Receive room type, budget, style tags, colors, and must-haves
Construct structured AI prompt
Call text model API
If valid JSON response received:
    parse budget split, shopping queries, vendor needs
Else:
    generate fallback plan
Return planning result
END
```

### Algorithm 4: Product Recommendation Retrieval

```text
START
Collect project room type, style, city, budget, colors, must-haves
Generate or receive product search queries
Fetch product data for each query
Merge all results
Remove duplicates by product URL
Group products by store/source
Balance output by category and budget ratio
Store market payload if needed
Return final recommendation set
END
```

### Algorithm 5: Vendor Retrieval

```text
START
Receive city and service preference
Load vendors from local database
If external vendor inclusion enabled:
    fetch and merge external vendor results
Normalize vendor fields
Sort by relevance and rating
Return vendor set
END
```

### Algorithm 6: Vision-Based Decor Suggestion

```text
START
Receive uploaded image
Convert image to model-supported input
Attach budget and style context
Send request to vision model
Receive decor suggestions
Return text response to user
END
```

---

## Project Closure

### Goals / Vision

The original vision of DreamNest AI was to develop an intelligent platform that assists users in planning interiors more efficiently. Over the course of development, this vision evolved into a more practical and workflow-oriented objective: to create a complete digital workspace where a user can move from idea generation to vendor and product exploration within one system.

The current state of the project satisfies this refined vision. The system not only provides suggestions, but also supports structured user interaction, project persistence, and actionable decision pathways.

### Delivered Solution

The delivered solution is a functional full-stack web application with the following features:

1. secure authentication and account creation;  
2. dashboard-based project creation and retrieval;  
3. room requirement capture;  
4. AI-generated planning outputs;  
5. live and curated product recommendation flows;  
6. local vendor listing and detailed popup-based review;  
7. image upload-based decor analysis;  
8. Pinterest inspiration support;  
9. project tracking, shortlisting, and workflow support;  
10. feedback and administration modules.  

In summary, the delivered system is a usable and technically complete prototype that demonstrates practical integration of web development, database design, and applied AI in the domain of interior planning.

### Remaining Work

Although the project is functional and deployment-ready, there are several areas for future improvement:

1. addition of email verification and password reset mechanisms;  
2. deeper verification workflows for vendors;  
3. improved product and vendor comparison features;  
4. enhanced floor plan and layout editing tools;  
5. stronger analytics dashboards for user behavior and sourcing patterns;  
6. better caching and optimization for larger-scale usage;  
7. multilingual support and broader accessibility enhancements.  

These improvements can further extend the system from a strong academic prototype into a more mature production-grade solution.

---

## REFERENCES

Use the citation format required by your department. Suggested references are:

1. React Documentation. Available at: https://react.dev/  
2. Vite Documentation. Available at: https://vitejs.dev/  
3. Express.js Documentation. Available at: https://expressjs.com/  
4. Node.js Documentation. Available at: https://nodejs.org/en/docs  
5. MySQL Documentation. Available at: https://dev.mysql.com/doc/  
6. JSON Web Token Introduction. Available at: https://jwt.io/introduction  
7. Groq API Documentation. Available at: https://console.groq.com/docs  
8. Pinterest Search. Available at: https://www.pinterest.com/  

---

## Final Submission Notes

Before final submission, update the following in the Word file:

1. Cover page details, including names and enrollment numbers  
2. Declaration signatures  
3. Faculty guide information  
4. Screenshots and figure captions  
5. Architecture diagram, ER diagram, and workflow diagram  
6. Final references in the required citation style  

