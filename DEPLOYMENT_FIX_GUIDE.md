# Deployment Issue Resolution Guide

## 🚫 The Problem
Your deployment was failing because Vercel was trying to deploy the entire monorepo structure instead of just the Next.js web application. The errors occurred because:

1. **Monorepo Confusion**: Vercel detected multiple projects (web-app, mobile-app, Rust programs) and didn't know which to deploy
2. **Missing Build Configuration**: No specific instructions on how to build the Next.js app within the larger project structure
3. **Dependency Conflicts**: Root-level dependencies conflicted with web-app specific dependencies
4. **Wrong Build Context**: Vercel was trying to build from root instead of the web-app folder

## ✅ The Solution

### 1. **Root Level Configuration** (`/vercel.json`)
```json
{
  "version": 2,
  "name": "blue-carbon-registry",
  "builds": [
    {
      "src": "web-app/package.json",
      "use": "@vercel/next"
    }
  ],
  "installCommand": "cd web-app && npm install",
  "buildCommand": "cd web-app && npm run build",
  "outputDirectory": "web-app/.next",
  "framework": "nextjs"
}
```

### 2. **Web-App Specific Configuration** (`/web-app/vercel.json`)
```json
{
  "version": 2,
  "name": "blue-carbon-registry-web",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "devnet",
    "NEXT_PUBLIC_RPC_ENDPOINT": "https://api.devnet.solana.com",
    "NEXT_PUBLIC_PROGRAM_ID": "GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr"
  }
}
```

### 3. **Deployment Exclusions** (`.vercelignore`)
```
/.anchor
/app
/backend-bridge
/data
/documents
/migrations
/mobile-app
/programs
/shared
/target
/tests
/node_modules
Cargo.toml
Cargo.lock
Anchor.toml
```

## 🎯 What Gets Deployed Now

### **✅ Included in Deployment:**
- `/web-app/` - Next.js application
- `/web-app/src/` - React components and pages
- `/web-app/public/` - Static assets
- `/web-app/package.json` - Frontend dependencies

### **❌ Excluded from Deployment:**
- `/programs/` - Rust/Anchor smart contracts (deployed separately to Solana)
- `/mobile-app/` - React Native app (deployed to app stores)
- `/target/` - Rust build artifacts
- `/.anchor/` - Anchor framework files
- Documentation and configuration files

## 🚀 Deployment Process Now

1. **Vercel detects push to main branch**
2. **Reads root `vercel.json`** → Points to web-app folder
3. **Changes directory to web-app** → `cd web-app`
4. **Installs frontend dependencies** → `npm install`
5. **Builds Next.js application** → `npm run build`
6. **Deploys from `.next` output directory**
7. **Sets environment variables** for Solana connectivity

## 🔧 Environment Variables Set

- `NEXT_PUBLIC_SOLANA_NETWORK=devnet`
- `NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com`
- `NEXT_PUBLIC_PROGRAM_ID=GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr`

## 📱 Multiple Deployment Targets

Your project now supports multiple deployment strategies:

### **1. Web Application (Vercel)**
- **What**: Next.js frontend
- **Where**: `web-app/` folder
- **URL**: Will be your main app URL
- **Purpose**: User interface for carbon registry

### **2. Smart Contracts (Solana)**
- **What**: Rust/Anchor programs
- **Where**: `programs/` folder  
- **Network**: Solana Devnet
- **Purpose**: Blockchain logic and data storage

### **3. Mobile App (Future)**
- **What**: React Native app
- **Where**: `mobile-app/` folder
- **Target**: iOS/Android app stores
- **Purpose**: Mobile carbon credit management

## 🎉 Expected Result

After this fix, your Vercel deployments should:
- ✅ Build successfully without errors
- ✅ Deploy only the web application
- ✅ Connect to your Solana smart contracts
- ✅ Show the carbon registry dashboard
- ✅ Support wallet connections and transactions

## 🔍 Monitoring Deployments

You can monitor your deployments at:
1. **Vercel Dashboard**: Check build logs and deployment status
2. **GitHub Actions**: See if builds trigger correctly
3. **Live URL**: Test the deployed application functionality

The deployment should now work correctly and only deploy the web application portion of your Blue Carbon Registry! 🌊💚