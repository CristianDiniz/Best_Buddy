import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient

client = APIClient()

def run_tests():
    print("=== TESTE DOS ENDPOINTS DA API ===")

    # 1. Login e Token Customizado
    print("\n1. Testando POST /api/token/ ...")
    res = client.post('/api/token/', {'email': 'usuario@bestbuddy.com', 'password': '123456'}, format='json')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"Falha no login: {res.data}"
    assert 'access' in res.data, "Falta access token"
    assert 'refresh' in res.data, "Falta refresh token"
    assert 'user' in res.data, "Falta dados do user"
    assert res.data['user']['nome'] == "Ana Souza", f"Nome incorreto: {res.data['user']}"
    print(f"OK! User retornado: {res.data['user']}")
    token = res.data['access']

    # 2. Listagem de Animais (Pública)
    print("\n2. Testando GET /api/animais/ (Acesso público)...")
    res = client.get('/api/animais/')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"Falha na listagem: {res.data}"
    assert len(res.data) == 6, f"Esperado 6 animais, obtido {len(res.data)}"
    assert 'id' in res.data[0], "Falta campo id no animal"
    assert 'descricao' in res.data[0], "Falta campo descricao no animal"
    print(f"OK! Primeiro animal: {res.data[0]['nome']} (ID: {res.data[0]['id']})")

    # 3. Detalhe do Animal
    print("\n3. Testando GET /api/animais/1/ ...")
    res = client.get('/api/animais/1/')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"Falha no detalhe: {res.data}"
    assert res.data['id'] == 1
    assert res.data['nome'] == "Max"
    print(f"OK! Animal detalhado: {res.data['nome']}")

    # 4. Envio de Solicitação de Adoção
    print("\n4. Testando POST /api/adocoes/ ...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    payload_adocao = {
        "animal_id": 1,
        "nome_adotante": "Ana Souza",
        "email_adotante": "usuario@bestbuddy.com",
        "telefone_adotante": "(16) 99999-0000",
        "ja_teve_animais": "Sim",
        "ja_vacinado": "Sim",
        "motivacao": "Amo animais e tenho quintal grande."
    }
    res = client.post('/api/adocoes/', payload_adocao, format='json')
    print(f"Status: {res.status_code}")
    assert res.status_code == 201, f"Falha na adoção: {res.data}"
    assert res.data['animal_id'] == 1
    assert res.data['status'] == "A"
    print(f"OK! Adoção criada com ID #{res.data['id']} para animal #{res.data['animal_id']}")

    # 5. Comunidade: Notícias
    print("\n5. Testando GET /api/comunidade/noticias/ ...")
    res = client.get('/api/comunidade/noticias/')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200
    assert len(res.data) >= 1
    print(f"OK! Notícias: {len(res.data)}")

    # 6. Comunidade: Posts
    print("\n6. Testando GET /api/comunidade/posts/ ...")
    res = client.get('/api/comunidade/posts/')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200
    assert len(res.data) >= 2
    print(f"OK! Posts: {len(res.data)}")

    # 7. Comunidade: Desaparecidos
    print("\n7. Testando GET /api/comunidade/desaparecidos/ ...")
    res = client.get('/api/comunidade/desaparecidos/')
    print(f"Status: {res.status_code}")
    assert res.status_code == 200
    assert len(res.data) >= 3
    print(f"OK! Desaparecidos: {len(res.data)}")

    # 8. Reportar Desaparecido
    print("\n8. Testando POST /api/comunidade/desaparecidos/ ...")
    payload_desaparecido = {
        "nome": "Pipoca",
        "local": "Centro, São Carlos, SP",
        "contato": "(16) 91111-2222",
        "descricao": "Gatinho siamês de coleira azul."
    }
    res = client.post('/api/comunidade/desaparecidos/', payload_desaparecido, format='json')
    print(f"Status: {res.status_code}")
    assert res.status_code == 201
    print(f"OK! Animal desaparecido reportado com ID #{res.data['id']}")

    # 9. Cadastro de Novo Usuário (com CPF)
    print("\n9. Testando POST /api/usuarios/register/ (com CPF)...")
    import time
    ts = int(time.time())
    payload_register = {
        "email": f"novo.adotante.{ts}@teste.com",
        "password": "senhaForte123",
        "tipo": "PF",
        "nome": "João Pedro",
        "cpf": f"{ts}".zfill(11),
        "telefone": "(16) 98888-7777"
    }
    res = client.post('/api/usuarios/register/', payload_register, format='json')
    print(f"Status: {res.status_code}")
    assert res.status_code in (200, 201), f"Falha no registro: {res.data}"
    assert 'access' in res.data
    print(f"OK! Usuário registrado com sucesso e tokens gerados!")


    print("SUCESSO: TODOS OS 9 TESTES PASSARAM COM SUCESSO!")


if __name__ == '__main__':
    run_tests()
