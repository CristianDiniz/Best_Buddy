from django.db import models


class Ong(models.Model):
    nome = models.CharField(max_length=100,unique=True)
    cnpj = models.CharField(max_length=20,unique=True)
    endereco = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20,)
    email = models.EmailField(unique=True)

    
    update_at = models.DateTimeField(auto_now=True)
    create_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return self.nome 



