from django.contrib import admin
from .models import Company, Client, Interaction, Task

admin.site.register(Company)
admin.site.register(Client)
admin.site.register(Interaction)
admin.site.register(Task)
