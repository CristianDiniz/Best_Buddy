import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usuarios.models import Usuario, PessoaFisica
from animais.models import Animal
from comunidade.models import Noticia, Post, AnimalDesaparecido

def seed():
    print("Iniciando seed de dados...")

    # 1. Usuário de Teste (Ana Souza)
    email_teste = "usuario@bestbuddy.com"
    user, created = Usuario.objects.get_or_create(
        email=email_teste,
        defaults={"tipo": "PF", "is_active": True}
    )
    if created:
        user.set_password("123456")
        user.save()
        PessoaFisica.objects.create(
            usuario=user,
            nome="Ana Souza",
            cpf="12345678901",
            telefone="(16) 99999-0000"
        )
        print(f"Usuário criado: {email_teste} / 123456")
    else:
        user.set_password("123456")
        user.save()
        pf, _ = PessoaFisica.objects.get_or_create(usuario=user)
        pf.nome = "Ana Souza"
        pf.cpf = "12345678901"
        pf.telefone = "(16) 99999-0000"
        pf.save()
        print(f"Usuário atualizado: {email_teste}")

    # 2. Animais de Teste
    animais_mock = [
        {"id": 1, "nome": "Max", "raca": "SRD", "sexo": "M", "idade_aproximada": "Adulto", "medicamento": "Não", "vacinacao": "Sim", "contato": "(16) 99999-0001", "descricao": "Dócil, adora brincar com bola.", "imagem": None},
        {"id": 2, "nome": "Luna", "raca": "Vira-lata caramelo", "sexo": "F", "idade_aproximada": "Filhote", "medicamento": "Não", "vacinacao": "Não", "contato": "(16) 99999-0002", "descricao": "Muito brincalhona, ótima com crianças.", "imagem": None},
        {"id": 3, "nome": "Thor", "raca": "Pastor Alemão", "sexo": "M", "idade_aproximada": "Adulto", "medicamento": "Sim", "vacinacao": "Sim", "contato": "(16) 99999-0003", "descricao": "Protetor, precisa de espaço para correr.", "imagem": None},
        {"id": 4, "nome": "Nina", "raca": "SRD", "sexo": "F", "idade_aproximada": "Idoso", "medicamento": "Sim", "vacinacao": "Sim", "contato": "(16) 99999-0004", "descricao": "Calma, ideal para apartamento.", "imagem": None},
        {"id": 5, "nome": "Bidu", "raca": "Poodle", "sexo": "M", "idade_aproximada": "Adulto", "medicamento": "Não", "vacinacao": "Sim", "contato": "(16) 99999-0005", "descricao": "Late pouco, já é castrado.", "imagem": None},
        {"id": 6, "nome": "Mel", "raca": "SRD", "sexo": "F", "idade_aproximada": "Filhote", "medicamento": "Não", "vacinacao": "Não", "contato": "(16) 99999-0006", "descricao": "Resgatada há 1 semana, em observação.", "imagem": None},
    ]

    for item in animais_mock:
        Animal.objects.update_or_create(
            id=item["id"],
            defaults={
                "nome": item["nome"],
                "raca": item["raca"],
                "sexo": item["sexo"],
                "idade_aproximada": item["idade_aproximada"],
                "medicamento": item["medicamento"],
                "vacinacao": item["vacinacao"],
                "contato": item["contato"],
                "descricao": item["descricao"],
                "imagem": item["imagem"],
            }
        )
    print(f"Animais inseridos: {Animal.objects.count()}")

    # 3. Notícias
    noticias_mock = [
        {"titulo": "Campanha de Castração e Vacinação", "resumo": "Neste sábado no Parque Central, a partir das 9h. Vagas limitadas!", "conteudo": "Traga seu pet para a campanha municipal."}
    ]
    for item in noticias_mock:
        Noticia.objects.get_or_create(
            titulo=item["titulo"],
            defaults={"resumo": item["resumo"], "conteudo": item["conteudo"]}
        )
    print(f"Notícias inseridas: {Noticia.objects.count()}")

    # 4. Posts da Comunidade
    posts_mock = [
        {"autor": "Carlos Lima", "texto": "Hoje foi dia de campanha de castração no bairro Jardim Elite. Obrigado a todos que ajudaram!"},
        {"autor": "Best Buddy ONG", "texto": "Precisamos de doações de ração para os próximos 15 dias. Ponto de coleta na sede."},
    ]
    for item in posts_mock:
        Post.objects.get_or_create(
            autor=item["autor"],
            texto=item["texto"]
        )
    print(f"Posts inseridos: {Post.objects.count()}")

    # 5. Animais Desaparecidos
    desaparecidos_mock = [
        {"nome": "Max", "local": "Jardim Botânico, São Paulo, SP", "contato": "(11) 91234-5678", "descricao": "Sumiu durante um passeio, muito medroso com estranhos."},
        {"nome": "Bela", "local": "Parque SP, Araraquara, SP", "contato": "(16) 98888-1122", "descricao": "Desapareceu após fogos de artifício."},
        {"nome": "Patrick Estrela", "local": "Jd. Carmo, Araraquara, SP", "contato": "(16) 97777-3344", "descricao": "Última vez visto perto do mercado."},
    ]
    for item in desaparecidos_mock:
        AnimalDesaparecido.objects.get_or_create(
            nome=item["nome"],
            local=item["local"],
            defaults={"contato": item["contato"], "descricao": item["descricao"]}
        )
    print(f"Animais desaparecidos inseridos: {AnimalDesaparecido.objects.count()}")
    print("Seed concluído com sucesso!")

if __name__ == '__main__':
    seed()
