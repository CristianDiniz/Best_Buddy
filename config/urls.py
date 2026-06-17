
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/animais/', include('animais.urls')),
    path('api/adocoes/', include('adocoes.urls')),
    path('api/pessoas/', include('pessoas.urls')),
    path('api/ongs/',    include('ongs.urls')),

    path("api/token/",         TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenObtainPairView.as_view()),
]
