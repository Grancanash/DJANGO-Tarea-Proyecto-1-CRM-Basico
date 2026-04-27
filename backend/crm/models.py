from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    name = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Client(models.Model):
    STATUS_CHOICES = [
        ('prospect', 'Prospecto'),
        ('opportunity', 'Oportunidad'),
        ('client', 'Cliente'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='clients')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_clients')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='prospect')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Interaction(models.Model):
    INTERACTION_TYPES = [
        ('call', 'Llamada'),
        ('email', 'Email'),
        ('meeting', 'Reunión'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='interactions')
    agent = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} - {self.client}"


class Task(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    due_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tarea para {self.client} - {self.due_date}"
