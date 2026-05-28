from django.contrib import admin

@admin.register(pessoa)
class pessoaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sobrenome', 'email', 'telefone')
    search_fields = ('nome', 'sobrenome', 'email')
