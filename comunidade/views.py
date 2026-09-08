from rest_framework import generics, permissions
from .models import Noticia, Post, AnimalDesaparecido
from .serializers import NoticiaSerializer, PostSerializer, AnimalDesaparecidoSerializer

class NoticiaListView(generics.ListAPIView):
    queryset = Noticia.objects.all().order_by('-created_at')
    serializer_class = NoticiaSerializer
    permission_classes = [permissions.AllowAny]


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            nome = self.request.user.email
            if hasattr(self.request.user, 'perfil_pf') and self.request.user.perfil_pf.nome:
                nome = self.request.user.perfil_pf.nome
            serializer.save(usuario=self.request.user, autor=nome)
        else:
            serializer.save()


class DesaparecidoListCreateView(generics.ListCreateAPIView):
    queryset = AnimalDesaparecido.objects.all().order_by('-created_at')
    serializer_class = AnimalDesaparecidoSerializer
    permission_classes = [permissions.AllowAny]
