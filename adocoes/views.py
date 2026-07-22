from django.shortcuts import render
from rest_framework import generics
from .models import Adocao 
from rest_framework.generics import ListCreateAPIView
from .serializer import AdocoesSerializer
from rest_framework.permissions import IsAuthenticated

class AdocoesViewSet(generics.ListCreateAPIView):
    queryset = Adocao.objects.all()
    serializer_class = AdocoesSerializer
    permission_classes = [IsAuthenticated]

class AdocoesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Adocao.objects.all()
    serializer_class = AdocoesSerializer


