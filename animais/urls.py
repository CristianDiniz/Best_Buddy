from django.urls import path
from .views import AnimaisViewSet, AnimaisDetailView

urlpatterns = [
    path('', AnimaisViewSet.as_view()),
    path("<int:pk>/",AnimaisDetailView.as_view()),
]