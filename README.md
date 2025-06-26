<!-- <p align="center">
  <img src="./readme-assets/image.png" alt="MyMind Project Banner"/>
</p> -->

<h1 align="center"><strong>MyMind: A Full-Stack Portfolio & Headless CMS</strong></h1>

<p align="center">
  <em>A personal portfolio doesn't have to be static. This is a living showcase, fully managed by a custom-built, secure content management system.</em>
</p>

<p align="center">
  <a href="https://sibisiddharth.me" target="_blank">
    <img src="https://img.shields.io/badge/Live_Portfolio-View_Site-blue?style=for-the-badge&logo=vercel" alt="Live Portfolio"/>
  </a>
  &nbsp;
  <a href="https://admin.sibisiddharth.me" target="_blank">
    <img src="https://img.shields.io/badge/Admin_Panel-Live_Site-white?style=for-the-badge&logo=react" alt="Admin Panel"/>
  </a>
</p>

---

### 📖 The Story

As a developer, I found that updating my portfolio was a chore. Every new project or skill meant diving back into the code. I wanted a better way—a system where my portfolio would be as dynamic and easy to update as a blog post.

So, I built the solution. **MyMind** is a complete full-stack application that separates content from presentation. The public portfolio is a beautiful, performant React application, but its true power lies in the engine running behind it: a secure, custom-built headless CMS.

---

### ✨ The Magic in Action

#### 🧠 Effortless Content Management
Update skills, reorder categories, and manage projects with a user-friendly drag-and-drop interface. Changes made in the admin panel are reflected on the live portfolio instantly.

<p align="center">
  <img src="./readme-assets/skills_drag_drop.png" alt="MyMind Admin Panel in Action" width="800"/>
</p>

#### 💫 A Polished Visitor Experience
The public portfolio is built with modern UI/UX principles, including lazy-loading content, fluid animations with Framer Motion, and a secure, OTP-verified system for sending messages.

<p align="center">
  <img src="./readme-assets/user_otp_verification.png" alt="MyMind Public Portfolio UI/UX" width="800"/>
</p>

---

### 🛠️ The Toolkit

This project utilizes a modern, robust, and scalable technology stack from end to end.

<p align="center">
  <!-- Frontend -->
  <div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=z&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" />
  <img src="https://img.shields.io/badge/DnD_Kit-6E40C9?style=for-the-badge&logo=javascript&logoColor=white" />
  </div>

  <br/>

  <!-- Backend -->
  <div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Nodemailer-0A0A0A?style=for-the-badge&logo=gmail&logoColor=white" />
  </div>

  <br/>

  <!-- Infra & Deployment -->
  <div align="center">
  <img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img src="https://img.shields.io/badge/Hostinger-Violet?style=for-the-badge&logo=hostinger&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/Namecheap-DD4918?style=for-the-badge&logo=namecheap&logoColor=white" />
  <img src="https://img.shields.io/badge/Certbot-3B8739?style=for-the-badge&logo=letsencrypt&logoColor=white" />
  </div>
</p>

---

### 🔒 Explore the Engine

To maintain security and follow industry best practices, the backend and admin panel code are held in a **private repository**.

This engine is the most complex part of the project, featuring:
- A complete REST API
- Dual JWT authentication systems
- File upload and image handling
- Over 10 interconnected data models

I am incredibly passionate about backend systems and would be happy to provide a private walkthrough during interviews.

---

### ⚙️ Get it Running

To run the **public-facing portfolio frontend** locally:

```bash
git clone https://github.com/sibisiddharth8/your-repo-name.git
cd your-repo-name
npm install
```

🧪 Create a .env file in the root directory:

```bash
VITE_API_BASE_URL=https://api.sibisiddharth.me/api
```

🔐 This is your deployed backend API.
If you're running a local backend, you can update it to:
http://localhost:3001/api

Then start the development server:

```bash
npm run dev
```
