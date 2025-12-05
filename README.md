# ⛺ Kashta (كشتة) - Camping Booking Platform

<div align="center">
  <img src="./src/assets/KashtaLogo.png" alt="Kashta Logo" width="200" />
  <br />
  
  <h3>CPIT 499 Graduation Project</h3>
  <p>Faculty of Computing and Information Technology (FCIT)<br/>King Abdulaziz University (KAU)</p>

  <p>
    <a href="#about">About</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#team">Team</a>
  </p>
</div>

---

<div id="about"></div>

## 📖 About the Project (نبذة عن المشروع)

**Kashta** is a comprehensive web platform designed to revolutionize the camping experience in Saudi Arabia (specifically Jeddah). It connects camping service providers with customers who want to enjoy outdoor trips without the hassle of preparation.

The platform allows users to book tents, equipment, and full packages, select their exact camping location on an interactive map, and track their order status in real-time.

**منصة كشتة** هي تطبيق ويب متكامل يهدف لتسهيل تجربة التخييم والرحلات البرية. يربط التطبيق بين مقدمي خدمات التخييم (تأجير خيام، بكجات، معدات) وبين العملاء الباحثين عن تجربة ممتعة ومريحة، مع إمكانية تحديد الموقع بدقة ومتابعة حالة الطلب.

---

<div id="architecture"></div>

## 🏗️ System Architecture (هيكلة النظام)

To demonstrate the software engineering principles applied in this project, here are the architectural diagrams.

### 1. High-Level Architecture
This diagram illustrates the layered architecture, separating Logic, State Management, Pages, and Components.

![High Level Architecture](./docs/class-diagram-high-level.jpg)

### 2. Detailed Class Relationships
A detailed view of how components interact, including Composition and Dependency relationships.

![Detailed Class Diagram](./docs/class-diagram-detailed.jpg)

> *Note: The diagrams above illustrate the "Component-Based Architecture" used in React.*

---

<div id="features"></div>

## ✨ Key Features (المميزات)

### 👤 Customer (العميل)
- **Service Browsing:** Filter services by category (Sea/Land) or type (Single Service/Package).
- **Interactive Map:** Pick precise camping spots using Leaflet Maps (restricted to Jeddah Geo-Fence).
- **Cart & Checkout:** Manage bookings and proceed to payment securely.
- **Order Tracking:** Real-time status updates (Pending ⏳ -> Confirmed 👨‍🍳 -> Ready 🚚 -> Completed ✅).
- **Rating System:** Rate providers and write reviews.

### 🏢 Service Provider (مقدم الخدمة)
- **Service Management:** Add, edit, and delete services/packages with image uploads.
- **Order Management:** Receive orders, view locations, and update order status.
- **Performance:** Track ratings and service popularity.

### 🛡️ Admin (المسؤول)
- **Dashboard:** Visual statistics for Total Revenue, Users, and Bookings.
- **Provider Approvals:** Review and approve/reject new provider applications.
- **System Control:** Full control over services and bookings.

---

<div id="tech-stack"></div>

## 🛠️ Tech Stack (التقنيات المستخدمة)

| Category | Technology |
|----------|------------|
| **Frontend** | React.js (Vite), JavaScript (ES6+) |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **Mapping** | Leaflet, React-Leaflet, GeoSearch |
| **Routing** | React Router DOM v6 |
| **State Mgmt** | React Context API |

---

<div id="team"></div>

## 👥 Team Members (فريق العمل)

This project was developed with ❤️ by:

| Student Name | Student ID |
|--------------|------------|
| **Faris Aloufi** | **2137604** |
| **Mohammad Alamri** | **2035814** |

### 👨‍🏫 Supervised By:
**Dr. Raed Alghamdi**

---

## 🚀 How to Run (طريقة التشغيل)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR-USERNAME/kashta-project.git](https://github.com/YOUR-USERNAME/kashta-project.git)
   cd kashta-project
   ```
2. **Install dependencies:**
 ```bash
npm install
```
3. **Run the development server:**
```bash
npm run dev
```
