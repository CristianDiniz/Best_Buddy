from django.urls import path
from .views import NoticiaListView, PostListCreateView, DesaparecidoListCreateView

urlpatterns = [
    path('noticias/', NoticiaListView.as_view(), name='noticias-list'),
    path('posts/', PostListCreateView.as_view(), name='posts-list-create'),
    path('desaparecidos/', DesaparecidoListCreateView.as_view(), name='desaparecidos-list-create'),
]
