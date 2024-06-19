from django.db import connection
from django.test import TestCase

class SSLConnectionTest(TestCase):
    def test_ssl_connection(self):
        with connection.cursor() as cursor:
            cursor.execute("SHOW ssl")
            ssl_status = cursor.fetchone()
            self.assertEqual(ssl_status[0], 'on', "SSL connection is not enabled")


if __name__ == "__main__":
    import unittest
    unittest.main()
