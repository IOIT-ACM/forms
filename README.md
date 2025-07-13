# forms.ioit.acm

forms.ioit.acm is a public-facing web application to display and render forms created in the **ChapterOS**. It uses a lightweight Flask backend to serve a React frontend, which then fetches form data from the ChapterOS API.

## Architecture Overview

This application is one part of a two-part system:

1.  **ChapterOS (The "Admin" Backend):**
    *   A separate application built with Django.
    *   Used by administrators to create, design, manage, and approve forms.
    *   It exposes a public, read-only API endpoint to share form structures: `https://os.ioit.acm.org/form_builder/api/forms/public/{slug}/schema/`.

2.  **This Application (The "Public" Frontend):**
    *   Built with Flask and React.
    *   Its primary role is to provide a clean, public URL for each form.
    *   When a user visits a URL like `http://localhost:9561/some-form-slug`, this application's React frontend fetches the form's structure from the ChapterOS API and renders it for the user.

## How it Works (Technical Details)

1.  The frontend is a Single Page Application (SPA) built with React, TypeScript, and styled with Tailwind CSS.
2.  The backend is a minimal Flask server whose main job is to serve the compiled React application files.
3.  When a user navigates to a URL with a slug (e.g., `http://localhost:9561/my-form`), Flask serves the base HTML file that loads the React application.
4.  Once the React application loads in the browser, it extracts the `slug` (`my-form`) directly from the URL using the browser's `window.location.pathname` object.
5.  It then makes a `fetch` request to the ChapterOS API endpoint (`https://os.ioit.acm.org/form_builder/api/forms/public/my-form/schema/`) to get the form's structure as JSON.
6.  Finally, React dynamically renders the form on the page based on the received JSON data, or displays an appropriate message if the form is inactive or not found.

## How to Run

1.  **Install Dependencies:**
    ```bash
    # Install Python dependencies
    pip install -r requirements.txt

    # Install Node.js dependencies
    npm install
    ```

2.  **Build the Frontend:**
    This command compiles the React/TS code and places the output in `app/templates/` and `app/templates/static/`.
    ```bash
    npm run build
    ```
    For development, you can use `npm run dev` to automatically rebuild on file changes.

3.  **Run the Flask Server:**
    ```bash
    flask run
    ```

4.  **Access the Application:**
    *   **Landing Page:** [http://127.0.0.1:9561/](http://127.0.0.1:9561/)
    *   **Form Page:** `http://127.0.0.1:9561/{form-slug}`
        *   The `{form-slug}` must correspond to the slug of an active and approved form created in the ChapterOS system.
        *   **Example with a real form:** [http://127.0.0.1:9561/acm-25](http://127.0.0.1:9561/acm-25)