from django.contrib import admin
from .models import Ong
@admin.register(Ong)
class ongsAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'telefone', 'cnpj')
    search_fields = ('nome',)
