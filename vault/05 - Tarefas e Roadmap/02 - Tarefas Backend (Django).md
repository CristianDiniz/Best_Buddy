# 🛠️ Roadmap — Tarefas Técnicas do Backend (Django)
tags: #backend #tarefas #codigo #drf #models #views #implementado

Este documento contém os **trechos de código exatos** e instruções de implementação aplicadas no backend Django. Todas as alterações documentadas abaixo foram **implementadas, migradas e validadas**.

---

## 1. Ajuste em `config/settings.py` (Middlewares e Mídia)

Substituir a lista `MIDDLEWARE` e adicionar configurações de mídia:

```python
# config/settings.py

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", # Deve ser o primeiro!
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Configurações de Mídia (Upload de Fotos)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## 2. Ajuste em `animais/`

### `animais/models.py`
Adicionar `descricao`, `imagem` e corrigir o acento de "Não sei":

```python
from django.db import models

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

    class OpcaoSimNao(models.TextChoices):
        SIM = 'Sim', 'Sim'
        NAO = 'Não', 'Não'
        NAO_SEI = 'Não sei', 'Não sei'

    medicamento = models.CharField(max_length=10, choices=OpcaoSimNao)
    vacinacao = models.CharField(max_length=10, choices=OpcaoSimNao)

    nome = models.CharField(max_length=50, null=True, blank=True)
    raca = models.CharField("raça", max_length=50, null=True, blank=True)
    contato = models.CharField(max_length=20)
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    imagem = models.ImageField(upload_to="animais/", blank=True, null=True, verbose_name="Foto")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['nome']

    def __str__(self):
        return self.nome or f"Animal #{self.id}"
```

### `animais/serializers.py`
Incluir `id`, `descricao` e `imagem`:
```python
from rest_framework import serializers
from .models import Animal

class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id',
            'nome',
            'raca',
            'sexo',
            'idade_aproximada',
            'medicamento',
            'vacinacao',
            'contato',
            'descricao',
            'imagem',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
```

### `animais/views.py`
Liberar leitura pública:
```python
from rest_framework import generics, permissions
from .models import Animal
from .serializers import AnimaisSerializer

class AnimaisViewSet(generics.ListCreateAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class AnimaisDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimaisSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
```

---

## 3. Ajuste em `adocoes/`

### `adocoes/models.py`
```python
from django.db import models
from django.conf import settings

class Adocao(models.Model):
    class Status(models.TextChoices):
        ABERTA = "A", "Aberta"
        FINALIZADA = "F", "Finalizada"
        CANCELADA = "C", "Cancelada"

    animal = models.ForeignKey('animais.Animal', on_delete=models.CASCADE, related_name='adocoes')
    adotante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    nome_adotante = models.CharField(max_length=100)
    email_adotante = models.EmailField()
    telefone_adotante = models.CharField(max_length=20)
    ja_teve_animais = models.CharField(max_length=10)
    ja_vacinado = models.CharField(max_length=10)
    motivacao = models.TextField()
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.ABERTA)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Adoção'
        verbose_name_plural = 'Adoções'
        ordering = ['-created_at']

    def __str__(self):
        return f"Adoção #{self.id} ({self.nome_adotante})"
```

### `adocoes/serializer.py`
```python
from rest_framework import serializers
from .models import Adocao
from animais.models import Animal

class AdocoesSerializer(serializers.ModelSerializer):
    animal_id = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(),
        source='animal'
    )

    class Meta:
        model = Adocao
        fields = [
            'id',
            'animal_id',
            'nome_adotante',
            'email_adotante',
            'telefone_adotante',
            'ja_teve_animais',
            'ja_vacinado',
            'motivacao',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']
```

---

## 4. Ajuste em `usuarios/` (CPF e Retorno de Usuário no Login)

### Atualizar `PessoaFisica` em `usuarios/models.py`:
```python
class PessoaFisica(models.Model):
    usuario = models.OneToOneField("usuarios.Usuario", on_delete=models.CASCADE, related_name="perfil_pf")
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, blank=True, null=True)
    telefone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Atualizar `RegisterUsuarioSerializer` em `usuarios/serializer.py`:
```python
class RegisterUsuarioSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tipo = serializers.ChoiceField(choices=Usuario.TipoUsuario.choices)
    nome = serializers.CharField(required=False)
    cpf = serializers.CharField(required=False)
    telefone = serializers.CharField(required=False)
    razao_social = serializers.CharField(required=False)
    cnpj = serializers.CharField(required=False)

    def create(self, validated_data):
        tipo = validated_data["tipo"]
        user = Usuario.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            tipo=tipo
        )
        if tipo == "PF":
            PessoaFisica.objects.create(
                usuario=user,
                nome=validated_data.get("nome", ""),
                cpf=validated_data.get("cpf", ""),
                telefone=validated_data.get("telefone", "")
            )
        elif tipo == "PJ":
            PessoaJuridica.objects.create(
                usuario=user,
                razao_social=validated_data.get("razao_social", ""),
                cnpj=validated_data.get("cnpj", ""),
                telefone=validated_data.get("telefone", "")
            )
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
```

---

## 5. Criação do App `comunidade`

Comando:
```bash
python manage.py startapp comunidade
```

### `comunidade/models.py`:
```python
from django.db import models

class Noticia(models.Model):
    titulo = models.CharField(max_length=200)
    resumo = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    autor = models.CharField(max_length=100)
    texto = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class AnimalDesaparecido(models.Model):
    nome = models.CharField(max_length=100)
    local = models.CharField(max_length=200)
    contato = models.CharField(max_length=50)
    descricao = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

### `comunidade/views.py`:
```python
from rest_framework import generics, permissions
from .models import Noticia, Post, AnimalDesaparecido
from .serializers import NoticiaSerializer, PostSerializer, AnimalDesaparecidoSerializer

class NoticiaListView(generics.ListAPIView):
    queryset = Noticia.objects.all().order_by('-created_at')
    serializer_class = NoticiaSerializer
    permission_classes = [permissions.AllowAny]

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

class DesaparecidoListCreateView(generics.ListCreateAPIView):
    queryset = AnimalDesaparecido.objects.all().order_by('-created_at')
    serializer_class = AnimalDesaparecidoSerializer
    permission_classes = [permissions.AllowAny]
```

### `comunidade/urls.py`:
```python
from django.urls import path
from .views import NoticiaListView, PostListCreateView, DesaparecidoListCreateView

urlpatterns = [
    path('noticias/', NoticiaListView.as_view(), name='noticias'),
    path('posts/', PostListCreateView.as_view(), name='posts'),
    path('desaparecidos/', DesaparecidoListCreateView.as_view(), name='desaparecidos'),
]
```

E em `config/urls.py`, incluir:
```python
path('api/comunidade/', include('comunidade.urls')),
```

Veja também:
- [[01 - Checklist de Correções Imediatas]]
- [[03 - Tarefas Frontend (Melhorias)]]
