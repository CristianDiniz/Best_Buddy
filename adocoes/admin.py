from django.contrib import admin
from .models import Adocao

@admin.register(Adocao)
class adocao(admin.ModelAdmin):
    list_display = (
        'nome',
        'raca', 
        'sexo', 
        'idade',
        'idade_aproximada')

    list_filter = (
        'nome',
        'idade_aproximada',
        'idade',)
    
    search_fields = (
        'nome', 
        'raca', 
        'sexo',
        'idade_aproximada',)
    
    ordering = (
        'nome',
        'idade_aproximada',
        'idade', 
        'sexo',)
