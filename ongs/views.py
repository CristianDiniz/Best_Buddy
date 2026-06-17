from django.shortcuts import render
from rest_framework import generics
from .models import Ong
from rest_framework.generics import ListCreateAPIView
from .serializer import OngSerializer
from rest_framework.permissions import IsAuthenticated

class OngViewSet(ListCreateAPIView):
    queryset = Ong.objects.all()
    serializer_class = OngSerializer
    permission_classes = [IsAuthenticated]

class OngDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ong.objects.all()
    serializer_class = OngSerializer


