from django.contrib import admin
from .models import Animais



# Register your models here.
@admin.register(Animais)
class AnimaisAdmin(admin.ModelAdmin):
        list_display = ('nome', 'idade')
        search_fields = ('nome', 'especie')
        list_horizontal = ('nome', 'especie')