"""
URL configuration for gardgear_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
import os

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("mainapp.urls")),
    path("api-auth/", include("rest_framework.urls")),
]

# Serve static and media files in development
if settings.DEBUG:
    # Serve files from dist directory (React build)
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'dist', 'assets'),
        }),
        re_path(r'^(?P<path>vite\.svg)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'dist'),
        }),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
# Catch-all: serve React app (must be last)
urlpatterns += [
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
]

