# Firebase Backup Guide (Windows VPS)

Since you are running a Windows VPS, you can automate your Firebase backups using the **Firebase CLI** and **Windows Task Scheduler**.

## 1. Setup Firebase CLI
1. Download and install [Node.js](https://nodejs.org/) for Windows.
2. Open PowerShell and run:
   ```powershell
   npm install -g firebase-tools
   ```
3. Login to your account:
   ```powershell
   firebase login
   ```

## 2. Manual Backup (Firestore)
To export your Firestore data to a JSON file (requires `firestore-export-import` tool):
```powershell
npm install -g firestore-export-import
```
Create a `serviceAccountKey.json` from Firebase Console (Project Settings > Service Accounts) and run:
```powershell
firestore-export-import --backup serviceAccountKey.json
```

## 3. Automated Backup Script (Batch File)
Create a file named `backup_firebase.bat` on your desktop:

```batch
@echo off
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=C:\FirebaseBackups\%TIMESTAMP%

mkdir %BACKUP_DIR%

echo Starting Firestore Backup...
npx firestore-export-import --backup C:\path\to\your\serviceAccountKey.json --output %BACKUP_DIR%\firestore_backup.json

echo Starting Auth Backup...
firebase auth:export %BACKUP_DIR%\users.json --project YOUR_PROJECT_ID

echo Backup completed at %TIMESTAMP%
pause
```

## 4. Schedule the Backup
1. Open **Task Scheduler** on Windows.
2. Create a **Basic Task**.
3. Set the trigger (e.g., Daily at 2:00 AM).
4. Set Action to **Start a Program** and select your `backup_firebase.bat`.

## 5. Cloud Backup (Recommended)
You can also enable **Google Cloud Scheduled Backups** directly in the Firebase/Google Cloud Console:
1. Go to Google Cloud Console.
2. Select your project.
3. Navigate to **Firestore > Backups**.
4. Enable scheduled backups (Daily/Weekly).

---
*Note: Ensure your VPS has enough disk space and that the Service Account has 'Cloud Datastore Owner' permissions.*
