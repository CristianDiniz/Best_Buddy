from django.urls import path
from .views import RegisterView, UsuariosView, UsuariosDetailView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("", UsuariosView.as_view()),
    path("<int:pk>/", UsuariosDetailView.as_view()),
]