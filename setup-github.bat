@echo off
REM ======================================================
REM ZeshViv Perfumes - GitHub Setup Script
REM ======================================================
REM Run this AFTER creating your GitHub account:
REM   Email: badikuutechsolutions@gmail.com
REM ======================================================
REM Instructions:
REM 1. Create account at https://github.com/signup
REM 2. Verify email
REM 3. Install GitHub CLI: https://cli.github.com
REM 4. Run: gh auth login
REM 5. Then run this script
REM ======================================================

echo.
echo ============================================
echo  ZeshViv Perfumes - Push to GitHub
echo ============================================
echo.
echo This will:
echo  1. Create repo "zeshviv-perfumes" on GitHub
echo  2. Push all code to main branch
echo.
pause

REM Create the repo on GitHub
echo.
echo [1/4] Creating GitHub repository...
gh repo create badikuutechsolutions/zeshviv-perfumes --public --description "ZeshViv Perfumes - Mombasa's Premium Online Fragrance Store | React + Supabase + Tailwind CSS"

REM Initialize git if needed
echo.
echo [2/4] Initializing git repository...
if not exist .git (
    git init
    git branch -M main
)

REM Add all files
echo.
echo [3/4] Adding files...
git add .

REM Check if there's already a remote
git remote remove origin 2>nul
git remote add origin https://github.com/badikuutechsolutions/zeshviv-perfumes.git

REM Commit
echo.
echo [4/4] Committing and pushing...
git commit -m "Initial commit: ZeshViv Perfumes - Full-stack e-commerce with Supabase

- React 19 + TypeScript + Vite + Tailwind CSS 4
- Supabase backend (products, orders, customers, order_items)
- M-Pesa and Cash on Delivery checkout
- Business viability report included
- 12 pre-seed perfume products
- Cart with localStorage persistence
- Fully responsive design"

git push -u origin main

echo.
echo ============================================
echo  SUCCESS! Repository created and pushed!
echo ============================================
echo.
echo  Repo URL: https://github.com/badikuutechsolutions/zeshviv-perfumes
echo.
pause
