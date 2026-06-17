from django.shortcuts import render
from rest_framework import generics
from .models import Pessoa
from rest_framework.generics import ListCreateAPIView
from .serializer import PessoaSerializer
from rest_framework.permissions import IsAuthenticated

class PessoaViewSet(generics.ListCreateAPIView):
    queryset = Pessoa.objects.all()
    serializer_class = PessoaSerializer
    permission_classes = [IsAuthenticated]

class PessoaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pessoa.objects.all()
    serializer_class = PessoaSerializer


