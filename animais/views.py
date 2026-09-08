from rest_framework import generics, permissions
from .models import Animal
from .serializers import AnimaisSerializer

class AnimaisViewSet(generics.ListCreateAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class AnimaisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]