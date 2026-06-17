from django.urls import path
from .views import PessoaViewSet, PessoaDetailView

urlpatterns = [
    path('', PessoaViewSet.as_view()),
    path("<int:pk>/",PessoaDetailView.as_view()),
]