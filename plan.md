# Personal Portfolio Website Plan

## 1. Project Overview
**Goal**: Create a high-performance, visually stunning personal portfolio to showcase projects, skills, and contact information.
**Tech Stack**: 
- **Framework**: Astro (Already initialized)
- **Styling**: Vanilla CSS (Modern, scoped, CSS Variables for theming)
- **Deployment**: Netlify or Vercel (Recommended)

## 2. Design Direction
We will aim for a **Premium, Modern Aesthetic**.
- **Theme**: Dark mode by default with vibrant accent colors (e.g., deep charcoal background, electric blue/purple gradients, glassmorphism effects).
- **Typography**: Clean sans-serif fonts (e.g., 'Inter' or 'Outfit' from Google Fonts) for readability and modern feel.
- **Interactions**: Subtle hover effects, smooth scrolling, and micro-animations to make the site feel "alive".

## 3. Site Structure (Sitemap)
**Architecture**: 100% Static Site (SSG). HTML is generated at build time for maximum performance and security. No client-side heavy SPA frameworks.

- **Header/Nav**: Links to sections/pages.
- **Home**: Hero introduction.
- **Projects**: Grid of work.
- **About**: Bio and Skills.
- **Contact**: Simple contact info.
- **Footer**: Copyright.

## 4. Development Roadmap

### Phase 0: Design Approval
- [ ] **Mockup Generation**: I will generate an image of the proposed design concept.
- [ ] **User Review**: You will review the image and give feedback.
- [ ] **v2 Mockup (if needed)**: Iterate until you say "Yes".

### Phase 1: Foundation & Styling Setup (After Design Approval)
- [ ] **Global Styles**: Implement the approved color palette and typography.
- [ ] **Layout**: Build the core `Layout.astro` structure.

### Phase 2: Core Components
- [ ] **Navigation**: Responsive navbar with hamburger menu for mobile.
- [ ] **Hero**: High-impact visual. Potential for a 3D element or abstract CSS animation.
- [ ] **Section Container**: Reusable layout wrapper for consistent padding/margins.

### Phase 3: Content Sections
- [ ] **Projects Section**: Card component with image slots, title, description, and links.
- [ ] **Skills Component**: Visual representation of tech stack (icons or styled tags).
- [ ] **About Section**: Text + Image layout.
- [ ] **Contact**: Social buttons and styled "mailto" link or form.

### Phase 4: Polish & Performance
- [ ] **Animations**: Add scroll-driven animations (elements fade in as you scroll).
- [ ] **Responsiveness**: thorough testing on mobile, tablet, and desktop.
- [ ] **SEO**: Meta tags, OpenGraph images, semantic HTML5.

### Phase 5: Deployment
- [ ] Connect to GitHub.
- [ ] Deploy to Vercel/Netlify.

## 5. Next Steps
1. Approve this plan.
2. I will start by setting up the **Design System** (Colors/Fonts) in `Layout.astro`.
3. We will build the **Hero Section** first.
