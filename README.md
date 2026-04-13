# Gnovi's Chains - Skillchain Calculator

A specialized React application for calculating and tracing Weapon Skillchains in Final Fantasy XI. This tool allows users to manage a party of weapons, track active chains, and visualize branching paths for skillchain properties.

## Features

- Dynamic Chain Tracking: Real-time calculation of skillchain results based on game priority logic.

- Party Management: Add or remove different weapon types to see available skills.

- Branch Analysis: Visualizes all possible next steps, highlighting the priority path the game engine will select.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm (comes with Node) or yarn

## Getting Started

1.  Setup the Project
    If you haven't already, create a folder for your project and initialize it, or move your existing files into a standard React structure.

2.  Clone or move your files into a directory
    - `mkdir gnovis-chains`
    - `cd gnovis-chains`

3.  Install Dependencies
    This project requires react and react-dom. Install them using:

        - `npm install`

4.  Project Structure
    Ensure your src folder looks like this:

```
src/
├── App.js        # The main logic and UI you just updated
├── data.js       # Contains weaponskills and skillchains data objects
└── index.js      # The entry point for React
```

5.  Run Locally
    To start the development server and view the app in your browser:

        - `npm start`

    The app will typically be available at http://localhost:3000.

6.  Build for Production
    To create an optimized build of the app for deployment:

        - `npm run build`

    This will create a build/ folder containing the static assets.

## Usage

Add Weapons: Use the dropdown at the top to add weapon types to your party.

Start a Chain: Click on any Weapon Skill under "STARTING WEAPON SKILLS".

Trace: Follow the "BRANCH SKILLS" section. Buttons with a border and shadow represent the "Priority" skillchain the game will actually execute.

Toggle Theme: Use the button in the top-right corner to switch between Dark and Light modes.

## License

MIT License - feel free to use and modify for your own FXI adventures!
