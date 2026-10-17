from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from usuarios.models import Usuario
from animais.models import Animal


class AnimaisAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tutor = Usuario.objects.create_user(
            email="tutor@teste.com",
            password="password123",
            telefone="11988887777",
            telefone_validado=True,
            tipo="PF"
        )
        self.outro_user = Usuario.objects.create_user(
            email="outro@teste.com",
            password="password123",
            telefone="11977776666",
            telefone_validado=True,
            tipo="PF"
        )

    def test_listar_animais_publico(self):
        Animal.objects.create(
            tutor=self.tutor,
            nome="Rex",
            tipo_servico=Animal.TipoServico.ADOCAO,
            tipo_animal=Animal.TipoAnimal.CACHORRO,
            estado=Animal.Estado.SP,
            cidade="São Paulo",
            telefone_contato="11988887777"
        )
        res = self.client.get("/api/animais/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_criar_animal_autenticado_com_telefone(self):
        self.client.force_authenticate(user=self.tutor)
        payload = {
            "nome": "Bidu",
            "tipo_servico": "ADOCAO",
            "tipo_animal": "CACHORRO",
            "estado": "SP",
            "cidade": "Campinas",
            "telefone_contato": "11988887777",
            "sexo": "M"
        }
        res = self.client.post("/api/animais/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["nome"], "Bidu")
        self.assertEqual(res.data["tutor_id"], self.tutor.id)

    def test_bloqueio_criacao_sem_autenticacao(self):
        payload = {
            "nome": "Sem Auth",
            "tipo_servico": "ADOCAO",
            "tipo_animal": "GATO",
            "estado": "SP",
            "cidade": "Santos",
            "telefone_contato": "11988887777"
        }
        res = self.client.post("/api/animais/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_limite_cota_5_animais_ativos(self):
        self.client.force_authenticate(user=self.tutor)
        for i in range(5):
            Animal.objects.create(
                tutor=self.tutor,
                nome=f"Pet {i}",
                tipo_servico=Animal.TipoServico.ADOCAO,
                tipo_animal=Animal.TipoAnimal.CACHORRO,
                estado=Animal.Estado.SP,
                cidade="São Paulo",
                telefone_contato="11988887777",
                status=Animal.StatusAnimal.DISPONIVEL
            )
        # 6º animal deve ser barrado
        payload = {
            "nome": "Pet Excedente",
            "tipo_servico": "ADOCAO",
            "tipo_animal": "CACHORRO",
            "estado": "SP",
            "cidade": "São Paulo",
            "telefone_contato": "11988887777"
        }
        res = self.client.post("/api/animais/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Limite atingido", str(res.data))

    def test_edicao_e_exclusao_apenas_pelo_tutor(self):
        pet = Animal.objects.create(
            tutor=self.tutor,
            nome="Thor",
            tipo_servico=Animal.TipoServico.ADOCAO,
            tipo_animal=Animal.TipoAnimal.CACHORRO,
            estado=Animal.Estado.SP,
            cidade="Campinas",
            telefone_contato="11988887777"
        )
        # Outro usuário tenta editar
        self.client.force_authenticate(user=self.outro_user)
        res_edit_outro = self.client.patch(f"/api/animais/{pet.id}/", {"nome": "Thor Hacker"}, format="json")
        self.assertEqual(res_edit_outro.status_code, status.HTTP_403_FORBIDDEN)

        # Outro usuário tenta excluir
        res_del_outro = self.client.delete(f"/api/animais/{pet.id}/")
        self.assertEqual(res_del_outro.status_code, status.HTTP_403_FORBIDDEN)

        # Tutor original edita e exclui
        self.client.force_authenticate(user=self.tutor)
        res_edit_tutor = self.client.patch(f"/api/animais/{pet.id}/", {"nome": "Thor Oficial"}, format="json")
        self.assertEqual(res_edit_tutor.status_code, status.HTTP_200_OK)

        res_del_tutor = self.client.delete(f"/api/animais/{pet.id}/")
        self.assertEqual(res_del_tutor.status_code, status.HTTP_204_NO_CONTENT)
