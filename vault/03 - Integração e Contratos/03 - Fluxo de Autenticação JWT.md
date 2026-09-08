# 🔐 Integração — Fluxo de Autenticação JWT
tags: #auth #jwt #security #drf #simplejwt #tokens

## 1. Diagrama de Sequência da Autenticação

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário (Browser)
    participant Front as Frontend (login.js / client.js)
    participant Storage as localStorage (bbStorage)
    participant Back as Backend (SimpleJWT / Django)

    Usuario->>Front: Preenche email e senha e clica em Entrar
    Front->>Back: POST /api/token/ { email, password }
    alt Credenciais Válidas
        Back-->>Front: 200 OK { access, refresh, user? }
        Front->>Storage: setSession({ access, refresh, user })
        Front->>Usuario: Redireciona para /pages/home/index.html
    else Credenciais Inválidas
        Back-->>Front: 401 Unauthorized { detail: "No active account..." }
        Front->>Usuario: Exibe alerta "Email ou senha inválidos."
    end

    opt Navegação Autenticada (ex.: Quero Adotar)
        Usuario->>Front: Acessa /pages/adoption/create.html
        Front->>Storage: getAccessToken()
        alt Sem Token
            Front->>Usuario: Redireciona para login.html?next=...
        else Com Token
            Front->>Back: POST /api/adocoes/ (Header: Bearer <access_token>)
            Back-->>Front: 201 Created { id, status: "A" }
        end
    end
```

---

## 2. Estrutura dos Tokens SimpleJWT

### Access Token
- **Função**: Autenticar requisições na API.
- **Validade Recomendada**: 15 a 60 minutos.
- **Transporte**: Cabeçalho HTTP `Authorization: Bearer <access_token>`.

### Refresh Token
- **Função**: Gerar novo `access_token` sem forçar o usuário a digitar email e senha novamente.
- **Validade Recomendada**: 1 a 7 dias.
- **Endpoint**: `POST /api/token/refresh/` com payload `{"refresh": "<refresh_token>"}`.

---

## 3. Melhoria Recomendada: Token Customizado com Dados do Usuário

Por padrão, o SimpleJWT devolve apenas:
```json
{
  "access": "...",
  "refresh": "..."
}
```

Para que o frontend possa exibir o nome do usuário no topo da tela (`Navigation.js`) sem precisar fazer uma segunda requisição, implementa-se um serializer customizado no Django:

```python
# usuarios/serializer.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        nome = ""
        if self.user.tipo == "PF" and hasattr(self.user, 'perfil_pf'):
            nome = self.user.perfil_pf.nome
        elif self.user.tipo == "PJ" and hasattr(self.user, 'perfil_pj'):
            nome = self.user.perfil_pj.nome_fantasia or self.user.perfil_pj.razao_social

        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'tipo': self.user.tipo,
            'nome': nome,
        }
        return data
```

E no `config/urls.py`:
```python
from rest_framework_simplejwt.views import TokenObtainPairView
from usuarios.serializer import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    # ...
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]
```

Dessa forma, o `authService.login()` do frontend armazena diretamente `data.user` no `bbStorage.setSession()`, ativando imediatamente a saudação `"Olá, Ana"` e o avatar `"A"`.

Veja também:
- [[02 - App Usuários e Autenticação]]
- [[03 - Serviços e Camada de API]]
