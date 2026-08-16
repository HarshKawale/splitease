# SplitEase

SplitEase is a small front-end web app for splitting bills and managing groups. The repository contains a static site under `SplitEase/v1/` (HTML, CSS, JS) and a small Flask helper (`SplitEase/flask_server.py`) to serve the static files locally.

Live demo

The site will be published to GitHub Pages automatically after the deployment workflow runs. The expected Pages URL is:

https://HarshKawale.github.io/splitease/

(If the Pages deployment is still running, wait a minute and then refresh that URL.)

Run locally

- Open the static site directly in your browser:
  - Open `SplitEase/v1/index.html` or `SplitEase/v1/home.html` in your browser.
- Or run a simple static server from the repository root:

  ```bash
  # from repo root
  python -m http.server 8000
  # then open http://localhost:8000/SplitEase/v1/
  ```

- Or run the included Flask server:

  ```bash
  pip install -r requirements.txt  # create this file if needed (Flask)
  python SplitEase/flask_server.py
  # open http://localhost:5000
  ```

Notes

- If your HTML uses absolute paths that start with `/` (for example `/assets/xxx`), you may need to update them to relative paths or add a `<base href="/splitease/">` tag in the `<head>` of your pages so assets load correctly when served from `https://<username>.github.io/splitease/`.

- To use a custom domain, configure it in the repository Settings → Pages or add a `CNAME` file.

If you want, I can also add a `requirements.txt` for the Flask server, or change the Pages workflow to publish from `docs/` instead. Let me know which you prefer.