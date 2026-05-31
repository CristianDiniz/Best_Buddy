from django.db import models

class Ong(models.Model):
    nome = models.CharField(max_length=100,null = False, blank=True)
    cnpj = models.CharField(max_length=20, null = False, blank=True)
    endereco = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20, null = False, blank=True)
    email = models.EmailField()

    
    update_at = models.DateTimeField(auto_now=True)
    create_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return self.nome 
    


