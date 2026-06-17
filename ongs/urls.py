from django.urls import path
from .views import OngViewSet, OngDetailView

urlpatterns = [
    path('', OngViewSet.as_view()),
    path('<int:pk>/', OngViewSet.as_view()),
]