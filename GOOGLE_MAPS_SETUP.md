# Google Maps Setup for ElBasta

## 🗺️ Quick Setup Guide

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy your API key

### 2. Add to Environment Variables

Create or update your `.env.local` file in the project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Restrict API Key (Recommended)

1. Click on your API key
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your domains:
   - `localhost:3000/*` (for development)
   - `yourdomain.com/*` (for production)
4. Under **API restrictions**, select **Restrict key**
5. Select only **Maps JavaScript API** and **Geocoding API**

### 4. Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

## ✅ What's Now Available

With Google Maps integration, admins can now:

- **Click on map** to select store locations
- **Search addresses** to find exact locations
- **Drag markers** to fine-tune coordinates
- **Get automatic address** from selected coordinates
- **View locations** on Google Maps

## 🔧 Troubleshooting

- **"Google Maps not loading"**: Check your API key and API restrictions
- **"Geocoding failed"**: Ensure Geocoding API is enabled
- **"Invalid key"**: Verify the key is correct and not restricted to wrong domains

## 📱 Features

The `LocationManager` component now includes:
- Interactive Google Maps interface
- Address search functionality
- Automatic coordinate detection
- Drag-and-drop marker positioning
- Real-time address updates 