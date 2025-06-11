# Vidaro: Where Video Meets Insight

Vidaro is a web-based tool designed for educators and students to enable timestamped feedback directly on videos. It is ideal for sign language assessments, presentations, music practice, and more.

## Features

- Log in and sign up with Firebase authentication
- Load videos from YouTube or direct video links
- Add reaction groups with customizable feedback buttons
- Color-coded reactions using a visual palette
- Display bubble feedback at relevant timestamps
- Edit or delete individual reactions or entire groups
- Mobile/tablet responsive design

## Files

- `index.html` - Main HTML file
- `style.css` - Stylesheet for layout and design
- `app.js` - Frontend logic including Firebase integration
- `firebase-init.js` - Firebase configuration and initialization

## Deployment

You can host this project on [Vercel](https://vercel.com) or any static web host. Just upload the four files above.

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Add your deployment domain to **Authentication > Settings > Authorized Domains**.
4. Use your Firebase config values in `firebase-init.js`.

## Contact

Developed by James Blyth
