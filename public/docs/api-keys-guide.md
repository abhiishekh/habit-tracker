# How to get API Keys

Follow these steps to obtain the necessary API keys for your integrations.

---

## 1. GitHub Personal Access Token
GitHub tokens allow the app to fetch your commit history and repository stats.

1.  Go to [GitHub Developer Settings](https://github.com/settings/tokens).
2.  Click **Generate new token** -> **Generate new token (classic)**.
3.  Give it a name (e.g., "Habit Tracker").
4.  Select the following scopes:
    - `repo` (Full control of private repositories - if you want to track private commits)
    - `user` (Read user profile data)
    - `read:org` (Read organization data)
5.  Click **Generate token** at the bottom.
6.  **Copy the token immediately**—you won't be able to see it again!

---

## 2. WakaTime API Key
WakaTime tracks your coding time directly from your IDE.

1.  Log in to your [WakaTime account](https://wakatime.com/login).
2.  Navigate to your **Settings** or go directly to [wakatime.com/settings/api-key](https://wakatime.com/settings/api-key).
3.  Copy your **Secret API Key**.
4.  Ensure you have your IDE plugin installed (VS Code, IntelliJ, etc.) for data to populate.

---

## 3. LinkedIn API Access
LinkedIn requires creating a "Developer App" to access profile and post data.

1.  Go to the [LinkedIn Developers Portal](https://www.linkedin.com/developers/).
2.  Click **Create app**.
3.  Fill in the app details:
    - **App name**: e.g., "My Journey Tracker"
    - **LinkedIn Page**: Associated with your profile/company.
    - **App logo**: Upload any square image.
4.  Go to the **Products** tab and request access to **"Share on LinkedIn"** and **"Sign In with LinkedIn"**.
5.  Once approved, go to the **Auth** tab to find your **Client ID** and **Client Secret**.
    - *Note: For simple integrations, you may need to generate a "Member Token" using their [OAuth Token Generator](https://www.linkedin.com/developers/tools/oauth/token-generator).*

---

## 4. Twitter (X) API Key
Twitter API allows tracking your social growth and posts.

1.  Visit the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2.  Sign up for a Developer Account (Free/Hobbyist level is usually enough for personal tracking).
3.  Create a **Project** and then an **App** within that project.
4.  Go to **Keys and Tokens** tab.
5.  Generate and copy:
    - **API Key**
    - **API Key Secret**
    - **Bearer Token** (Recommended for read-only access to stats)
6.  Set your App Permissions to **Read** at minimum.
