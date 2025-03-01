# terraform-scanner

This is the README for your extension "terraform-scanner". After writing up a brief description, we recommend including the following sections.

## Features

## 🛡️ Module Version Policy Enforcement

### 🔎 Automatic Scanning of Terraform Files
- On file open, save, or workspace load, the extension scans all `*.tf` files.
- It parses the files to extract **module names and versions**.
- It compares these versions against a **policy file** fetched from a remote API (`http://localhost:8000/module-versions`).

### 🚨 Diagnostics in Editor
- If a module uses a **prohibited version**, it highlights the line with an **Error Diagnostic**.
- If a module uses a **deprecated version**, it highlights the line with a **Warning Diagnostic**.
- This allows developers to catch violations directly in the editor.

---

## 📊 Combined Status Bar Indicator (Right Side)
- A status bar item displays a **summary of policy violations**:
    - ✅ All modules safe (Green checkmark)
    - ⚠️ Deprecated versions found (Yellow warning)
    - ❌ Prohibited versions found (Red error)
- The status bar item updates dynamically as files are opened or edited.
- Clicking this item opens a **webview** showing a full table of module policies.

---

## 📥 Fetch Policy from Remote Server
- On extension activation, the extension fetches module policy data from:
    - `http://localhost:8000/module-versions`
- This data is **cached in memory** to avoid repeated calls.
- On failure to fetch, the extension shows an error message.

---

## 📂 Bulk Scan on Workspace Open
- On workspace load, the extension scans **all Terraform files** (`**/*.tf`) in all folders.
- This ensures the status bar is correctly initialized even if no file is manually opened yet.

---

## 🌐 Policy Webview
- A **webview panel** (HTML table) shows the full **prohibited and deprecated versions list**.
- This allows developers to manually review the policy in one place.
- The webview is accessible via:
    - Clicking the combined status bar item
    - Command palette: `Module Policy: Show Details`

---

## 🔍 Git Integration - Staged Files Scan

### 📄 Check Staged Files Before Commit
- A dedicated **left-side status bar item** triggers a scan of **staged files**.
- Only `*.tf` files in the staging area are scanned.
- It reports (in the output terminal) whether each staged file contains:
    - ✅ Safe modules
    - ⚠️ Deprecated modules
    - ❌ Prohibited modules

### 📜 Output Terminal Reporting
- The scan result is shown in a dedicated **Output Terminal**.
- Example output:
    ```
    🔎 Scanning staged Terraform files for policy violations...
    📄 main.tf
        Line 12: Module 'xyz' uses prohibited version '2.0.0'
        Line 34: Module 'abc' uses deprecated version '1.2.3'
    ```
- This makes policy violations visible **before commit**.

---

## ⚙️ Intelligent Status Bar Persistence
- The **combined status bar item** (for prohibited/deprecated counts) does **not disappear** when:
    - User opens the output terminal
    - User triggers the staged files scan
- The item only hides if no `.tf` file has been opened or all `.tf` files are closed.

## 🚀 Setup and Development

### Prerequisites
- Node.js (latest LTS recommended)
- VS Code
- Git

---

### 📥 Clone the Repository
```bash
git clone <your-repo-url>
cd terraform-scanner
```

---

### 📦 Install Dependencies
```bash
npm install
```
