from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
for table in cursor.fetchall():
    print(table)
