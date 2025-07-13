from flask import render_template, current_app as app

@app.route('/')
def landing_page():
    """Serves the landing page."""
    return render_template('landing.html')

@app.route('/<string:slug>')
def slug_page(slug):
    """
    Serves the slug page.
    The 'slug' variable is passed to the Jinja2 template, which then
    places it in the 'data-slug' attribute for React to use.
    """
    return render_template('slug.html', slug=slug)