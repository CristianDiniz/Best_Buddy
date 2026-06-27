from django.contrib import admin
from .models import Animais


# Register your models here.
@admin.register(Animais)
class AnimaisAdmin(admin.ModelAdmin):
    readonly_fields = (
        'created_at',
        'updated_at',
    )
    list_display = (
        'nome',
        'raca',
        'sexo',
        'idade_aproximada',
        'medicamento',
        'vacinacao',
        'contato',
        'created_at',
    )
    list_filter = (
        'raca',
        'sexo',
        'idade_aproximada',
        'medicamento',
        'vacinacao',
    )

