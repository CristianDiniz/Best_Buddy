from django.shortcuts import render
from rest_framework import generics
from .models import Animais
from rest_framework.generics import ListCreateAPIView
from .serializers import AnimaisSerializer
from rest_framework.permissions import IsAuthenticated

class AnimaisViewSet(ListCreateAPIView):
    queryset = Animais.objects.all()
    serializer_class = AnimaisSerializer
    permission_classes = [IsAuthenticated]

class AnimaisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animais.objects.all()
    serializer_class = AnimaisSerializer