from rest_framework import generics, permissions, exceptions
from .models import Animal
from .serializers import AnimaisSerializer


class AnimaisViewSet(generics.ListCreateAPIView):
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Animal.objects.select_related('tutor').all()

        tipo_servico = self.request.query_params.get('tipo_servico')
        if tipo_servico:
            queryset = queryset.filter(tipo_servico__iexact=tipo_servico)

        tipo_animal = self.request.query_params.get('tipo_animal')
        if tipo_animal:
            queryset = queryset.filter(tipo_animal__iexact=tipo_animal)

        cidade = self.request.query_params.get('cidade')
        if cidade:
            queryset = queryset.filter(cidade__icontains=cidade)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status__iexact=status_param)

        tutor_id = self.request.query_params.get('tutor_id')
        if tutor_id:
            queryset = queryset.filter(tutor_id=tutor_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user)


class AnimaisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.select_related('tutor').all()
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        if instance.tutor != user and not user.is_staff and not user.is_superuser:
            raise exceptions.PermissionDenied("Você só tem permissão para editar seus próprios anúncios.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.tutor != user and not user.is_staff and not user.is_superuser:
            raise exceptions.PermissionDenied("Você só tem permissão para remover seus próprios anúncios.")
        instance.delete()