from django.contrib import admin
from .models import Animal


@admin.register(Animal)
class AnimaisAdmin(admin.ModelAdmin):
    readonly_fields = (
        'contato',
        'created_at',
        'updated_at',
    )
    list_display = (
        'nome',
        'tipo_servico',
        'tipo_animal',
        'tutor',
        'cidade',
        'status',
        'contato',
        'created_at',
    )
    list_filter = (
        'tipo_servico',
        'tipo_animal',
        'status',
        'cidade',
    )
    search_fields = (
        'nome',
        'cidade',
        'descricao',
        'tutor__email',
    )
