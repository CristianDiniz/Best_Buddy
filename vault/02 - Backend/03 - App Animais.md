# 🐶 Backend — App Animais
tags: #backend #animais #models #serializers #bugfix

## 1. Modelagem Atual (`animais/models.py`)

O modelo atual está definido como:

```python
class Animal(models.Model):
    class SexoAnimal(models.TextChoices):
        MACHO = 'M', 'Macho'
        FEMEA = 'F', 'Fêmea'
        INDETERMINADO = 'I', 'Indeterminado'
    sexo = models.CharField(max_length=1, choices=SexoAnimal)

    class IdadeAproximada(models.TextChoices):
        FILHOTE = 'Filhote'
        ADULTO = 'Adulto'
        IDOSO = 'Idoso'
    idade_aproximada = models.CharField(max_length=10, choices=IdadeAproximada)

    class Medicamento(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei' # <-- Atenção ao acento circunflexo
    medicamento = models.CharField(max_length=10, choices=Medicamento)

    class Vacina(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei' # <-- Atenção ao acento circunflexo
    vacinacao = models.CharField(max_length=10, choices=Vacina)

    nome = models.CharField(max_length=50, null=True, blank=True)
    raca = models.CharField("raça", max_length=50, null=True, blank=True)
    contato = models.CharField(max_length=15)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 2. Diagnóstico de Falhas e Soluções Aplicadas [TODOS RESOLVIDOS]

### 🟢 1. Tabela no SQLite e Migrações [RESOLVIDO]
- **Situação Anterior**: `sqlite3.OperationalError: no such table: animais_animal` devido a divergência entre `animais_animais` e `Animal`.
- **Solução Aplicada**: Tabela renomeada para `animais_animal` no `db.sqlite3` e migração `animais.0002` aplicada.

---

### 🟢 2. Serializer com campo `id` e metadados [RESOLVIDO]
- **Solução Aplicada**: Em `animais/serializers.py`, o campo `'id'`, `'descricao'`, `'imagem'` e `'created_at'` foram incluídos:
```python
class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id', 'nome', 'raca', 'sexo', 'idade_aproximada',
            'medicamento', 'vacinacao', 'contato', 'descricao',
            'imagem', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
```
Com isso, o frontend consome `animal.id` e gera os links de detalhe e formulário de adoção sem erros.

---

### 🟢 3. Campos Adicionados: `descricao` e `imagem` [RESOLVIDO]
- **Solução Aplicada**: Adicionados os campos ao modelo `Animal`:
```python
descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
imagem = models.CharField(max_length=500, blank=True, null=True, verbose_name="Foto / URL")
```
> [!NOTE]
> Optou-se por `CharField` de 500 caracteres para `imagem` para armazenar diretamente URLs completas (ex.: Unsplash / CDN) e caminhos relativos de mídia estática sem dependência de extensões binárias do Pillow no Windows/Python 3.14.

---

### 🟢 4. Permissões de Leitura Pública (`AllowAny`) [RESOLVIDO]
- **Solução Aplicada**: Em `animais/views.py`:
```python
class AnimaisViewSet(generics.ListCreateAPIView):
    queryset = Animal.objects.all().order_by('-created_at')
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
```
Visitantes podem agora listar e visualizar qualquer pet sem necessidade de token prévio.

---

### 🟢 5. Padronização de Choices [RESOLVIDO]
- Todos os campos de sim/não foram ajustados para a grafia padrão com til (`'Não sei'`).

---

Veja também:
- [[04 - App Adoções]]
- [[02 - Diagnóstico dos Bugs Atuais]]
- [[04 - Guia de Execução e Testes]]
