from rest_framework import serializers
from .models import Adocao

class AdocoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adocao
        fields = '__all__'