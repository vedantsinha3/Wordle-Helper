# Deployment: Render + Vercel

## 1. Deploy backend (Render)

1. Go to [render.com](https://render.com) and sign in (GitHub).
2. New → Web Service.
3. Connect your GitHub repo (Wordle-Helper).
4. Settings:
   - **Name:** `wordle-helper-api` (or any name)
   - **Runtime:** Python 3
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn backend:app`
   - **Root directory:** leave blank (project root)
5. Create Web Service.
6. Wait for deploy. Copy the service URL, e.g. `https://wordle-helper-api.onrender.com`.

Ensure `answers.txt` and `allowed.txt` are committed in the repo root.

---

## 2. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. Add New → Project.
3. Import your GitHub repo.
4. Project settings:
   - **Root Directory:** `frontend` (important)
   - **Framework Preset:** Create React App (auto-detected)
   - **Environment variable:** add
     - Name: `REACT_APP_API_URL`
     - Value: your Render backend URL (e.g. `https://wordle-helper-api.onrender.com`)
5. Deploy.

---

## 3. (Optional) Restrict CORS on Render

To limit API access to your frontend only:

1. Render dashboard → your service → Environment.
2. Add variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://your-app.vercel.app` (your Vercel URL)

Then update `backend.py` to use it:

```python
origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=origins if origins != ['*'] else None)
```

---

## Local development

Backend still uses port 5001 locally. Frontend uses `http://localhost:5001` when `REACT_APP_API_URL` is not set.
